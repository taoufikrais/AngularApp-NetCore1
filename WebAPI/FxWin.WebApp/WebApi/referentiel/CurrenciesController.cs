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
    public class CurrenciesController : ODataController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        // READ ALL
        public async Task<IEnumerable<Currency>> GetCurrencies()
        {
            return await _db.Currencies.ToListAsync();
        }

        // READ BY KEY
        [ODataRoute("Currencies({Id})")]
        [ResponseType(typeof(Currency))]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> GetCurrency( int Id)
        {
            Currency currency = await _db.Currencies.SingleOrDefaultAsync(i => i.Id == Id);

            if (currency == null)
                return NotFound();

            return Ok(currency);
        }
    }
}