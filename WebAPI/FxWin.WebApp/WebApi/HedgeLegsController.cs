using FXWIN.Data.Provider;
using System.Collections.Generic;
using System.Data.Entity;
using System.Threading.Tasks;
using System.Web.Http.Description;
using System.Web.OData;
using System.Web.OData.Query;

namespace FxWin.WebApp.WebApi
{
    [ApiExplorerSettings(IgnoreApi = false)]
    public class HedgeLegsController : ODataController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        // READ ALL
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IEnumerable<HedgeLeg>> GetHedgeLegs()
        {
            return await _db.HedgeLegs.ToListAsync();
        }
    }
}