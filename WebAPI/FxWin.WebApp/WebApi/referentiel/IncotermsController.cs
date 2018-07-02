﻿using FXWIN.Data.Provider;
using System.Collections.Generic;
using System.Data.Entity;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.OData;
using System.Web.OData.Routing;

namespace FxWin.WebApp.WebApi
{
    [ApiExplorerSettings(IgnoreApi = false)]
    public class IncotermsController : ODataController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        // READ ALL
        public async Task<IEnumerable<Incoterm>> GetIncoterms()
        {
            return await _db.Incoterms.ToListAsync();
        }

        // READ BY KEY
        [ODataRoute("Incoterms({Id})")]
        [ResponseType(typeof(Incoterm))]
        public async Task<IHttpActionResult> GetIncoterm( int Id)
        {
            Incoterm incoterm = await _db.Incoterms.SingleOrDefaultAsync(i => i.Id == Id);

            if (incoterm == null)
                return NotFound();

            return Ok(incoterm);
        }
    }
}