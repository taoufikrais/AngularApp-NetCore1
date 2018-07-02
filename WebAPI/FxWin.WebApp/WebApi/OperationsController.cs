using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Migrations;
using System.Data.Entity.Validation;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.OData;
using System.Web.OData.Query;
using System.Web.OData.Routing;
using FxWin.WebApp.Models;
using FXWIN.Data.Provider;
using System.Net;
using FxWin.WebApp.Helper;

//using System.Web.Http.OData;


namespace FxWin.WebApp.WebApi
{
    //RouteByDefault
    [ODataRoutePrefix("Operations")]
    //[EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
    [ApiExplorerSettings(IgnoreApi = false)]
    public class OperationsController : ODataController //ApiController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        //GET: api/Operationes
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All, MaxExpansionDepth = 6)]//PageSize = 25, 
        //[CustomQueryable]
        public IQueryable<Operation> GetOperations()
        {
            var res = _db.Operations.AsQueryable();
            return res;
        }

        // GET URL: http://localhost:60257/api/Operations/5
        // GET URL: http://localhost:60257/api/Operations(5)/
        [ODataRoute("({Id})")]
        [ResponseType(typeof(Operation))]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All, MaxExpansionDepth = 6)]
        public async Task<IHttpActionResult> GetOperation( int Id)
        {
            //Find() and FindAsync() are methods on type DbSet (which is what db.Items is). Include() returns a DbQuery object, 
            //which is why FindAsync() is not available. Use SingleOrDefaultAsync() to do the same thing as FindAsync()
            //(the difference is it will go straight to the database and won't look in the context to see if the entity exists first)...
            //Operation Operation = await _db.Operations.FindAsync(Id).Include(o => o.Currency)
            //    .Include(o => o.HedgeLegs)
            //    .Include(o => o.CommodityHedges)
            //    .Include(o => o.OperationType)
            //    .Include(o => o.Port)
            //    .Include(o => o.Port1)
            //    .Include(o => o.PurchaseContract)
            //    .Include(o => o.SupplyContract)
            //    .Include(o => o.Vessel);
            Operation Operation = await _db.Operations.SingleOrDefaultAsync(i => i.Id == Id);
            if (Operation == null)
            {
                return NotFound();
            }

            return Ok(Operation);
        }

        // POST URL: http://localhost:60257/api/Operations
        [ResponseType(typeof(Operation))]
        [HttpPost]
        [ODataRoute()]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> Post([FromBody] Operation Operation)//[FromBody] in classic web api 
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (Operation == null)
            {
                return BadRequest("Object value null");
            }
            _db.Operations.AddOrUpdate(Operation);
            try
            {
                await _db.SaveChangesAsync();

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
                if (!OperationExists(Operation.Id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return Created(Operation);
            //return CreatedAtRoute("DefaultApi", new { id = Operation.Id }, Operation);
        }

        // PUT URL : http://localhost:60257/api/Operations/1 classic web api 
        // PUT URL : http://localhost:60257/api/Operations(1)/ odata service 
        //[ResponseType(typeof(void))]
        [ResponseType(typeof(Operation))]
        [HttpPut]
        [ODataRoute("({Id})")]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> Put( int Id, [FromBody] Operation Operation)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (Id != Operation.Id)
            {
                return BadRequest();
            }
            _db.Entry(Operation).State = EntityState.Modified;

            try
            {
                _db.Operations.AddOrUpdate(Operation);
                await _db.SaveChangesAsync();
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
                if (!OperationExists(Id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return Updated(Operation);
            //return StatusCode(HttpStatusCode.NoContent);
        }

        //// DELETE: http://localhost:60257/api/Operations/1
        //[ResponseType(typeof(Operation))]
        //[EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        //public async Task<IHttpActionResult> Delete(int id)
        //{
        //    Operation Operation = await _db.Operations.FindAsync(id);
        //    if (Operation == null)
        //    {
        //        return NotFound();
        //    }

        //    _db.Operations.Remove(Operation);
        //    try
        //    {
        //        await _db.SaveChangesAsync();
        //    }
        //    catch (Exception exp)
        //    {
        //        Console.WriteLine(exp.Message);
        //        throw;
        //    }


        //    return Ok(Operation);
        //}

        [ODataRoute()]
        [HttpPatch]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public IHttpActionResult Patch( int Id, Delta<Operation> delta)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var contactType = _db.Operations.Single(t => t.Id == Id);
            delta.Patch(contactType);
            _db.SaveChanges();
            return Updated(contactType);
        }

        private bool OperationExists(int id)
        {
            return _db.Operations.Count(e => e.Id == id) > 0;
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _db.Dispose();
            }
            base.Dispose(disposing);
        }

        [ODataRoute("Default.GetOperationSynthesises")]//(contractId={contractId}, contractTypeId={contractTypeId})
        [HttpGet]
        [EnableQuery]
        public async Task<IEnumerable<OperationSynthesis>> GetOperationSynthesises(int contractId, int contractTypeId)
        {
            if (contractTypeId == (int)eContractType.PURCHASE)
            {
               // return GetOperationByPurchaseContract(contractId);
                return GetOperationByPurchaseContract(contractId);
            }
            return  GetOperationBySaleContract(contractId);
        }

        private IEnumerable<OperationSynthesis> GetOperationByPurchaseContract(int fxContractId)
        {
            var query = from l in _db.LinkFxContractSignalContracts
                        join o in _db.Operations on l.PurchaseContractId equals o.PurchaseContractId
                        join c in _db.Cargoes on o.CargoId equals c.Id
                        join i in _db.InternalStates on o.InternalStateId equals i.Id
                        //join h in _db.HedgeLegs on o.Id equals h.OperationId
                        where
                        (
                                l.FxContractId == fxContractId
                            && o.PurchaseContractId != null
                        )
                        select new OperationSynthesis
                        {
                            OperationId = o.Id,
                            CargoId = o.Cargo.Id,
                            CargoCode = o.Cargo.Code,
                            Volume = o.EnergyTW0,
                            Operationdate = o.OperationDate,
                            BOValidationStatus = o.IsBOValidated,
                            FXContract = l.FxContract.Code,
                            PurchaseSaleId = o.PurchaseSaleId,
                            OperationType = o.OperationType.Name,
                            FXContractId = fxContractId,
                            SignalContract = l.PurchaseContract.Code,
                            InternalState = i,
                            CargoState = c.CargoState.Code,
                            //legId = h.Id
        };
            List<OperationSynthesis> result = query.Where(op => !string.IsNullOrEmpty(op.CargoCode)).ToList<OperationSynthesis>();
            return result;
            //return query.Where(op => !string.IsNullOrEmpty(op.CargoCode)).ToListAsync<OperationSynthesis>();
        }

        private IEnumerable<OperationSynthesis> GetOperationBySaleContract(int fxContractId)
        {
            var query = from l in _db.LinkFxContractSignalContracts
                        join o in _db.Operations on l.SupplyContractId equals o.SupplyContractId
                        join c in _db.Cargoes on o.CargoId equals c.Id
                        join i in _db.InternalStates on o.InternalStateId equals i.Id
                        where (l.FxContractId == fxContractId && o.SupplyContractId != null)
                        select new OperationSynthesis
                        {
                            OperationId = o.Id,
                            CargoId = o.Cargo.Id,
                            CargoCode = o.Cargo.Code,
                            Volume = o.EnergyTW0,
                            Operationdate = o.OperationDate,
                            BOValidationStatus = o.IsBOValidated,
                            FXContract = l.FxContract.Code,
                            PurchaseSaleId = o.PurchaseSaleId,
                            OperationType = o.OperationType.Name,
                            FXContractId = fxContractId,
                            SignalContract = l.SupplyContract.Code,
                            InternalState = i,
                            CargoState = c.CargoState.Code
                        };

            //return await query.Where(op => !string.IsNullOrEmpty(op.CargoCode)).ToListAsync<OperationSynthesis>();
            return query.Where(op => !string.IsNullOrEmpty(op.CargoCode)).ToList();
        }
        
        // DELETE
        [HttpDelete]
        [ODataRoute("({Id})")]
        [ResponseType(typeof(Operation))]
        public async Task<IHttpActionResult> Delete(int Id)
        {
            Operation operation = await _db.Operations.FindAsync(Id);

            if (operation == null)
                return NotFound();
            
            if (operation.HedgeLegs.Count != 0)
                return new HttpActionResult(HttpStatusCode.Conflict, "This Operation Term Cannot Be Deleted - It is Currenctly Linked to A Hedge Leg");
            if (operation.CommodityHedges.Count != 0)
                return new HttpActionResult(HttpStatusCode.Conflict, "This Operation Term Cannot Be Deleted - It is Currenctly Linked to A Commodity Hedge");

            _db.Operations.Remove(operation);

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (Exception exp)
            {
                throw;
            }

            return Ok(operation);
        }
    }
}