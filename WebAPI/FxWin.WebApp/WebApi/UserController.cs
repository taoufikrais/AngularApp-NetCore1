using System.Data.Entity;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using FXWIN.Data.Provider;

namespace FxWin.WebApp.WebApi
{

    namespace FxWin.WebApp.WebApi
    {
        [RoutePrefix("api/Users")]
        [ApiExplorerSettings(IgnoreApi = false)]
        public class UserController : BasicApiController<FxUser>
        {
            public UserController() : base(false)
            {
            }

            [ResponseType(typeof(string))]
            [HttpGet]
            [AllowAnonymous]
            [Route("Login")]
            public async Task<IHttpActionResult> Login(string gaia)
            {
                var result = await this._repository.CurrentContext.FxUsers.Include(u => u.FxRole).FirstOrDefaultAsync(u => u.UserGaia.Trim().ToLower().Equals(gaia.Trim().ToLower()) && u.IsActive);
                if (result == null)
                {
                    return NotFound();
                }

                return Ok(result);
            }


            [ResponseType(typeof(string))]
            [HttpPost]
            [AllowAnonymous]
            [Route("UpdateUserProfil")]
            public async Task<IHttpActionResult> UpdateUserProfil(string gaia,int profilId)
            {
                var user = await this._repository.CurrentContext.FxUsers.Include(u => u.FxRole).FirstOrDefaultAsync(u => u.UserGaia.Trim().ToLower().Equals(gaia.Trim().ToLower()) && u.IsActive);
                if (user == null)
                {
                    return NotFound();
                }
                else
                {
                    user.FxRoleId = profilId;
                    this._repository.CurrentContext.SaveChanges();
                }

                return Ok(user);
            }


        }
    }
}