using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;


namespace FXWIN.ConnectionHubs
{
    public class HubFunctions
    {
        public static void SendProgress(string progressMessage, int progressCount, int totalItems)
        {
            //IN ORDER TO INVOKE SIGNALR FUNCTIONALITY DIRECTLY FROM SERVER SIDE WE MUST USE THIS
            var hubContext = GlobalHost.ConnectionManager.GetHubContext<ProgressHub>();

            //CALCULATING PERCENTAGE BASED ON THE PARAMETERS SENT
            var percentage = (progressCount * 100) / totalItems;

            //PUSHING DATA TO ALL CLIENTS
            hubContext.Clients.All.AddProgress(progressMessage, percentage + "%");
        }

        public static void SendMessage(string message)
        {
            //IN ORDER TO INVOKE SIGNALR FUNCTIONALITY DIRECTLY FROM SERVER SIDE WE MUST USE THIS
            var hubContext = GlobalHost.ConnectionManager.GetHubContext<ProgressHub>();
            //PUSHING DATA TO ALL CLIENTS
            hubContext.Clients.All.SendMessage(message);
        }

        public static void SendRefreshData(string data)
        {
            //IN ORDER TO INVOKE SIGNALR FUNCTIONALITY DIRECTLY FROM SERVER SIDE WE MUST USE THIS
            var hubContext = GlobalHost.ConnectionManager.GetHubContext<ProgressHub>();
            //PUSHING DATA TO ALL CLIENTS
            hubContext.Clients.All.SendRefreshData(data);
        }

        public static void WaitProcess(string processName)
        {
            //IN ORDER TO INVOKE SIGNALR FUNCTIONALITY DIRECTLY FROM SERVER SIDE WE MUST USE THIS
            var hubContext = GlobalHost.ConnectionManager.GetHubContext<ProgressHub>();
            //PUSHING DATA TO ALL CLIENTS
            hubContext.Clients.All.WaitProcess(processName);
        }

        public static void EndProcess(string processName)
        {
            //IN ORDER TO INVOKE SIGNALR FUNCTIONALITY DIRECTLY FROM SERVER SIDE WE MUST USE THIS
            var hubContext = GlobalHost.ConnectionManager.GetHubContext<ProgressHub>();
            //PUSHING DATA TO ALL CLIENTS
            hubContext.Clients.All.EndProcess(processName);
        }


    }
}