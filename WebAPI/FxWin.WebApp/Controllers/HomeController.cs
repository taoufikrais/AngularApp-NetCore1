using FXWIN.ConnectionHubs;
using System.Threading;
using System.Web.Mvc;

namespace FxWin.WebApp.Controllers
{
    public class HomeController : Controller
    {
        // GET: App
        public ActionResult Index()
        {
            return View();
        }


        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }



        public JsonResult LongRunningProcess()
        {
            //THIS COULD BE SOME LIST OF DATA
            int itemsCount = 100;

            for (int i = 0; i <= itemsCount; i++)
            {
                //SIMULATING SOME TASK
                Thread.Sleep(100);

                //CALLING A FUNCTION THAT CALCULATES PERCENTAGE AND SENDS THE DATA TO THE CLIENT
                HubFunctions.SendProgress("Process in progress...", i, itemsCount);
            }

            return Json("", JsonRequestBehavior.AllowGet);
        }
    }
}