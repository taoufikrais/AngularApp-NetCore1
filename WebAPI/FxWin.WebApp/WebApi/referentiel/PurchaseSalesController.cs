using System.Web.Http;
using FXWIN.Data.Provider;

namespace FxWin.WebApp.WebApi
{
    [RoutePrefix("api/PurchaseSales")]
    public class PurchaseSalesController : BasicApiController<PurchaseSale>
    {
        public PurchaseSalesController() : base(false)
        {
        }


    }
}
