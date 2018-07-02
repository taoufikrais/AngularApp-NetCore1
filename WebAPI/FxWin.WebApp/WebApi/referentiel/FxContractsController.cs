using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Dynamic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using FXWIN.Data.Provider;
using Newtonsoft.Json;

namespace FxWin.WebApp.WebApi
{

    /// <summary>
    /// FxContractsController
    /// </summary>
    [RoutePrefix("api/FxContracts")]
    [ApiExplorerSettings(IgnoreApi = false)]
    public class FxContractsController : BasicApiController<FxContract>
    {
        /// <summary>
        /// FxContractsController constructor
        /// </summary>
        public FxContractsController() : base(false)
        {
         
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet]
        //[ActionName("LoadFxContractSettings")]
        [AllowAnonymous]
        [Route("LoadFxContractSettings")]
        public async Task<IHttpActionResult> LoadFxContractSettings(int id)
        {
            dynamic flexible = new ExpandoObject();
            var dictionary = (IDictionary<string, object>)flexible;
            //if (id > 0 )
            //{
            flexible.MarginSharingBEE = false;
            flexible.IsFiftyFifty = false;
            flexible.PaymentOffset = 0;
            flexible.ContractType = 0;
            flexible.OrderNumberPrefix = 0;
            flexible.IsMTContract = false;
            flexible.IsSpotContract = false;

            //}
            //else
            //{
            //    flexible.MarginSharingBEE = false;
            //    flexible.IsFiftyFifty = false;
            //    flexible.PaymentOffset = 0;
            //}
            var serialized = JsonConvert.SerializeObject(flexible);
            return Ok(serialized);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [ResponseType(typeof(VW_LinkFxContractSignalContract))]
        [HttpGet]
        //[ActionName("GetListVW_LinkFxContractSignalContract")]
        [AllowAnonymous]
        [Route("GetListVW_LinkFxContractSignalContract")]
        public async Task<IHttpActionResult> GetListVW_LinkFxContractSignalContract(int id)
        {
            List<VW_LinkFxContractSignalContract> VW_LinkFxContractSignalContract = await this._repository.CurrentContext.VW_LinkFxContractSignalContract.Where(l => l.FxContractId == id).OrderBy(l => l.Code).ToListAsync();
            if (VW_LinkFxContractSignalContract == null)
            {
                return NotFound();
            }

            return Ok(VW_LinkFxContractSignalContract);
        }

        [ResponseType(typeof(VW_LinkFxContractSignalContract))]
        [HttpGet]
        [AllowAnonymous]
        [Route("GetCustom")]
        public async Task<IHttpActionResult> GetCustom()
        {
            List<VW_LinkFxContractSignalContract> VW_LinkFxContractSignalContract = await this._repository.CurrentContext.VW_LinkFxContractSignalContract.OrderBy(l => l.Code).ToListAsync();
            if (VW_LinkFxContractSignalContract == null)
            {
                return NotFound();
            }

            return Ok(VW_LinkFxContractSignalContract);
        }
    }
}