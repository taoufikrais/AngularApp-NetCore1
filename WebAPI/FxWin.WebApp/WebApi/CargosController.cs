using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.OData;
using System.Web.OData.Query;
using System.Web.OData.Routing;
using FXWIN.Data.Provider;
//used for disconnected EF m
using RefactorThis.GraphDiff;
using log4net;
using System.Net.Http;
using System.Web;
using FxWin.WebApp.Services;
using FXWIN.ConnectionHubs;
using System.Net;

namespace FxWin.WebApp.WebApi
{
    //RouteByDefault
    [ODataRoutePrefix("Cargos")]
    [EnableQuery(MaxExpansionDepth = 6)]
    [ApiExplorerSettings(IgnoreApi = false)]
    public class CargosController : ODataController //ApiController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        private static readonly ILog _logger = LogManager.GetLogger(typeof(CargosController));
        private BaseService<Cargo> _repository = new BaseService<Cargo>(true);
        //private BaseService<FXHedge> provider = new BaseService<FXHedge>(_dbContext, true);

        //GET: api/Cargoes
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All, MaxExpansionDepth = 6)]//PageSize = 25, 
        //[CustomQueryable]
        public IQueryable<Cargo> GetCargos(ODataQueryOptions options = null)
        {
            IQueryable<Cargo> results;
            if (options != null)
            {
                ODataQuerySettings settings = new ODataQuerySettings()
                {
                    PageSize = 5
                };
                results = (IQueryable<Cargo>)options.ApplyTo(_repository.GetAll(), settings);

            }
            else
            {
                results = _repository.GetAll();
            }

            return results;
            //var res = options.ApplyTo(_db.Cargos.AsQueryable());
            // return (IQueryable<Cargo>) res;
        }

        [ODataRoute("Default.GetListVW_CargoView")]
        [HttpGet]
        [EnableQuery]
        public IQueryable<VW_CargoView> GetListVW_CargoView()
        {
            var r = new BaseService<VW_CargoView>(false);
            return r.GetAll();
        }


        // GET URL: http://localhost:60257/api/Cargos/7
        // GET URL: http://localhost:60257/api/Cargos(7)/
        [ODataRoute("({Id})")] //si tu nome ta methode juste GET tu n'a pas besoin d'ajouter Cargos devant key, si non il faut nomer la methode GetCargo
        [ResponseType(typeof(Cargo))]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All, MaxExpansionDepth = 6)]
        public async Task<IHttpActionResult> GetCargo(int Id)
        {
            //Find() and FindAsync() are methods on type DbSet (which is what db.Items is). Include() returns a DbQuery object, 
            //which is why FindAsync() is not available. Use SingleOrDefaultAsync() to do the same thing as FindAsync()
            //(the difference is it will go straight to the database and won't look in the context to see if the entity exists first)...

            //Cargo cargo = await _db.Cargos.FindAsync(Id)
            //.Include( c=>c.CargoState)
            //.Include(c=>c.Operations);

            Cargo cargo = await _repository.GetAsync(Id);
            if (cargo == null)
            {
                return NotFound();
            }

            foreach (Operation op in cargo.Operations)
                op.InternalState = _db.InternalStates.FirstOrDefault(i => i.Id == op.InternalStateId);

            return Ok(cargo);
        }

        /// <summary>
        /// Add new Cargo
        /// </summary>
        /// <param name="Id">unique identifiant </param>
        /// <param name="cargo">Cargo Model</param>
        /// <remarks>Insert new cargo</remarks>
        /// <response code="400">Bad request</response>
        /// <response code="500">Internal Server Error</response>
        /// PUT URL : http://localhost:60257/api/Cargos/1 classic web api 
        /// PUT URL : http://localhost:60257/api/Cargos(1)/ odata service 
        [ResponseType(typeof(Cargo))]
        [HttpPut]
        [ODataRoute("({Id})")]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> Put(int Id, Cargo cargo)
        {
            if (Request.Headers.Contains("Authorization"))
            {
                string authToken = Request.Headers.GetValues("Authorization").First();
                //check authentification
                _logger.Info("Authorization infos sended from client " + authToken);
            }
            //Configuration.Services.GetTraceWriter().Info(Request, "CargoController", "");
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (Id != cargo.Id)
            {
                return BadRequest();
            }
            try
            {
                //Cargo Oldcargo = _dbContext.Cargos.SingleOrDefault(i => i.Id == Id);
                //_dbContext.Entry(Oldcargo).CurrentValues.SetValues(cargo);
                _repository.CurrentContext.UpdateGraph(cargo, map => map
                                            .OwnedCollection(h => h.Operations)
                                        //.AssociatedEntity(c=>c.CargoState)
                                        );
                await _repository.CurrentContext.SaveChangesAsync();
            }
            catch (DbEntityValidationException e)
            {
                List<string> errors = new List<string>();
                foreach (var eve in e.EntityValidationErrors)
                {
                    errors.Add(
                        string.Format("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
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
                if (!CargoExists(Id))
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
            return Updated(cargo);
            //return StatusCode(HttpStatusCode.NoContent);
        }

        // DELETE: http://localhost:60257/api/Cargos/1
        [ResponseType(typeof(Cargo))]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> Delete(int id)
        {
            Cargo cargo = await _repository.GetAsync(id);
            if (cargo == null)
            {
                return NotFound();
            }
            try
            {
                await _repository.DeleteAsync(cargo);
            }
            catch (Exception exp)
            {
                Console.WriteLine(exp.Message);
                throw;
            }


            return Ok(cargo);
        }

        [ODataRoute()]
        [HttpPatch]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> Patch(int Id, Delta<Cargo> delta)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var contactType = _repository.Get(Id);
            delta.Patch(contactType);
            await _repository.SaveChanges();
            return Updated(contactType);
        }

        //add custom http function hors des methode http de base(get, post, delete )
        [ODataRoute("Default.GetMissingCargos")]
        [HttpGet]
        public IHttpActionResult GetMissingCargos()
        {
            var cargos = _repository.FindAll(t => t.CargoState.Id.Equals(3));
            return Ok(cargos);
        }

        private bool CargoExists(int id)
        {
            return _repository.CountAll(e => e.Id == id) > 0;
        }

        // POST URL: http://localhost:60257/api/Cargos
        [ResponseType(typeof(Cargo))]
        [HttpPost]
        [ODataRoute()]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> Post([FromBody] Cargo cargo)//[FromBody] in classic web api 
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (cargo == null)
            {
                return BadRequest("Object value null");
            }
            try
            {
                await _repository.UpdateAsync(cargo, cargo.Id);

            }
            catch (DbEntityValidationException e)
            {
                List<string> errors = new List<string>();
                foreach (var eve in e.EntityValidationErrors)
                {
                    errors.Add(string.Format("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
                        eve.Entry.Entity.GetType().Name, eve.Entry.State));
                    _logger.Error(string.Format("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
                        eve.Entry.Entity.GetType().Name, eve.Entry.State));
                    foreach (var ve in eve.ValidationErrors)
                    {
                        errors.Add(string.Format("- Property: \"{0}\", Error: \"{1}\"", ve.PropertyName, ve.ErrorMessage));
                        _logger.Error(string.Format("- Property: \"{0}\", Error: \"{1}\"", ve.PropertyName, ve.ErrorMessage));
                    }
                }
                throw;
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CargoExists(cargo.Id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return Created(cargo);
            //return CreatedAtRoute("DefaultApi", new { id = cargo.Id }, cargo);
        }


        [ODataRoute("Default.ImportSignal")]
        [ResponseType(typeof(IHttpActionResult))]
        [HttpPost]
        public async Task<IHttpActionResult> ImportSignal(string programCode, DateTime startDate, DateTime endDate, string operationsInternes = "")
        {
            try
            {
                string authToken = string.Empty;
                if (Request.Headers.Contains("Authorization"))
                {
                    authToken = Request.Headers.GetValues("Authorization").First();
                    //check authentification
                    _logger.Info("Authorization infos sended from client " + authToken);
                }
                string message = "Start Import Signal " + authToken;
                _logger.Info(message);
                HubFunctions.SendMessage(message);
                HubFunctions.WaitProcess("ImportSignal");
                HttpResponseMessage response = new HttpResponseMessage();
                var httpRequest = HttpContext.Current.Request;
                if (string.IsNullOrEmpty(operationsInternes))
                {
                    operationsInternes = "NON";
                }
                var outmessage = await new SignalService().GetOperations("REFERENCE", startDate, endDate, operationsInternes);
                HubFunctions.SendRefreshData("All");
                message = "End import Signal " + authToken;
                _logger.Info(message);
                HubFunctions.SendMessage(message);
                HubFunctions.SendMessage(outmessage);
                HubFunctions.EndProcess("ImportSignal");
                HubFunctions.SendRefreshData("All");
                return Ok(outmessage);
            }
            catch (Exception exp)
            {
                HubFunctions.EndProcess("ImportSignal");
                HubFunctions.SendMessage("Error in signal import : " + exp.Message);
                throw new HttpResponseException(new HttpResponseMessage(HttpStatusCode.InternalServerError)
                {
                    Content = new StringContent(exp.Message),
                    ReasonPhrase = "Critical Exception : " + exp.Message
                });
            }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _repository.Dispose();
            }
            base.Dispose(disposing);
        }

        // Associated FxContract by OperationId
        [ODataRoute("Default.GetAssociatedFxContractByOperationId(id={id})")]
        public async Task<IHttpActionResult> GetAssociatedFxContractByOperationId(int id)
        {
            Operation op = _db.Operations.Where(o => o.Id == id).FirstOrDefault();
            FxContract fxContract = null;
            LinkFxContractSignalContract lfcsc = null;
            if (op != null)
            {
                if (op.PurchaseSaleId == 1)
                    lfcsc = _db.LinkFxContractSignalContracts
                        .Where(o => o.PurchaseContractId == op.PurchaseContractId)
                        .FirstOrDefault();
                else if (op.PurchaseSaleId == 2)
                    lfcsc = _db.LinkFxContractSignalContracts
                        .Where(o => o.SupplyContractId == op.SupplyContractId)
                        .FirstOrDefault();

                if (lfcsc != null)
                {
                    fxContract = lfcsc.FxContract;
                    if (fxContract != null)
                        return Ok(fxContract);
                    else
                        return NotFound();
                }
                else
                    return NotFound();
            }
            else
                return NotFound();
        }
    }
}