using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Formatting;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace FxWin.WebApp
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            GlobalConfiguration.Configuration.Formatters.JsonFormatter.AddQueryStringMapping("$format", "json", "application/json");
            GlobalConfiguration.Configuration.Formatters.JsonFormatter.SerializerSettings.PreserveReferencesHandling = PreserveReferencesHandling.None;
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(config =>
            {
                SwaggerConfig.Register();
                ODataConfig.Register(config); //this has to be before WebApi
                WebApiConfig.Register(config);
            });

            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }

        //protected void Application_BeginRequest(object sender, EventArgs e)
        //{
        //   // EnblaCorsOrigin();
           
        //}

        private void EnblaCorsOrigin()
        {
            // //enable Cors ORIGIN in Odata.NET service for Option Request ("POST, PUT")
            //if (HttpContext.Current.Request.HttpMethod == "OPTIONS")
            //{
            //    HttpContext.Current.Response.AddHeader("Cache-Control", "no-cache");
            //    HttpContext.Current.Response.AddHeader("Access-Control-Allow-Methods", "GET, POST");
            //    HttpContext.Current.Response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
            //    HttpContext.Current.Response.AddHeader("Access-Control-Max-Age", "1728000");
            //    HttpContext.Current.Response.End();
            //}

        }
    }
}
