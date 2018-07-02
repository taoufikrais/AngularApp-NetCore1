using System;
using System.Collections.Generic;
using System.Linq;
using System.Data.Entity;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using FXWIN.Data.Provider;

namespace FxWin.WebApp.WebApi
{
    [RoutePrefix("api/Reporting")]
    public class ReportingController : ApiController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        [ResponseType(typeof(VW_Reporting))]
        [HttpGet]
        [AllowAnonymous]
        [Route("GetListReporting")]
        public async Task<IHttpActionResult> GetListReporting()
        {
            List<VW_Reporting> VW_Reportings = await _db.VW_Reporting.ToListAsync();
            if (VW_Reportings == null)
            {
                return NotFound();
            }

            return Ok(VW_Reportings);
        }

        [ResponseType(typeof(VW_Cube))]
        [HttpGet]
        [AllowAnonymous]
        [Route("GetCubeData")]
        public async Task<IHttpActionResult> GetCubeData()
        {
            List<VW_Cube> VW_Cubes = await _db.VW_Cube.OrderBy(ctr=>ctr.FxContractCode).OrderBy(y=>y.OperationDateYear).ThenBy(m=>m.OperationDateMonth).ToListAsync();
            if (VW_Cubes == null)
            {
                return NotFound();
            }

            return Ok(VW_Cubes);
        }

        [ResponseType(typeof(VW_CubeFXHedge))]
        [HttpGet]
        [AllowAnonymous]
        [Route("GetCubeFXHedgeData")]
        public async Task<IHttpActionResult> GetCubeFXHedgeData()
        {
            List<VW_CubeFXHedge> VW_CubeFXHedges = await _db.VW_CubeFXHedge.ToListAsync();
            if (VW_CubeFXHedges == null)
            {
                return NotFound();
            }

            return Ok(VW_CubeFXHedges);
        }

        [ResponseType(typeof(VW_CubeCommodity))]
        [HttpGet]
        [AllowAnonymous]
        [Route("GetCubeCommodityData")]
        public async Task<IHttpActionResult> GetCubeCommodityData()
        {
            List<VW_CubeCommodity> VW_CubeCommodity = await _db.VW_CubeCommodity.ToListAsync();
            if (VW_CubeCommodity == null)
            {
                return NotFound();
            }

            return Ok(VW_CubeCommodity);
        }

    }
}
