using System;
using System.Web.Http;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using System.Web.OData;

namespace FxWin.WebApp.Hubs
{
    public abstract class OdataControllerWithHub<THub> : ODataController
        where THub : IHub
    {
        Lazy<IHubContext> hub = new Lazy<IHubContext>(
            () => GlobalHost.ConnectionManager.GetHubContext<THub>()
        );

        protected IHubContext Hub
        {
            get { return hub.Value; }
        }
    }
}