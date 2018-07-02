using System.Threading.Tasks;
using FxWin.ClientApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace FxWin.ClientApp.Controllers
{
    [Route("api/AppConfig")]
    public class AppConfigController : Controller
    {
        private IOptions<AppConfig> _AppConfig;
        public AppConfigController(IOptions<AppConfig> appConfig)
        {
            _AppConfig = appConfig;
        }

        // problems with cache
        [HttpGet]
        public IActionResult Index()
        {
            return Ok(_AppConfig.Value);
        }

        [HttpPost]
        [Route("notify-import")]
        public async Task<IActionResult> NotifyAsync([FromBody] string message)
        {
            //await _serverSentEventsService.SendEventAsync(message);
            //if (message.Contains("\"end\""))
            //{
                await Task.Delay(1000);
            //    await _serverSentEventsService.SendEventAsync(message);
            //}
            return  Ok(true);
        }
    }
}
