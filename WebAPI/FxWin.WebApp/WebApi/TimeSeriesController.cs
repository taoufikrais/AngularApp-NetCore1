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
    public class TimeSeriesController : ODataController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        // READ ALL
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IEnumerable<TimeSerie>> GetTimeSeries()
        {
            return await _db.TimeSeries.ToListAsync();
        }

        // UPDATE
        [HttpPut]
        [ODataRoute("TimeSeries({Id})")]
        public async Task<IHttpActionResult> Put( int Id, [FromBody] TimeSerie timeSerie)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (Id != timeSerie.Id)
                return BadRequest();

            try
            {
                _db.UpdateGraph(timeSerie, map => map
                                            .AssociatedEntity(ts => ts.Currency)
                                            .AssociatedEntity(ts => ts.Unit)
                                            .OwnedCollection(ts => ts.Formulae, with => with.OwnedEntity(f => f.TimeSerie))
                                            .OwnedCollection(ts => ts.CommodityHedges, with => with.OwnedEntity(ch => ch.TimeSerie))
                                            .OwnedCollection(ts => ts.TimeSerieValues, with => with.OwnedEntity(tsv => tsv.TimeSerie))
                                        );

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
                if (!TimeSerieExists(Id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(timeSerie);
        }
        
        // DELETE
        [HttpDelete]
        [ODataRoute("TimeSeries({Id})")]
        public async Task<IHttpActionResult> Delete(int Id)
        {
            TimeSerie timeSerie = await _db.TimeSeries.FindAsync(Id);

            if (timeSerie == null)
                return NotFound();

            List<TimeSerieValue> timeSerieValues = new List<TimeSerieValue>();
            timeSerieValues.AddRange(timeSerie.TimeSerieValues);
            foreach (TimeSerieValue tsv in timeSerieValues)
                _db.TimeSerieValues.Remove(tsv);

            _db.TimeSeries.Remove(timeSerie);

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (Exception exp)
            {
                throw;
            }

            return Ok(timeSerie);
        }

        private bool TimeSerieExists(int id)
        {
            return _db.TimeSeries.Count(e => e.Id == id) > 0;
        }
    }
}