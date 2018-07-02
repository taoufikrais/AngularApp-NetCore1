using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FXWIN.ConnectionHubs
{
    public class ProgressHub : Hub
    {

        public void SendToAll(string name, string message)
        {
            Clients.All.addNewMessageToPage(name, message);
        }

        public void GetRealTime()
        {

            Clients.Caller.setRealTime(DateTime.Now.ToString("h:mm:ss tt"));
        }
    }
}