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
    public class InternalStatesController : ODataController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        // READ ALL
        public async Task<IEnumerable<InternalState>> GetInternalStates()
        {
            return await _db.InternalStates.ToListAsync();
        }

        // READ BY KEY
        [ODataRoute("InternalStates({Id})")]
        [ResponseType(typeof(InternalState))]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> GetInternalState( int Id)
        {
            InternalState internalState = await _db.InternalStates.SingleOrDefaultAsync(i => i.Id == Id);

            if (internalState == null)
                return NotFound();

            return Ok(internalState);
        }
    }
}