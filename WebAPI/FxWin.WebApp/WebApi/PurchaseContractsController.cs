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
    public class PurchaseContractsController : ODataController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        // READ ALL
        public async Task<IEnumerable<PurchaseContract>> GetPurchaseContracts()
        {
            return await _db.PurchaseContracts.ToListAsync();
        }

        // READ BY KEY
        [ODataRoute("PurchaseContracts({Id})")]
        [ResponseType(typeof(PurchaseContract))]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> GetPurchaseContract( int Id)
        {
            PurchaseContract purchaseContract = await _db.PurchaseContracts.SingleOrDefaultAsync(i => i.Id == Id);

            if (purchaseContract == null)
                return NotFound();

            return Ok(purchaseContract);
        }
    }
}