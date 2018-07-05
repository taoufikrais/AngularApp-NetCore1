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
    [RoutePrefix("api/System")]
    public class SystemController : ApiController
    {
        [HttpGet]
        [AllowAnonymous]
        [Route("GetConnexionString")]
        public async Task<IHttpActionResult> GetConnexionString()
        {
            System.Configuration.Configuration rootWebConfig = System.Web.Configuration.WebConfigurationManager.OpenWebConfiguration("/FxWin.WebApp");
            System.Configuration.ConnectionStringSettings connString;
            if (rootWebConfig.ConnectionStrings.ConnectionStrings.Count > 0)
            {
                connString = rootWebConfig.ConnectionStrings.ConnectionStrings["FXWinV2Entities"];
                if (connString != null)
                    return Ok(connString.ConnectionString);
                else
                    return NotFound();
            }
            return NotFound();
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("CheckDbConnexion")]
        public async Task<IHttpActionResult> CheckDbConnexion()
        {
            try
            {
                FXWinV2Entities _db = new FXWinV2Entities();
                _db.Books.ToList();
                return Ok("Db connexion OK");
            }
            catch (Exception exp)
            {
                throw new HttpResponseException(new HttpResponseMessage(HttpStatusCode.InternalServerError)
                {
                    Content = new StringContent(exp.Message),
                    ReasonPhrase = "Critical Exception : " + exp.Message
                });
            }
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("GetLogs")]
        public async Task<IHttpActionResult> GetLogs()
        {
            System.Configuration.Configuration rootWebConfig = System.Web.Configuration.WebConfigurationManager.OpenWebConfiguration("/FxWin.WebApp");
            System.Configuration.ConnectionStringSettings connString;
            if (rootWebConfig.ConnectionStrings.ConnectionStrings.Count > 0)
            {
                connString = rootWebConfig.ConnectionStrings.ConnectionStrings["FXWinV2Entities"];
                if (connString != null)
                    return Ok(connString.ConnectionString);
                else
                    return NotFound();
            }
            return NotFound();
        }


    }
}
