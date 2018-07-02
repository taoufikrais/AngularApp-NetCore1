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
    public class SupplyContractsController : ODataController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        // READ ALL
        public async Task<IEnumerable<SupplyContract>> GetSupplyContracts()
        {
            return await _db.SupplyContracts.ToListAsync();
        }

        // READ BY KEY
        [ODataRoute("SupplyContracts({Id})")]
        [ResponseType(typeof(SupplyContract))]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> GetSupplyContract( int Id)
        {
            SupplyContract supplyContract = await _db.SupplyContracts.SingleOrDefaultAsync(i => i.Id == Id);

            if (supplyContract == null)
                return NotFound();

            return Ok(supplyContract);
        }
    }
}