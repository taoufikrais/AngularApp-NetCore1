using System.Security.Principal;
using System.Threading.Tasks;
using FxWin.ClientApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace FxWin.ClientApp.Controllers
{
     [Route("api/Authentification")]
    public class Authentification : Controller
    {
        [HttpGet]
        public JsonResult Index()
        {
            var user = Request.HttpContext.User.Identity.Name;
            if(string.IsNullOrEmpty(user))
            {
                user = WindowsIdentity.GetCurrent().Name;
            }
            return Json(user.Substring(user.IndexOf(@"\") + 1));
        }
    }
}