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
    [ApiExplorerSettings(IgnoreApi = false)]
    public class HedgeTypesController : ODataController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        // READ ALL
        public async Task<IEnumerable<HedgeType>> GetHedgeTypes()
        {
            return await _db.HedgeTypes.ToListAsync();
        }

        // READ BY KEY
        [ODataRoute("HedgeTypes({Id})")]
        [ResponseType(typeof(HedgeType))]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> GetHedgeType( int Id)
        {
            HedgeType hedgeType = await _db.HedgeTypes.SingleOrDefaultAsync(i => i.Id == Id);

            if (hedgeType == null)
                return NotFound();

            return Ok(hedgeType);
        }
    }
}