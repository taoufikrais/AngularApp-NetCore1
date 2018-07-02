using FXWIN.Data.Provider;
using System.Collections.Generic;
using System.Data.Entity;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.OData;
using System.Web.OData.Routing;

namespace FxWin.WebApp.WebApi
{
    public class UnitsController : ODataController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        // READ ALL
        public async Task<IEnumerable<Unit>> GetUnits()
        {
            return await _db.Units.ToListAsync();
        }

        [ODataRoute("Units({Id})")]
        [ResponseType(typeof(Unit))]
        public async Task<IHttpActionResult> GetUnit( int Id)
        {
            Unit unit = await _db.Units.SingleOrDefaultAsync(i => i.Id == Id);

            if (unit == null)
                return NotFound();

            return Ok(unit);
        }
    }
}