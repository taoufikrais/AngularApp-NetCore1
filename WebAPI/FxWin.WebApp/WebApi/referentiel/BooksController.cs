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
    public class BooksController : ODataController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        // READ ALL
        public async Task<IEnumerable<Book>> GetBooks()
        {
            return await _db.Books.ToListAsync();
        }

        // READ BY KEY
        [ODataRoute("Books({Id})")]
        [ResponseType(typeof(Book))]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> GetCurrency( int Id)
        {
            Book book = await _db.Books.SingleOrDefaultAsync(i => i.Id == Id);

            if (book == null)
                return NotFound();

            return Ok(book);
        }
    }
}