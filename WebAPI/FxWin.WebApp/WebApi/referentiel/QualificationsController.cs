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
    public class QualificationsController : ODataController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        // READ ALL
        public async Task<IEnumerable<Qualification>> GetQualifications()
        {
            return await _db.Qualifications.ToListAsync();
        }

        // READ BY KEY
        [ODataRoute("Qualifications({Id})")]
        [ResponseType(typeof(Qualification))]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> GetQualification( int Id)
        {
            Qualification qualification = await _db.Qualifications.SingleOrDefaultAsync(i => i.Id == Id);

            if (qualification == null)
                return NotFound();

            return Ok(qualification);
        }
    }
}