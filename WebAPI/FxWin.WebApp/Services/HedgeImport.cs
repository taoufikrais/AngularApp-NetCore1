using FXWIN.Common;
using FXWIN.Common.Extensions;
using FXWIN.Common.Helpers;
using FXWIN.ConnectionHubs;
using FXWIN.Data.Provider;
using log4net;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace FxWin.WebApp.Services
{
    public class HedgeImport
    {
        private static readonly ILog logger = LogManager.GetLogger(typeof(HedgeImport).Name);
        private const string MESSAGE_FORMAT = "[{0}] [{1}] – [{2}] – [{3}]";
        private readonly FXWinV2Entities _dbContext = new FXWinV2Entities(true);
        public BaseService<ExecutionFX> _repository;

        public async void ImportKtp(string filePath)
        {
            List<ExecutionFX> ExecutionList = _dbContext.ExecutionFXes.Include("FXHedge").ToList();
            List<FXHedge> fxHedgeList = _dbContext.FXHedges.ToList();
            FileDataImportHelper<ExecutionKTP, ExecutionFX> importHelper = new FileDataImportHelper<ExecutionKTP, ExecutionFX>();
            Dictionary<int, FXHedge> modifiedFxHedge = new Dictionary<int, FXHedge>();
            Dictionary<string, ExecutionFX> executionsInError = new Dictionary<string, ExecutionFX>();
            Dictionary<string, ExecutionFX> executionsIgnored = new Dictionary<string, ExecutionFX>();
            System.Globalization.CultureInfo before = System.Threading.Thread.CurrentThread.CurrentCulture;
            try
            {
                System.Threading.Thread.CurrentThread.CurrentCulture = new System.Globalization.CultureInfo("fr-FR");
                var data = importHelper.GetData(filePath, ErrorMode.SaveAndContinue, false);
                var newExecutions = new List<ExecutionFX>();
                var oldExecutions = new List<ExecutionFX>();
                if (data.IsNotNull() && !data.HasTechnicalError)
                {
                    foreach (var item in data.ResultData)
                    {
                        if (item.IsNotNull())
                        {
                            ExecutionFX exec = ExecutionList.FirstOrDefault(e => String.Equals(e.ExecutionCode, item.ExecutionCode)
                                                                                 && String.Equals(e.FXHedge.Code, item.FXHedge.Code));
                            if (exec.IsNotNull())
                            {
                                if (exec.FXHedge.WorkflowStateId == (int)eWorkflowState.EN_COURS
                                    && exec.FXHedge.CurrencyId == item.AmountCurrencyId)
                                {
                                    exec.AllIn = item.AllIn;
                                    exec.PurchaseSaleId = item.PurchaseSaleId;
                                    exec.Nature = item.Nature;
                                    exec.Amount = item.Amount;
                                    exec.AmountCurrencyId = item.AmountCurrencyId;
                                    exec.SpotRate = item.SpotRate;
                                    exec.FwdPoint = item.FwdPoint;
                                    exec.AllIn = item.AllIn;
                                    exec.Maturity = item.Maturity;
                                    exec.ExchValue = item.ExchValue;
                                    exec.ExchCurrencyId = item.ExchCurrencyId;
                                    exec.ConfirmationNumber = item.ConfirmationNumber;
                                    //
                                    oldExecutions.Add(exec);

                                    //Check Dates
                                    string message;

                                    if (!HasSameMaturityDate(exec, exec.PurchaseSaleId, out message))
                                    {
                                        LogAndAddWarningtoData(message, ref data);
                                    }

                                    if (!modifiedFxHedge.ContainsKey(exec.FXHedge.Id))
                                        modifiedFxHedge.Add(exec.FXHedge.Id, exec.FXHedge);
                                }
                                if (exec.FXHedge.WorkflowStateId != (int)eWorkflowState.EN_COURS)
                                {
                                    string message = string.Format(MESSAGE_FORMAT, "FX hedge status in FX-Win is not \"En cours d'exécution\""
                                                         , exec.ExecutionCode
                                                         , exec.FXHedge.Code
                                                         , exec.Amount);

                                    IErrorMessage error = new ErrorMessage(ErrorMessageType.BusinessMessage, message);
                                    data.ErrorsMessage.Add(error);

                                    if (!executionsInError.ContainsKey(item.ExecutionCode))
                                        executionsInError.Add(item.ExecutionCode, item);
                                }

                                else if (exec.FXHedge.CurrencyId != item.AmountCurrencyId)
                                {
                                    string message = string.Format(MESSAGE_FORMAT, "The field \"Currency\" in file must beidentical to the FX hedge currency in FX-Win"
                                                         , exec.ExecutionCode
                                                         , exec.FXHedge.Code
                                                         , exec.Amount);

                                    IErrorMessage error = new ErrorMessage(ErrorMessageType.BusinessMessage, message);
                                    data.ErrorsMessage.Add(error);

                                    if (!executionsInError.ContainsKey(item.ExecutionCode))
                                        executionsInError.Add(item.ExecutionCode, item);
                                }
                            }

                            else
                            {
                                ExecutionFX execution = _dbContext.ExecutionFXes.FirstOrDefault(e => e.ExecutionCode == item.ExecutionCode);
                                if (execution.IsNotNull())
                                {
                                    string message = string.Format(MESSAGE_FORMAT, "SIAM# in the file already exists in FX-Win and is linked to an other FX hedge"
                                                         , execution.ExecutionCode
                                                         , execution.FXHedge.Code
                                                         , execution.Amount);

                                    IErrorMessage error = new ErrorMessage(ErrorMessageType.BusinessMessage, message);
                                    data.ErrorsMessage.Add(error);

                                    if (!executionsInError.ContainsKey(item.ExecutionCode))
                                        executionsInError.Add(item.ExecutionCode, item);
                                }

                                else
                                {
                                    FXHedge fx = _dbContext.FXHedges.FirstOrDefault(f => f.Code.Equals(item.FXHedge.Code));
                                    if (fx.IsNotNull())
                                    {
                                        if (fx.WorkflowStateId == (int)eWorkflowState.EN_COURS && fx.CurrencyId == item.AmountCurrencyId)
                                        {
                                            ExecutionFX newExecution = new ExecutionFX();
                                            newExecution.AllIn = item.AllIn;
                                            newExecution.PurchaseSaleId = item.PurchaseSaleId;
                                            newExecution.Nature = item.Nature;
                                            newExecution.Amount = item.Amount;
                                            newExecution.AmountCurrencyId = item.AmountCurrencyId;
                                            newExecution.SpotRate = item.SpotRate;
                                            newExecution.FwdPoint = item.FwdPoint;
                                            newExecution.AllIn = item.AllIn;
                                            newExecution.Maturity = item.Maturity;
                                            newExecution.ExchValue = item.ExchValue;
                                            newExecution.ExchCurrencyId = item.ExchCurrencyId;
                                            newExecution.FXHedgeId = fx.Id;
                                            newExecution.FXHedge = fx;
                                            newExecution.ExecutionCode = item.ExecutionCode;
                                            newExecution.ConfirmationNumber = item.ConfirmationNumber;

                                            newExecutions.Add(newExecution);
                                            if (!modifiedFxHedge.ContainsKey(newExecution.FXHedgeId))
                                                modifiedFxHedge.Add(newExecution.FXHedgeId, newExecution.FXHedge);

                                            //Check Dates
                                            string message;
                                            if (!HasSameMaturityDate(newExecution, newExecution.PurchaseSaleId, out message))
                                            {
                                                LogAndAddWarningtoData(message, ref data);
                                            }

                                        }
                                        else if (fx.WorkflowStateId != (int)eWorkflowState.EN_COURS)
                                        {
                                            string message = string.Format(MESSAGE_FORMAT, "FX hedge status in FX-Win is not \"En cours d'exécution\""
                                                             , item.ExecutionCode
                                                             , fx.Code
                                                             , item.Amount);


                                            IErrorMessage error = new ErrorMessage(ErrorMessageType.BusinessMessage, message);
                                            data.ErrorsMessage.Add(error);

                                            if (!executionsInError.ContainsKey(item.ExecutionCode))
                                                executionsInError.Add(item.ExecutionCode, item);
                                        }

                                        else if (fx.CurrencyId != item.AmountCurrencyId)
                                        {
                                            string message = string.Format(MESSAGE_FORMAT, "The field \"Currency\" in file must beidentical to the FX hedge currency in FX-Win"
                                                                 , item.ExecutionCode
                                                                 , fx.Code
                                                                 , item.Amount);

                                            IErrorMessage error = new ErrorMessage(ErrorMessageType.BusinessMessage, message);
                                            data.ErrorsMessage.Add(error);

                                            if (!executionsInError.ContainsKey(item.ExecutionCode))
                                                executionsInError.Add(item.ExecutionCode, item);
                                        }
                                    }
                                    else
                                    {
                                        if (!executionsIgnored.ContainsKey(item.ExecutionCode))
                                            executionsIgnored.Add(item.ExecutionCode, item);
                                    }
                                }
                            }
                        }
                    }

                    #region verification de la somme des execution
                    if (modifiedFxHedge.Values.Count > 0)
                    {
                        foreach (var fxHedge in modifiedFxHedge.Values)
                        {
                            if (fxHedge.ExecutionFXes.IsNotNull() && fxHedge.ExecutionFXes.Count > 0)
                            {
                                HedgeLeg buyLeg = fxHedge.HedgeLegs.Where(h => h.PurchaseSaleId == (int)ePurchaseSale.ACHAT).FirstOrDefault();
                                HedgeLeg saleLeg = fxHedge.HedgeLegs.Where(h => h.PurchaseSaleId == (int)ePurchaseSale.VENTE).FirstOrDefault();

                                decimal purchaseExecutionAmountSum = 0;
                                decimal saleExecutionAmountSum = 0;

                                if (buyLeg.IsNotNull())
                                {
                                    purchaseExecutionAmountSum = (from ex in fxHedge.ExecutionFXes
                                                                  where ex.PurchaseSaleId == (int)ePurchaseSale.ACHAT
                                                                      && ex.Amount.HasValue
                                                                      && buyLeg.FXHedgeId == fxHedge.Id
                                                                      && buyLeg.Maturity.ToShortDateString() == ex.Maturity.ToShortDateString()
                                                                  select ex).Sum(ex => ex.Amount.Value);
                                }

                                if (saleLeg.IsNotNull())
                                {
                                    saleExecutionAmountSum = (from ex in fxHedge.ExecutionFXes
                                                              where ex.PurchaseSaleId == (int)ePurchaseSale.VENTE
                                                                  && ex.Amount.HasValue
                                                                  && saleLeg.FXHedgeId == fxHedge.Id
                                                                  && saleLeg.Maturity.ToShortDateString() == ex.Maturity.ToShortDateString()
                                                              select ex).Sum(ex => ex.Amount.Value);
                                }

                                if (fxHedge.HedgeLegs.IsNotNull())
                                {
                                    if (fxHedge.HedgeLegs.Count == 1)
                                    {
                                        var buyHedgeLeg = fxHedge.HedgeLegs.FirstOrDefault(h => h.PurchaseSaleId == (int)ePurchaseSale.ACHAT);
                                        var saleHedgeLeg = fxHedge.HedgeLegs.FirstOrDefault(h => h.PurchaseSaleId == (int)ePurchaseSale.VENTE);

                                        if (buyHedgeLeg.IsNotNull())
                                        {
                                            bool IsInBuyError = false;
                                            decimal buyAmount = 0;

                                            if (buyHedgeLeg.Amount.HasValue)
                                            {
                                                buyAmount = buyHedgeLeg.Amount.Value;
                                            }

                                            IsInBuyError = purchaseExecutionAmountSum != buyHedgeLeg.Amount;

                                            if (IsInBuyError)
                                            {
                                                fxHedge.InternalStateId = (int)eInternalStatus.EN_ERREUR_MONTANT_EXECUTION;
                                                string warn = String.Format("Import KTP: FxHedge {0} is in error - Please Check that buy leg amount is equal to the amount sum of  Fx Execution of type buy ", fxHedge.Code);
                                                LogAndAddWarningtoData(warn, ref data);
                                            }
                                            else
                                            {
                                                fxHedge.InternalStateId = (int)eInternalStatus.OK;
                                                fxHedge.WorkflowStateId = (int)eWorkflowState.VALIDE;
                                            }
                                        }

                                        if (saleHedgeLeg.IsNotNull())
                                        {
                                            bool IsInSaleError = false;
                                            decimal saleAmount = 0;

                                            if (saleHedgeLeg.Amount.HasValue)
                                            {
                                                saleAmount = saleHedgeLeg.Amount.Value;
                                            }

                                            IsInSaleError = saleExecutionAmountSum != saleHedgeLeg.Amount;

                                            if (IsInSaleError)
                                            {
                                                fxHedge.InternalStateId = (int)eInternalStatus.EN_ERREUR_MONTANT_EXECUTION;
                                                string warn = String.Format("Import KTP: FxHedge {0} is in Error - Please check that sale leg amount is equal to the amount sum of  Fx Execution of type sale ", fxHedge.Code);
                                                LogAndAddWarningtoData(warn, ref data);
                                            }
                                            else
                                            {
                                                fxHedge.InternalStateId = (int)eInternalStatus.OK;
                                                fxHedge.WorkflowStateId = (int)eWorkflowState.VALIDE;
                                            }
                                        }
                                    }

                                    if (fxHedge.HedgeLegs.Count == 2)
                                    {
                                        bool IsInSaleError = false;
                                        bool IsInBuyError = false;

                                        var buyHedgeLeg = fxHedge.HedgeLegs.FirstOrDefault(h => h.PurchaseSaleId == (int)ePurchaseSale.ACHAT);
                                        var saleHedgeLeg = fxHedge.HedgeLegs.FirstOrDefault(h => h.PurchaseSaleId == (int)ePurchaseSale.VENTE);

                                        if (saleHedgeLeg.Amount.HasValue && buyHedgeLeg.Amount.HasValue)
                                        {
                                            IsInBuyError = purchaseExecutionAmountSum != buyHedgeLeg.Amount;

                                            IsInSaleError = saleExecutionAmountSum != saleHedgeLeg.Amount;
                                        }

                                        if (!IsInSaleError && !IsInBuyError)
                                        {
                                            fxHedge.InternalStateId = (int)eInternalStatus.OK;
                                            fxHedge.WorkflowStateId = (int)eWorkflowState.VALIDE;
                                        }
                                        else
                                        {
                                            if (IsInBuyError && !IsInSaleError)
                                            {
                                                fxHedge.InternalStateId = (int)eInternalStatus.EN_ERREUR_MONTANT_EXECUTION;
                                                string warn = String.Format("Import KTP: FxHedge {0} is in Error - Please Check that Buy Leg Amount is equal to the amount sum of  Fx Execution of type BUY ", fxHedge.Code);
                                                LogAndAddWarningtoData(warn, ref data);
                                            }
                                            if (IsInSaleError && !IsInBuyError)
                                            {
                                                fxHedge.InternalStateId = (int)eInternalStatus.EN_ERREUR_MONTANT_EXECUTION;
                                                string warn = String.Format("Import KTP: FxHedge {0} is in Error - Please Check that Sale Leg Amount is equal to the amount sum of  Fx Execution of type SALE ", fxHedge.Code);
                                                LogAndAddWarningtoData(warn, ref data);
                                            }
                                            if (IsInBuyError && IsInSaleError)
                                            {
                                                fxHedge.InternalStateId = (int)eInternalStatus.EN_ERREUR_MONTANT_EXECUTION;
                                                string warn = String.Format("Import KTP: FxHedge {0} is in Error - Please Check that Buy Leg Amount is equal to the amount sum of  Fx Execution of type BUY ", fxHedge.Code);
                                                LogAndAddWarningtoData(warn, ref data);
                                                warn = String.Format("Import KTP: FxHedge {0} is in Error - Please Check that Sale Leg Amount is equal to the amount sum of  Fx Execution of type SALE ", fxHedge.Code);
                                                LogAndAddWarningtoData(warn, ref data);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    #endregion
                    // Sauvegarder les dates d'executions pour la couverture.
                    List<FXHedge> fxList = new List<FXHedge>();

                    // Sauvegarder les nouvelles executions.
                    if (!newExecutions.IsNullOrEmpty())
                    {
                        //_ModelContext.GnlCoreModelContext.SaveCollection<ExecutionFX>(newExecutions);
                        _dbContext.ExecutionFXes.AddRange(newExecutions);
                       
                        newExecutions.ForEach(ex =>
                        {
                            if (!fxList.Contains(ex.FXHedge))
                                fxList.Add(ex.FXHedge);
                        });
                        _dbContext.SaveChanges();
                    }
                    // Updater les anciennes.
                    if (!oldExecutions.IsNullOrEmpty())
                    {
                        // _ModelContext.GnlCoreModelContext.SaveCollection<ExecutionFX>(oldExecutions);
                        foreach (ExecutionFX executionFX in oldExecutions)
                        {
                             var Oldvalue = _dbContext.ExecutionFXes.SingleOrDefault(i => i.Id == executionFX.Id);
                            _dbContext.Entry(Oldvalue).CurrentValues.SetValues(executionFX);
                            _dbContext.SaveChanges();
                        }

                        oldExecutions.ForEach(ex =>
                        {
                            if (!fxList.Contains(ex.FXHedge))
                                fxList.Add(ex.FXHedge);
                        });
                    }

                    if (!fxList.IsNullOrEmpty())
                    {
                        fxList.ForEach(fx => fx.ExecutionDate = DateTime.Now);
                        //_ModelContext.GnlCoreModelContext.SaveCollection<FXHedge>(fxList);
                        foreach(FXHedge hedge in fxList)
                        {
                             var Oldvalue = _dbContext.FXHedges.SingleOrDefault(i => i.Id == hedge.Id);
                            _dbContext.Entry(Oldvalue).CurrentValues.SetValues(hedge);
                            _dbContext.SaveChanges();
                        }
                      
                    }

                    // Afficher les erreurs.
                    if (data.HasBusinessError)
                    {
                        //DXMessageBox.Show(Application.Current.MainWindow,
                        //                "Some errors occured during import operation, please see your trace log",
                        //                "Information",
                        //                MessageBoxButton.OK,
                        //                MessageBoxImage.Warning);
                        logMessage("Executions in Error : " + executionsInError.Count.ToString(), Category.Info, Priority.High);
                        logMessage(data.GetFormattedErrors(ErrorMessageType.BusinessMessage), Category.Info, Priority.High);
                        logMessage("Ignored Execution : " + executionsIgnored.Count.ToString(), Category.Info, Priority.High);
                        logMessage("Successfully updated execution : " + oldExecutions.Count.ToString(), Category.Info, Priority.High);
                        logMessage("Successfully newly imported execution : " + newExecutions.Count.ToString(), Category.Info, Priority.High);
                        logMessage("Successfully updated Fx Hedge : " + modifiedFxHedge.Count.ToString(), Category.Info, Priority.High);
                    }

                    else if (!data.ResultData.IsNullOrEmpty() && (!newExecutions.IsNullOrEmpty() || !oldExecutions.IsNullOrEmpty()))
                    {
                        StringBuilder infoMessage = new StringBuilder();
                        infoMessage.Append("Successfully updated execution : " + oldExecutions.Count.ToString() + "\n"
                                            + "Successfully newly imported execution : " + newExecutions.Count.ToString() + "\n"
                                            + "Successfully updated Fx Hedge : " + modifiedFxHedge.Count.ToString() + "\n"
                                            + "Ignored Execution : " + executionsIgnored.Count.ToString());
                        //DXMessageBox.Show(Application.Current.MainWindow,
                        //                "Import KTP has successfully completed" + "\n" + infoMessage.ToString(),
                        //                "Information",
                        //                MessageBoxButton.OK,
                        //                MessageBoxImage.Information);

                        if (data.HasWarnings)
                        {
                            StringBuilder warningMessage = new StringBuilder();
                            foreach (var warning in data.WarningMessage)
                            {
                                warningMessage.Append("\n" + warning.Message);
                            }

                            // DXMessageBox.Show(Application.Current.MainWindow, warningMessage.ToString(), "Warnings", MessageBoxButton.OK, MessageBoxImage.Warning);
                        }
                        logMessage("Import KTP has successfully completed", Category.Info, Priority.High);
                        //additionnal information about imported Execution
                        logMessage("Successfully updated execution : " + oldExecutions.Count.ToString(), Category.Info, Priority.High);
                        logMessage("Successfully newly imported execution : " + newExecutions.Count.ToString(), Category.Info, Priority.High);
                        logMessage("Successfully updated Fx Hedge : " + modifiedFxHedge.Count.ToString(), Category.Info, Priority.High);
                        logMessage("Ignored Execution : " + executionsIgnored.Count.ToString(), Category.Info, Priority.High);
                    }

                    else
                    {
                        //DXMessageBox.Show(Application.Current.MainWindow,
                        //                "No data imported",
                        //                "Information",
                        //                MessageBoxButton.OK,
                        //                MessageBoxImage.Information);
                        logMessage("No data imported", Category.Info, Priority.High);
                        foreach (var execution in executionsIgnored.Values)
                        {
                            logMessage(execution.ExecutionCode + " - FxHedge : " + execution.FXHedge.Code + " not found ", Category.Info, Priority.High);
                        }
                    }
                }
                else
                {
                    // il y a des erreurs techniques.
                    // Afficher les erreurs techniques.
                    //DXMessageBox.Show(Application.Current.MainWindow,
                    //                    data.GetFormattedErrors(ErrorMessageType.TechnicalMessage),
                    //                    "Error",
                    //                    MessageBoxButton.OK,
                    //                    MessageBoxImage.Error);
                    logMessage(data.GetFormattedErrors(ErrorMessageType.TechnicalMessage), Category.Info, Priority.High);
                }

            }
            catch (Exception ex)
            {
                logMessage(ex.InnerException.IsNotNull() ? ex.InnerException.Message : ex.Message,Category.Info, Priority.Medium);
                //DXMessageBox.Show("Import KTP has failed, please try again",
                //                                               "Error",
                //                                               MessageBoxButton.OK,
                //                                               MessageBoxImage.Error);
                logMessage("Import KTP has failed, please try again", Category.Info, Priority.High);
            }
            finally
            {
                System.Threading.Thread.CurrentThread.CurrentCulture = before;
            }
        }

        private bool HasSameMaturityDate(ExecutionFX exec, int purchaseSaleId, out string message)
        {
            bool hasSameMaturity = true;
            message = string.Empty;
            switch (purchaseSaleId)
            {
                case (int)ePurchaseSale.ACHAT:
                    if (exec.Maturity.Date != exec.FXHedge.HedgeLegs.FirstOrDefault(h => h.PurchaseSaleId == (int)ePurchaseSale.ACHAT).Maturity.Date)
                    {
                        message = string.Format(MESSAGE_FORMAT, string.Format("FXHedge {0} : ", exec.FXHedge.Code),
                                                                exec.ExecutionCode,
                                                                "Maturity date is different from buy leg maturity",
                                                                exec.Maturity.ToShortDateString());
                        hasSameMaturity = false;
                    }

                    break;
                case (int)ePurchaseSale.VENTE:
                    if (exec.Maturity.Date != exec.FXHedge.HedgeLegs.FirstOrDefault(h => h.PurchaseSaleId == (int)ePurchaseSale.VENTE).Maturity.Date)
                    {
                        message = string.Format(MESSAGE_FORMAT, string.Format("FXHedge {0} : ", exec.FXHedge.Code),
                                                                exec.ExecutionCode,
                                                                "Maturity date is different from sale leg maturity",
                                                                exec.Maturity.ToShortDateString());
                        hasSameMaturity = false;
                    }
                    break;
            }

            return hasSameMaturity;
        }

        private void LogAndAddWarningtoData(string warn, ref IDataOutputResult<ExecutionFX> data)
        {
            IWarnings warning = new WarningMessage(warn);
            data.WarningMessage.Add(warning);
            logger.Warn(warn);
            HubFunctions.SendMessage(warn);
        }

        public static void logMessage(string message, Category category, Priority priority)
        {
            switch (category)
            {
                case Category.Debug:
                    logger.Debug(message);
                    break;

                case Category.Warn:
                    logger.Warn(message);
                    break;

                case Category.Exception:
                    logger.Error(message);
                    break;

                case Category.Info:
                    logger.Info(message);
                    break;
            }
            if (priority == Priority.High)
            {
                HubFunctions.SendMessage(message);

            }
            


        }

    }
}
