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
    public class SubjacentTypesController : ODataController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        // READ ALL
        public async Task<IEnumerable<SubjacentType>> GetSubjacentTypes()
        {
            return await _db.SubjacentTypes.ToListAsync();
        }

        // READ BY KEY
        [ODataRoute("SubjacentTypes({Id})")]
        [ResponseType(typeof(SubjacentType))]
        public async Task<IHttpActionResult> GetSubjacentType( int Id)
        {
            SubjacentType subjacentType = await _db.SubjacentTypes.SingleOrDefaultAsync(i => i.Id == Id);

            if (subjacentType == null)
                return NotFound();

            return Ok(subjacentType);
        }
    }
}