using FxWin.WebApp.Helper;
using FXWIN.Data.Provider;
using RefactorThis.GraphDiff;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.OData;
using System.Web.OData.Query;
using System.Web.OData.Routing;

namespace FxWin.WebApp.WebApi
{
    [ApiExplorerSettings(IgnoreApi = false)]
    [ODataRoutePrefix("Contracts")]
    public class ContractsController : ODataController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        // READ ALL
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IEnumerable<FxContract>> GetContracts()
        {
            return await _db.FxContracts.ToListAsync();
        }

        // READ BY KEY
        [ODataRoute("({Id})")]
        [ResponseType(typeof(Qualification))]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> GetContract(int Id)
        {
            FxContract contract = await _db.FxContracts.SingleOrDefaultAsync(i => i.Id == Id);

            if (contract == null)
                return NotFound();

            return Ok(contract);
        }

        // UPDATE
        [HttpPut]
        [ODataRoute("({Id})")]
        public async Task<IHttpActionResult> Put(int Id, FxContract contract)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (Id != contract.Id)
                return BadRequest();

            try
            {
                _db.UpdateGraph(contract, map => map
                                            .AssociatedEntity(s => s.ContractType)
                                            .AssociatedEntity(s => s.Incoterm)
                                            .AssociatedEntity(s => s.Currency)
                                            .AssociatedEntity(s => s.Book)
                                        );
                await _db.SaveChangesAsync();
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
                if (!contractExist(Id))
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
            return Updated(contract);
        }

        private bool contractExist(int id)
        {
            return _db.FxContracts.Count(e => e.Id == id) > 0;
        }

        // DELETE
        [HttpDelete]
        [ODataRoute("({Id})")]
        [ResponseType(typeof(FxContract))]
        public async Task<IHttpActionResult> Delete(int Id)
        {
            FxContract contract = await _db.FxContracts.FindAsync(Id);

            if (contract == null)
                return NotFound();

            if (contract.LinkFxContractSignalContracts.Count != 0)
                return new HttpActionResult(HttpStatusCode.Conflict, "This FxContract Cannot Be Deleted - It is associated with one or more SIGNaL contracts");
            if (contract.HedgeLegs.Count != 0)
                return new HttpActionResult(HttpStatusCode.Conflict, "This FxContract Cannot Be Deleted - It is associated with one or more Hedge Leg");
            if (contract.CommodityHedges.Count != 0)
                return new HttpActionResult(HttpStatusCode.Conflict, "This FxContract Cannot Be Deleted - It is associated with one or more Commodity Hedge");

            _db.FxContracts.Remove(contract);

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (Exception exp)
            {
                throw;
            }

            return Ok(contract);
        }

        // Associated Signal Contracts
        [ODataRoute("Default.GetAssociatedSignalContracts")]
        [HttpGet]
        public async Task<IEnumerable<VW_LinkFxContractSignalContract>> GetAssociatedSignalContracts(int id)
        {
            return await _db.VW_LinkFxContractSignalContract.Where(l => l.FxContractId == id).OrderBy(l => l.Code).ToListAsync();
        }
    }
}