using FXWIN.Data.Provider;
using System.Collections.Generic;
using System.Data.Entity;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.OData;
using System.Web.OData.Query;
using System.Web.OData.Routing;

namespace FxWin.WebApp.WebApi
{
    public class ManagementIntentsController : ODataController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        // READ ALL
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.Expand, MaxExpansionDepth = 0)]
        public async Task<IEnumerable<ManagementIntent>> GetManagementIntents()
        {
            var res= await _db.ManagementIntents.Include(m=>m.Qualification).ToListAsync();
            return res;
        }

        [ODataRoute("ManagementIntents({Id})")]
        [ResponseType(typeof(ManagementIntent))]
        public async Task<IHttpActionResult> GetHdgetype( int Id)
        {
            ManagementIntent managementIntent = await _db.ManagementIntents.SingleOrDefaultAsync(i => i.Id == Id);

            if (managementIntent == null)
                return NotFound();

            return Ok(managementIntent);
        }
    }
}