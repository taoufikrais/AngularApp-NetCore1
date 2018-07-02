using FXWIN.Data.Provider;
using RefactorThis.GraphDiff;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.OData;
using System.Web.OData.Query;
using System.Web.OData.Routing;

namespace FxWin.WebApp.WebApi
{
    public class LinkFxContractSignalContractsController : ODataController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        // Link FxContract SignalContract Purchase
        [ODataRoute("GetLinkFxContractSignalContractPurchase")]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IEnumerable<LinkFxContractSignalContract>> GetLinkFxContractSignalContractPurchase()
        {
            return await _db.LinkFxContractSignalContracts
                .Where(l => l.PurchaseContractId != null && l.SupplyContractId == null)
                .OrderBy(l => l.PurchaseContract.Code)
                .ToListAsync();
        }

        // Link FxContract SignalContract Sale
        [ODataRoute("GetLinkFxContractSignalContractSale")]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IEnumerable<LinkFxContractSignalContract>> GetLinkFxContractSignalContractSale()
        {
            return await _db.LinkFxContractSignalContracts
                .Where(l => l.SupplyContractId != null && l.PurchaseContractId == null)
                .OrderBy(l => l.SupplyContract.Code)
                .ToListAsync();
        }

        // DELETE
        [HttpDelete]
        [ODataRoute("LinkFxContractSignalContracts({Id})")]
        [ResponseType(typeof(LinkFxContractSignalContract))]
        public async Task<IHttpActionResult> Delete( int Id)
        {
            LinkFxContractSignalContract fxContractSignalContract = await _db.LinkFxContractSignalContracts.FindAsync(Id);

            if (fxContractSignalContract == null)
                return NotFound();

            _db.LinkFxContractSignalContracts.Remove(fxContractSignalContract);

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (Exception exp)
            {
                throw;
            }

            return Ok(fxContractSignalContract);
        }

        // UPDATE
        [HttpPut]
        [ODataRoute("LinkFxContractSignalContracts({Id})")]
        public async Task<IHttpActionResult> Put( int Id, LinkFxContractSignalContract fxContractSignalContract)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (Id != fxContractSignalContract.Id)
                return BadRequest();

            try
            {
                _db.UpdateGraph(fxContractSignalContract, map => map
                                            .AssociatedEntity(s => s.PurchaseContract)
                                            .AssociatedEntity(s => s.SupplyContract)
                                            .AssociatedEntity(s => s.FxContract)
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
                if (!SignalContractExists(Id))
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
            return Updated(fxContractSignalContract);
        }

        private bool SignalContractExists(int id)
        {
            return _db.LinkFxContractSignalContracts.Count(e => e.Id == id) > 0;
        }
    }
}