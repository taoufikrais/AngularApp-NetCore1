using FxWin.WebApp.Helper;
using FxWin.WebApp.Services;
using FXWIN.Common.Extensions;
using FXWIN.ConnectionHubs;
using FXWIN.Data.Provider;
using log4net;
using RefactorThis.GraphDiff;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Migrations;
using System.Data.Entity.Validation;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.Http.Tracing;
using System.Web.OData;
using System.Web.OData.Query;
using System.Web.OData.Routing;
//using System.Web.Http.Cors;

namespace FxWin.WebApp.WebApi
{
    //[EnableCors(origins: "*", headers: "*", methods: "*", exposedHeaders: "X-My-Header")]
    [ApiExplorerSettings(IgnoreApi = false)]
    [ODataRoutePrefix("Hedges")]
    public class HedgesController : ODataController
    {
        private static readonly ILog _logger = LogManager.GetLogger(typeof(HedgesController));
        private readonly FXWinV2Entities _dbContext = new FXWinV2Entities(true);

        protected HedgesController()
        {
            try
            {
                _dbContext = new FXWinV2Entities(true);
                //check Connection
               // _dbContext.Database.Connection.Open();
            }
            catch (Exception exp)
            {
                _logger.Error(exp.Message);
                if(exp.InnerException !=null)
                {
                    _logger.Error(exp.InnerException.Message);
                }
                throw new HttpResponseException(new HttpResponseMessage(HttpStatusCode.InternalServerError)
                {
                    Content = new StringContent(exp.Message),
                    ReasonPhrase = "Critical error : " + exp.Message
                });
            }
            finally
            {
                //_dbContext.Database.Connection.Close();
            }
        }

        // READ ALL
        public async Task<IEnumerable<FXHedge>> GetHedges() //HttpResponseMessage
        {
            return await _dbContext.FXHedges.AsNoTracking().ToListAsync();
            //var resp = new HttpResponseMessage()
            //{
            //    Content = new StringContent("[{Hello}]]")
            //};
            //resp.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            //return resp;
        }

        [ODataRoute("Default.GetHedgeViews")]
        [ResponseType(typeof(VW_FXHedgeSynthesis))]
        [HttpGet]
        public async Task<IEnumerable<VW_FXHedgeSynthesis>> GetHedgeViews()
        {
            try
            {
                var res = await _dbContext.VW_FXHedgeSynthesis.AsNoTracking().ToListAsync();
                return res;
            }
            catch (Exception exp)
            {
                _logger.Error(exp.Message);
                if (exp.InnerException != null)
                {
                    _logger.Error(exp.InnerException.Message);
                }
                throw new HttpResponseException(new HttpResponseMessage(HttpStatusCode.InternalServerError)
                {
                    Content = new StringContent(exp.Message),
                    ReasonPhrase = "Critical error : " + exp.Message
                });
            }
        }

        //[ODataRoute("Default.GetHedgeCodeOccurence(code={code},maxlength={maxlength})")]
        [ODataRoute("Default.GetHedgeCodeOccurence")]
        [ResponseType(typeof(IHttpActionResult))]
        [HttpGet]
        public async Task<IHttpActionResult> GetHedgeCodeOccurence(string code, int maxlength=0)
        {
            int count = 0;
            if (maxlength > 0)
            {
                count = _dbContext.VW_FXHedgeSynthesis.Count(h => h.Code.ToUpper().Substring(0, maxlength) == code.ToUpper());
            }
            else
            {
                count = _dbContext.VW_FXHedgeSynthesis.Count(h => h.Code.ToUpper() == code.ToUpper());
            }

            return Ok(count);
        }

        // READ BY KEY
        [ODataRoute("({Id})")]
        //[ResponseType(typeof(FXHedge))]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.Expand, MaxExpansionDepth = 0)]
        public async Task<IHttpActionResult> GetHedge(int Id)
        {
            FXHedge hedge = await _dbContext.FXHedges.AsNoTracking().SingleOrDefaultAsync(i => i.Id == Id);

            if (hedge == null)
                return NotFound();

            return Ok(hedge);
        }

        // UPDATE
        [HttpPut]
        [ODataRoute("({Id})")]
        [ResponseType(typeof(FXHedge))]
        //[ValidateModelAttribute]
        public async Task<IHttpActionResult> PutHedge(int Id, [FromBody] FXHedge hedge) // 
        {
            Configuration.Services.GetTraceWriter().Info(Request, "HedgeController", "");
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Select(x => x.Value.Errors)
                                            .Where(y => y.Count > 0)
                                            .ToList();
                return BadRequest(ModelState);
            }

            if (Id != hedge.Id)
                return BadRequest();
            if (Id == 0 )
            {
                hedge.CreationDate = DateTime.Now;
            }
            else
            {
                hedge.ModificationDate = DateTime.Now;
            }

            if (hedge.WorkflowStateId == 2)////en cours d’exécution
            {
                hedge.ExecutionDate = DateTime.Now;
            }

            try
            {
                // hedgeProvider.Update(hedge, Key);
                //_dbContext.Entry(entity).CurrentValues.SetValues(hedge);
                _dbContext.UpdateGraph(hedge, map => map
                                            .OwnedCollection(h => h.HedgeLegs, with => with.OwnedEntity(hleg => hleg.Operation, andWith => andWith.OwnedEntity(ope => ope.Cargo)))
                                            .OwnedCollection(h => h.ExecutionFXes)
                                        //.OwnedEntity(x => x.Address)
                                        //.AssociatedEntity(h=>h.HedgeType)
                                        );
                _dbContext.SaveChanges();
                //_ModelContext.GnlCoreModelContext.ExecuteStoreCommand("[compute]", new object[] { });
            }
            catch (DbEntityValidationException e)
            {
                List<string> errors = new List<string>();
                foreach (var eve in e.EntityValidationErrors)
                {
                    errors.Add(string.Format("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
                        eve.Entry.Entity.GetType().Name, eve.Entry.State));
                    foreach (var ve in eve.ValidationErrors)
                    {
                        errors.Add(string.Format("- Property: \"{0}\", Error: \"{1}\"",
                            ve.PropertyName, ve.ErrorMessage));
                    }
                }
                throw;
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!HedgeExists(Id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            catch (Exception exp)
            {
                Console.WriteLine(exp.Message);
                throw;
            }
            return Updated(hedge);
        }

        // CREATE
        [HttpPost]
        [ODataRoute()]
        [ResponseType(typeof(FXHedge))]
        public async Task<IHttpActionResult> PostHedge([FromBody] FXHedge hedge)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (hedge == null)
                return BadRequest("Object value null");

            _dbContext.FXHedges.AddOrUpdate(hedge);

            try
            {
                await _dbContext.SaveChangesAsync();
            }
            catch (DbEntityValidationException e)
            {
                List<string> errors = new List<string>();
                foreach (var eve in e.EntityValidationErrors)
                {
                    errors.Add(string.Format("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
                        eve.Entry.Entity.GetType().Name, eve.Entry.State));
                    foreach (var ve in eve.ValidationErrors)
                    {
                        errors.Add(string.Format("- Property: \"{0}\", Error: \"{1}\"",
                            ve.PropertyName, ve.ErrorMessage));
                    }
                }
                throw;
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!HedgeExists(hedge.Id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Created(hedge);
        }

        // DELETE
        [ResponseType(typeof(FXHedge))]
        public async Task<IHttpActionResult> DeleteHedge(int Id)
        {
            FXHedge hedge = await _dbContext.FXHedges.FindAsync(Id);

            if (hedge == null)
                return NotFound();

            _dbContext.FXHedges.Remove(hedge);

            try
            {
                await _dbContext.SaveChangesAsync();
            }
            catch (Exception exp)
            {
                throw;
            }

            return Ok(hedge);
        }


        [ODataRoute("Default.ImportKtp")]
        [ResponseType(typeof(IHttpActionResult))]
        [HttpPost]
        public async Task<IHttpActionResult> ImportKtp()
        {
            _logger.Info("Start import ktp ");
            HubFunctions.SendMessage("Start import ktp ");
            HubFunctions.WaitProcess("Import Ktp");
            HttpResponseMessage response = new HttpResponseMessage();
            var httpRequest = HttpContext.Current.Request;
            try
            {

                int i = 0;
                if (httpRequest.Files.Count > 0)
                {
                    foreach (string file in httpRequest.Files)
                    {
                        i++;
                        var hedgeimport = new HedgeImport();
                        var postedFile = httpRequest.Files[file];
                        //var filePath = HttpContext.Current.Server.MapPath("~/UploadFile/" + postedFile.FileName);
                        var filePath = System.Configuration.ConfigurationManager.AppSettings["ShareFolderPath"] + @"\" + postedFile.FileName;
                        postedFile.SaveAs(filePath);
                        //CALLING A FUNCTION THAT CALCULATES PERCENTAGE AND SENDS THE DATA TO THE CLIENT
                        HubFunctions.SendMessage("file uploded successfully : " + postedFile.FileName);

                        //byte[] buffer = new byte[postedFile.InputStream.Length];
                        //postedFile.InputStream.Seek(0, SeekOrigin.Begin);
                        //postedFile.InputStream.Read(buffer, 0, Convert.ToInt32(postedFile.InputStream.Length));
                        //MemoryStream stream2 = new MemoryStream(buffer);

                        hedgeimport.ImportKtp(filePath);
                        HubFunctions.SendRefreshData("All");
                    }
                }
                _logger.Info("End import ktp ");
                HubFunctions.SendMessage("End import ktp ");
                HubFunctions.EndProcess("Import Ktp");


                //for (int j = 0; j <= 10; j++)
                //{
                //    //SIMULATING SOME TASK
                //    Thread.Sleep(500);

                //    //CALLING A FUNCTION THAT CALCULATES PERCENTAGE AND SENDS THE DATA TO THE CLIENT
                //    Functions.SendProgress("Process in progress...", j, 10);
                //}
                return Ok();

            }
            catch (Exception exp)
            {
                HubFunctions.EndProcess("ImportKTp");
                HubFunctions.SendMessage("Error in ktp import : " + exp.Message);
                throw new HttpResponseException(new HttpResponseMessage(HttpStatusCode.InternalServerError)
                {
                    Content = new StringContent(exp.Message),
                    ReasonPhrase = "Critical Exception : " + exp.Message
                });
            }
        }

        [ODataRoute("Default.LongRunningProcess")]
        [ResponseType(typeof(IHttpActionResult))]
        [HttpGet]
        public async Task<IHttpActionResult> LongRunningProcess()
        {
            //THIS COULD BE SOME LIST OF DATA
            int itemsCount = 100;
            for (int i = 0; i <= itemsCount; i++)
            {
                //SIMULATING SOME TASK
                Thread.Sleep(100);

                //CALLING A FUNCTION THAT CALCULATES PERCENTAGE AND SENDS THE DATA TO THE CLIENT
                HubFunctions.SendProgress("Process in progress...", i, itemsCount);
            }
            return Ok();
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
                _dbContext.Dispose();

            base.Dispose(disposing);
        }

        private bool HedgeExists(int id)
        {
            return _dbContext.FXHedges.Count(e => e.Id == id) > 0;
        }

        [ODataRoute("Default.GetInitialFxHedgeCA(operationId={operationId})")]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> GetInitialFxHedgeCA(int operationId)
        {
            HedgeLeg hedgeLeg = new HedgeLeg();

            #region hedgeLeg.Operation
            Operation operation = _dbContext.Operations.FirstOrDefault(o => o.Id == operationId);
            if (operation == null)
                return new HttpActionResult(HttpStatusCode.Conflict, "invalid operation");
            hedgeLeg.PurchaseSaleId = (int)operation.PurchaseSaleId;
            hedgeLeg.OperationId = operation.Id;
            hedgeLeg.Operation = operation;
            hedgeLeg.UnderlyingMonth = operation.OperationDate;
            if (operation.PayementDate2.HasValue)
                hedgeLeg.Maturity = operation.PayementDate2.Value;
            else
                return new HttpActionResult(HttpStatusCode.Conflict, "Selected operation must have a payment date in order to complete this action");
            #endregion

            #region hedgeLeg.FxContract
            LinkFxContractSignalContract lfcsc = null;
            if (operation.PurchaseSaleId == 1)
                lfcsc = _dbContext.LinkFxContractSignalContracts
                    .Where(o => o.PurchaseContractId == operation.PurchaseContractId)
                    .FirstOrDefault();
            else if (operation.PurchaseSaleId == 2)
                lfcsc = _dbContext.LinkFxContractSignalContracts
                    .Where(o => o.SupplyContractId == operation.SupplyContractId)
                    .FirstOrDefault();
            if (lfcsc == null)
                return new HttpActionResult(HttpStatusCode.Conflict, "invalid contract");
            FxContract fxContract = lfcsc.FxContract;
            if (fxContract == null)
                return new HttpActionResult(HttpStatusCode.Conflict, "invalid contract");
            if (fxContract.OrderNumberPrefix == null)
                return new HttpActionResult(HttpStatusCode.Conflict, "contract has no order prefix number - please set one in order to perform this operation");
            hedgeLeg.FxContractId = fxContract.Id;
            hedgeLeg.FxContract = fxContract;
            #endregion

            #region hedgeLeg.Amount
            if (!operation.Amount2.HasValue)
                return new HttpActionResult(HttpStatusCode.Conflict, "Selected operation must have an amount in order to complete this action");

            if (fxContract.IsFiftyFifty)
                hedgeLeg.Amount = operation.Amount2 / 2;
            else
                hedgeLeg.Amount = operation.Amount2;

            if (hedgeLeg.Amount.HasValue)
                hedgeLeg.Amount = Decimal.Truncate(Decimal.Floor(hedgeLeg.Amount.Value));
            #endregion

            FXHedge fxHedge = new FXHedge();

            #region fxHedge.InternalState
            InternalState internalState = _dbContext.InternalStates.FirstOrDefault(i => i.Id == 1);
            if (internalState == null)
                return new HttpActionResult(HttpStatusCode.Conflict, "invalid internalState");
            fxHedge.InternalStateId = internalState.Id;
            fxHedge.InternalState = internalState;
            #endregion

            #region fxHedge.HedgeType
            HedgeType hedgeType = _dbContext.HedgeTypes.FirstOrDefault(ht => ht.Id == (int)operation.PurchaseSaleId);
            if (hedgeType == null)
                return new HttpActionResult(HttpStatusCode.Conflict, "invalid hedgeType");
            fxHedge.HedgeTypeId = hedgeType.Id;
            fxHedge.HedgeType = hedgeType;
            #endregion

            #region fxHedge.ManagementIntent
            fxHedge.ManagementIntentId = 3;
            ManagementIntent managementIntent = _dbContext.ManagementIntents.FirstOrDefault(m => m.Id == 3);
            if (managementIntent == null)
                return new HttpActionResult(HttpStatusCode.Conflict, "invalid managementIntent");
            fxHedge.ManagementIntent = managementIntent;
            fxHedge.ManagementIntent.Qualification = managementIntent.Qualification;
            #endregion

            #region fxHedge.Currency
            fxHedge.CurrencyId = operation.CurrencyId;
            Currency currency = _dbContext.Currencies.FirstOrDefault(c => c.Id == operation.CurrencyId);
            if (currency == null)
                return new HttpActionResult(HttpStatusCode.Conflict, "invalid currency");
            fxHedge.Currency = currency;
            #endregion
            #region fxHedge.workFlow
            WorkflowState hedgeWorkflow = _dbContext.WorkflowStates.FirstOrDefault(ht => ht.Id == 1);
            if (hedgeWorkflow == null)
                return new HttpActionResult(HttpStatusCode.Conflict, "invalid hedgeWorkflow");
            fxHedge.WorkflowStateId = hedgeWorkflow.Id;
            fxHedge.WorkflowState = hedgeWorkflow;
            #endregion

            #region fxHedge.Qualification
            fxHedge.Qualification = managementIntent.Qualification;
            fxHedge.QualificationId = managementIntent.Qualification.Id;
            #endregion
            #region fxHedge.Qualification
            fxHedge.ExecutionFXes = null;
            #endregion

            hedgeLeg.FXHedge = fxHedge;
            fxHedge.HedgeLegs.Add(hedgeLeg);

            return Ok(fxHedge);
        }

        [ODataRoute("Default.GetInitialFxHedgeRB(operationId={operationId})")]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> GetInitialFxHedgeRB(int operationId)
        {
            HedgeLeg hedgeLeg1 = new HedgeLeg();
            HedgeLeg hedgeLeg2 = new HedgeLeg();
            hedgeLeg1.PurchaseSaleId = 1;
            hedgeLeg2.PurchaseSaleId = 2;

            #region hedgeLeg.Operation
            Operation operation = _dbContext.Operations.FirstOrDefault(o => o.Id == operationId);
            if (operation == null)
                return new HttpActionResult(HttpStatusCode.Conflict, "invalid operation");
            hedgeLeg1.OperationId = operation.Id;
            hedgeLeg1.Operation = operation;
            hedgeLeg2.OperationId = operation.Id;
            hedgeLeg2.Operation = operation;
            hedgeLeg1.UnderlyingMonth = operation.OperationDate;
            hedgeLeg2.UnderlyingMonth = operation.OperationDate;
            if (operation.PayementDate2.HasValue)
            {
                hedgeLeg1.Maturity = operation.PayementDate2.Value;
                hedgeLeg2.Maturity = operation.PayementDate2.Value;
            }
            else
                return new HttpActionResult(HttpStatusCode.Conflict, "Selected operation must have a payment date in order to complete this action");
            #endregion

            #region hedgeLeg.FxContract
            LinkFxContractSignalContract lfcsc = null;
            if (operation.PurchaseSaleId == 1)
                lfcsc = _dbContext.LinkFxContractSignalContracts
                    .Where(o => o.PurchaseContractId == operation.PurchaseContractId)
                    .FirstOrDefault();
            else if (operation.PurchaseSaleId == 2)
                lfcsc = _dbContext.LinkFxContractSignalContracts
                    .Where(o => o.SupplyContractId == operation.SupplyContractId)
                    .FirstOrDefault();
            if (lfcsc == null)
                return new HttpActionResult(HttpStatusCode.Conflict, "invalid contract");
            FxContract fxContract = lfcsc.FxContract;
            if (fxContract == null)
                return new HttpActionResult(HttpStatusCode.Conflict, "invalid contract");
            if (fxContract.OrderNumberPrefix == null)
                return new HttpActionResult(HttpStatusCode.Conflict, "contract has no order prefix number - please set one in order to perform this operation");
            hedgeLeg1.FxContractId = fxContract.Id;
            hedgeLeg2.FxContractId = fxContract.Id;
            hedgeLeg1.FxContract = fxContract;
            hedgeLeg2.FxContract = fxContract;
            #endregion

            #region hedgeLeg.Amount
            if (!operation.Amount2.HasValue)
                return new HttpActionResult(HttpStatusCode.Conflict, "Selected operation must have an amount in order to complete this action");

            if (fxContract.IsFiftyFifty)
            {
                if (fxContract.IsSpotContract)
                {
                    hedgeLeg1.Amount = operation.Amount2 / 2;
                    hedgeLeg2.Amount = operation.Amount2 / 2;
                }
                else if(fxContract.IsMTContract)
                {
                    hedgeLeg1.Amount = Math.Min(Math.Abs(operation.Amount2.Value) / 2, Math.Abs(operation.ContractAvailableFxHedge.Value));
                    hedgeLeg2.Amount = Math.Min(Math.Abs(operation.Amount2.Value) / 2, Math.Abs(operation.ContractAvailableFxHedge.Value));
                }
            }
            else
            {
                if (fxContract.IsSpotContract)
                {
                    hedgeLeg1.Amount = operation.Amount2;
                    hedgeLeg2.Amount = operation.Amount2;
                }
                else if (fxContract.IsMTContract)
                {
                    hedgeLeg1.Amount = Math.Min(Math.Abs(operation.Amount2.Value), Math.Abs(operation.ContractAvailableFxHedge.Value));
                    hedgeLeg2.Amount = Math.Min(Math.Abs(operation.Amount2.Value), Math.Abs(operation.ContractAvailableFxHedge.Value));
                }
            }

            if (hedgeLeg1.Amount.HasValue)
                hedgeLeg1.Amount = Decimal.Truncate(Decimal.Floor(hedgeLeg1.Amount.Value));
            if (hedgeLeg2.Amount.HasValue)
                hedgeLeg2.Amount = Decimal.Truncate(Decimal.Floor(hedgeLeg2.Amount.Value));
            #endregion

            FXHedge fxHedge = new FXHedge();

            #region fxHedge.InternalState
            InternalState internalState = _dbContext.InternalStates.FirstOrDefault(i => i.Id == 1);
            if (internalState == null)
                return new HttpActionResult(HttpStatusCode.Conflict, "invalid internalState");
            fxHedge.InternalStateId = internalState.Id;
            fxHedge.InternalState = internalState;
            #endregion

            #region fxHedge.HedgeType
            HedgeType hedgeType = _dbContext.HedgeTypes.FirstOrDefault(ht => ht.Id == 3);
            if (hedgeType == null)
                return new HttpActionResult(HttpStatusCode.Conflict, "invalid hedgeType");
            fxHedge.HedgeTypeId = hedgeType.Id;
            fxHedge.HedgeType = hedgeType;
            #endregion

            #region fxHedge.ManagementIntent
            fxHedge.ManagementIntentId = 3;
            ManagementIntent managementIntent = _dbContext.ManagementIntents.FirstOrDefault(m => m.Id == 4);
            if (managementIntent == null)
                return new HttpActionResult(HttpStatusCode.Conflict, "invalid managementIntent");
            fxHedge.ManagementIntent = managementIntent;
            fxHedge.ManagementIntent.Qualification = managementIntent.Qualification;
            #endregion

            #region fxHedge.Currency
            fxHedge.CurrencyId = operation.CurrencyId;
            Currency currency = _dbContext.Currencies.FirstOrDefault(c => c.Id == operation.CurrencyId);
            if (currency == null)
                return new HttpActionResult(HttpStatusCode.Conflict, "invalid currency");
            fxHedge.Currency = currency;
            #endregion

            #region fxHedge.workFlow
            WorkflowState hedgeWorkflow = _dbContext.WorkflowStates.FirstOrDefault(ht => ht.Id == 1);
            if (hedgeWorkflow == null)
                return new HttpActionResult(HttpStatusCode.Conflict, "invalid hedgeWorkflow");
            fxHedge.WorkflowStateId = hedgeWorkflow.Id;
            fxHedge.WorkflowState = hedgeWorkflow;
            #endregion

            #region fxHedge.Qualification
            fxHedge.Qualification = managementIntent.Qualification;
            fxHedge.QualificationId = managementIntent.Qualification.Id;
            #endregion
            #region fxHedge.Qualification
            fxHedge.ExecutionFXes = null;
            #endregion

            hedgeLeg1.FXHedge = fxHedge;
            hedgeLeg2.FXHedge = fxHedge;
            fxHedge.HedgeLegs.Add(hedgeLeg1);
            fxHedge.HedgeLegs.Add(hedgeLeg2);

            return Ok(fxHedge);
        }

        [ODataRoute("Default.GetFxWinHedgeTrade")]
        [HttpGet]
        public List<ExportPomax> GetFxWinHedgeTrade(DateTime startDate, DateTime endDate, DateTime? executionStartDate=null, DateTime? executionEndDate=null)
        {
            var data = _dbContext.VW_ExportPomax.Where(p => p.UnderlyingMonth >= startDate.Date
                                                            && p.UnderlyingMonth <= endDate.Date).ToList();
            if (executionStartDate.HasValue && executionEndDate.HasValue)
                data = data.Where(p => p.ExecutionDate.Value.Date >= executionStartDate.Value.Date && p.ExecutionDate.Value.Date <= executionEndDate.Value.Date).ToList();

            var dataReturn = new List<ExportPomax>();
            if (!data.IsNullOrEmpty())
            {
                CultureInfo fr = new CultureInfo("fr-FR");
                data.ForEach(d => dataReturn.Add(d.ConvertToExportPomax(fr)));
            }

            return dataReturn;
        }



    }
}