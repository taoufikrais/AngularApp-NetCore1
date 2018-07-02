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
    [ApiExplorerSettings(IgnoreApi = false)]
    public class ContractTypesController : ODataController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        // READ ALL
        public async Task<IEnumerable<ContractType>> GetContractTypes()
        {
            return await _db.ContractTypes.ToListAsync();
        }

        // READ BY KEY
        [ODataRoute("ContractTypes({Id})")]
        [ResponseType(typeof(ContractType))]
        public async Task<IHttpActionResult> GetContractType( int Id)
        {
            ContractType contractType = await _db.ContractTypes.SingleOrDefaultAsync(i => i.Id == Id);

            if (contractType == null)
                return NotFound();

            return Ok(contractType);
        }
    }
}