using FXWIN.Common;
using FXWIN.Common.Helpers;
using FXWIN.ConnectionHubs;
using FXWIN.Data.Provider;
using FXWIN.Data.Provider.OperationsService;
using log4net;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FxWin.WebApp.Services
{
    public class SignalService
    {
        private static readonly ILog _logger = LogManager.GetLogger(typeof(SignalService).Name);
        private const string MESSAGE_FORMAT = "[{0}] [{1}] – [{2}] – [{3}]";
        private readonly FXWinV2Entities _dataContext = new FXWinV2Entities(true);
        private ExtractionOperationsWSClient _proxy = null;
        OperationBusiness operationBusiness;
        bool isSommeErrorsInOperations;

        public SignalService()
        {
            _proxy = new ExtractionOperationsWSClient();
        }

        public async Task<string> GetOperations(string programCode, DateTime startDate, DateTime endDate, string operationsInternes)
        {
            GetListOperationsOutput operationOutput = null;
            string error = "";
            var retryCount = 0;
            var canRetry = retryCount < 3;
            Dictionary<int, string> errorMessage = new Dictionary<int, string>();
            var outMessages= string.Empty;
            try
            {
                GetListOperationsInput ReservationsInput = new GetListOperationsInput()
                {
                    principal = System.Configuration.ConfigurationManager.AppSettings["SignalUser"] ,
                    subject = System.Configuration.ConfigurationManager.AppSettings["SignalPassword"],
                    codeProgramme = programCode,
                    codeNavire = null,
                    operationsInternes = operationsInternes,
                    dateDebut = startDate,
                    dateFin = endDate,
                };

                _logger.Debug($"Calling Signal WS: {_proxy.Endpoint.ListenUri.AbsoluteUri}.");
                //_logger.Debug($"Start importing Signal operations. Criteria: {JsonConvert.SerializeObject(ReservationsInput)}.");
                HubFunctions.SendMessage($"start Calling Signal WS: {_proxy.Endpoint.ListenUri.AbsoluteUri}.");
                _logger.Debug($"Start importing Signal operations. Criteria: {JsonConvert.SerializeObject(ReservationsInput)}.");
                while (canRetry)
                {
                    try
                    {
                        operationOutput = await GetOperations(ReservationsInput);
                        HubFunctions.SendMessage($"end Calling Signal WS");
                        canRetry = false;
                    }
                    catch (Exception ex)
                    {

                        retryCount++;
                        canRetry = retryCount < 3;
                        if (!canRetry)
                        {
                            error = $"An error occurred while calling Signal ExtractionOperationsWS service: {ex.Message}\n";
                            HubFunctions.SendMessage(error);
                            _logger.Error(error);
                            throw;
                        }
                        else
                        {
                            //_logger.Debug($"An error occurred while calling Signal ExtractionOperationsWS service. Waiting for retry..");
                            HubFunctions.SendMessage($"An error occurred while calling Signal ExtractionOperationsWS service. Waiting for retry..");
                            _logger.Error($"An error occurred while calling Signal ExtractionOperationsWS service. Waiting for retry..");
                            await Task.Delay(5000 * retryCount);
                        }
                    }
                }

                if (operationOutput != null && operationOutput.listOperations != null && operationOutput.listOperations.Any() )
                {
                     if (operationOutput.returnCodes != null && operationOutput.returnCodes.Length > 0 )
                    {
                        // errorMessage.Add(operationOutput.returnCodes[0].code, operationOutput.returnCodes[0].message);
                        outMessages = "ErrorCode: " + operationOutput.returnCodes[0].code + "\n Error message: " + operationOutput.returnCodes[0].message;
                        return outMessages;
                    }
                    //var listOpe = operations.listOperations.Where(e => e.idPositionCtrm > 0).ToList();
                    outMessages = SaveOperations(operationOutput, programCode,startDate,endDate, ref errorMessage);
                    //calcul de l'exposure sur chaque opeartion par procedure stoqué 
                    //_dataContext..ExecuteStoreCommand("[compute]", new object[] { });
                }
            }
            finally
            {
                //CheckProcessCanContinue(_currentProcess, error);
            }

            return outMessages;
        }

        private async Task<GetListOperationsOutput> GetOperations(GetListOperationsInput OperationsInput)
        {
            _proxy.InnerChannel.OperationTimeout = TimeSpan.FromMinutes(10);
            var operations = await _proxy.getListOperationsAsync(OperationsInput);

            if (operations.returnCodes.Any())
            {
                string error = "";

                foreach (var returnCode in operations.returnCodes)
                {
                    error += $"{returnCode.code} : {returnCode.message} {Environment.NewLine}";
                }

                throw new InvalidOperationException($"An error occurred while getting operations from Signal. {error}");
            }

            return operations;
        }

        private void LogAndAddWarningtoData(string warn, ref IDataOutputResult<ExecutionFX> data)
        {
            IWarnings warning = new WarningMessage(warn);
            data.WarningMessage.Add(warning);
            _logger.Warn(warn);
            HubFunctions.SendMessage(warn);
        }

        public static void logMessage(string message, Category category, Priority priority)
        {
            switch (category)
            {
                case Category.Debug:
                    _logger.Debug(message);
                    break;

                case Category.Warn:
                    _logger.Warn(message);
                    break;

                case Category.Exception:
                    _logger.Error(message);
                    break;

                case Category.Info:
                    _logger.Info(message);
                    break;
            }
            if (priority == Priority.High)
            {
                HubFunctions.SendMessage(message);

            }

            
        }

        private string SaveOperations(GetListOperationsOutput operationOutput,string program,DateTime startDate,DateTime endDate, ref Dictionary<int, string> errorMessage)
        {
            var outMessages = new StringBuilder();
            if (operationOutput != null && operationOutput.returnCodes != null && operationOutput.returnCodes.Length > 0)
            {
                errorMessage.Add(operationOutput.returnCodes[0].code, operationOutput.returnCodes[0].message);
            }
            else if (operationOutput != null && operationOutput.listOperations != null && operationOutput.listOperations.Length > 0)
            {
                List<ListOperations> lstOperationOutput = operationOutput.listOperations.Where(o => string.Equals(o.codeAbattement, "0")).ToList();
                try
                {
                    //System.Diagnostics.Stopwatch sw2 = new System.Diagnostics.Stopwatch();
                    //sw2.Start();
                    using (operationBusiness = new OperationBusiness())
                    {
                        HubFunctions.SendMessage($"start Save Operations...");
                       var outmsg= operationBusiness.SaveOperations(lstOperationOutput, program, startDate, endDate, out isSommeErrorsInOperations);
                       outMessages.AppendLine(outmsg);
                       HubFunctions.SendMessage($"End Save Operations...");
                        //calcul de l'exposure sur chaque opeartion par procedure stoqué 
                        HubFunctions.SendMessage($"start compute exposure by operation ...");
                        _dataContext.ExecuteStoreCommand("[compute]", new object[] { });
                        HubFunctions.SendMessage($"end compute exposure by operation ...");
                    }
                    //sw2.Stop();
                    //Console.WriteLine("Temps traitement Operations." + (sw2.ElapsedMilliseconds / 1000).ToString() + "s" + "    " + sw2.ElapsedMilliseconds.ToString() + "ms");
                    outMessages.AppendLine("mise à jour operations + contrats réussi");
                 }
                catch (Exception exp)
                {
                    throw exp;
                }
                finally
                {
                    if (operationBusiness != null)
                        ((IDisposable)operationBusiness).Dispose();
                }
            }

            return outMessages.ToString();
        }



    }
}