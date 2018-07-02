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
    [ApiExplorerSettings(IgnoreApi = false)]
    public class SignalContractExclusionsController : ODataController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        // READ ALL
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IEnumerable<SignalContractExclusion>> GetSignalContractExclusions()
        {
            return await _db.SignalContractExclusions.ToListAsync();
        }

        // DELETE
        [HttpDelete]
        [ODataRoute("SignalContractExclusions({Id})")]
        [ResponseType(typeof(SignalContractExclusion))]
        public async Task<IHttpActionResult> Delete( int Id)
        {
            SignalContractExclusion signalContractExclusion = await _db.SignalContractExclusions.FindAsync(Id);

            if (signalContractExclusion == null)
                return NotFound();

            _db.SignalContractExclusions.Remove(signalContractExclusion);

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (Exception exp)
            {
                throw;
            }

            return Ok(signalContractExclusion);
        }

        // UPDATE
        [HttpPut]
        [ODataRoute("SignalContractExclusions({Id})")]
        public async Task<IHttpActionResult> Put( int Id, SignalContractExclusion signalContractExclusion)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (Id != signalContractExclusion.Id)
                return BadRequest();

            try
            {
                _db.UpdateGraph(signalContractExclusion, map => map
                                            .AssociatedEntity(s => s.PurchaseContract)
                                            .AssociatedEntity(s => s.SupplyContract)
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
                if (!SignalContractExclusionExists(Id))
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
            return Updated(signalContractExclusion);
        }

        private bool SignalContractExclusionExists(int id)
        {
            return _db.SignalContractExclusions.Count(e => e.Id == id) > 0;
        }
    }
}