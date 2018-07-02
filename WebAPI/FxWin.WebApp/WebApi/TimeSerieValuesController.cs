using FXWIN.Data.Provider;
using RefactorThis.GraphDiff;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.OData;
using System.Web.OData.Extensions;
using System.Web.OData.Routing;

namespace FxWin.WebApp.WebApi
{
    public class TimeSerieValuesController : ODataController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        // UPDATE
        [HttpPut]
        [ODataRoute("TimeSerieValues({Id})")]
        public async Task<IHttpActionResult> Put(int Id, TimeSerieValue timeSerieValue)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (Id != timeSerieValue.Id)
                return BadRequest();

            try
            {
                _db.UpdateGraph(timeSerieValue);
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
                if (!timeSerieValueExist(Id))
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
            return Updated(timeSerieValue);
        }

        // DELETE
        [HttpDelete]
        [ODataRoute("TimeSerieValues({Id})")]
        public async Task<IHttpActionResult> Delete(int Id)
        {
            TimeSerieValue timeSerieValue = await _db.TimeSerieValues.FindAsync(Id);

            if (timeSerieValue == null)
                return NotFound();

            _db.TimeSerieValues.Remove(timeSerieValue);

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (Exception exp)
            {
                throw;
            }

            return Ok(timeSerieValue);
        }

        private bool timeSerieValueExist(int id)
        {
            return _db.TimeSerieValues.Count(e => e.Id == id) > 0;
        }
    }
}