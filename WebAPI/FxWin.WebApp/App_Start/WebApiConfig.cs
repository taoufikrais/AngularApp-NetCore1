using System.Collections.Generic;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Routing;
using System.Web.Http.Tracing;
using FxWin.WebApp.App_Start;
using Newtonsoft.Json;
using System.Web.Http.Cors;
using Newtonsoft.Json.Converters;
using System.Globalization;

namespace FxWin.WebApp
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            AddCustomjsonFormater(config);
            EnableCrossSiteRequests(config);
            //AddRoutes(config);
            AddloggerTracer(config);
    }

        private static void EnableCrossSiteRequests(HttpConfiguration config)
        {
            var cors = new EnableCorsAttribute(
                origins: "*",
                headers: "*",
                methods: "*");
            config.EnableCors(cors);
        }

        private static void AddRoutes(HttpConfiguration config)
        {
            config.Routes.MapHttpRoute(
            name: "Default",
            routeTemplate: "api/{controller}/"
            );
            //on aura besoin de cette route pour les generics repository webapi (web api heritant de BasicApiController.cs)
            // on aura de nom de methode generic de Type GETall ,GET ,POST sans de route sepcific 
            //si on supprime cette route ce type de webapi plante 
            //config.Routes.MapHttpRoute(
            //    name: "API Default",
            //    routeTemplate: "api/{controller}/{id}",
            //    defaults: new { id = RouteParameter.Optional }
            //);

            //cette route qui resout plusieurs problem surtout avec swagger parce que 
            //ca elimine le faite d'exposer les methodes des webapi dans swagger  avec tous les routes possibles (il faut supprimer les autres routes )
            // et permet d'appler de Multiple get dans le meme web api avec swagger 
            //config.Routes.MapHttpRoute(
            //    name: "DefaultApi",
            //    routeTemplate: "api/{controller}/{action}/{id}",
            //   // defaults: new { action = "Get" }
            //    defaults: new { id = RouteParameter.Optional }
            //);



            // on aura besoin de cette route pour adresser les customs fonctions dans le web api classique 
            // voir exemple dans FxContract web api [ActionName("GetListVW_LinkFxContractSignalContract")]
            //si on supprime cette route ce type de methode ou function on peux pas les appelez
            //config.Routes.MapHttpRoute(
            //name: "API ByActionName",
            //routeTemplate: "api/{controller}/{action}/{name}",
            //defaults: null,
            //constraints: new { name = @"^[a-z]+$" });
        }

        private static void AddCustomjsonFormater(HttpConfiguration config)
        {
            // Web API configuration and services

            var jsonFormatter = config.Formatters.JsonFormatter;
            var json = GlobalConfiguration.Configuration.Formatters.JsonFormatter;

           // json.SerializerSettings.DateFormatHandling = Newtonsoft.Json.DateFormatHandling.IsoDateFormat;
            //json.SerializerSettings.DateTimeZoneHandling = Newtonsoft.Json.DateTimeZoneHandling.Unspecified;

            //jsonFormatter.SerializerSettings.Converters.Add(new IsoDateTimeConverter() { DateTimeFormat = "yyyy/MM/dd" });

            config.Formatters.Remove(config.Formatters.XmlFormatter);

            //json.UseDataContractJsonSerializer = true;
            /*
            jsonFormatter.SerializerSettings.PreserveReferencesHandling = Newtonsoft.Json.PreserveReferencesHandling.Objects;
            jsonFormatter.SerializerSettings.DateParseHandling = DateParseHandling.DateTime;
            jsonFormatter.SerializerSettings.Culture = new System.Globalization.CultureInfo("en-GB");*/

            jsonFormatter.SerializerSettings.Formatting = Formatting.Indented;

            //Ignoring circular reference globally,Loop Reference handling in Web API
            //https://blogs.msdn.microsoft.com/hongyes/2012/09/04/loop-reference-handling-in-web-api/
            jsonFormatter.SerializerSettings.PreserveReferencesHandling = PreserveReferencesHandling.None;
            //Preserving circular reference globally and The data shape will be changed after applying this setting.  ( $id in primary key will be add  and $ref foregein key to json reponse ) 
            //jsonFormatter.SerializerSettings.PreserveReferencesHandling = PreserveReferencesHandling.Objects;
            jsonFormatter.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;

        }

        private static void AddloggerTracer(HttpConfiguration config)
        {
            SystemDiagnosticsTraceWriter traceWriter = config.EnableSystemDiagnosticsTracing();
            traceWriter.IsVerbose = true;
            traceWriter.MinimumLevel = TraceLevel.Debug;
            config.Services.Replace(typeof(ITraceWriter), new SimpleTracer());
        }

    }

    /// <summary>
    /// Support inheritance of Route attributes for generic web api  
    /// https://docs.microsoft.com/en-us/aspnet/web-api/overview/releases/whats-new-in-aspnet-web-api-22
    /// </summary>
    public class CustomDirectRouteProvider : DefaultDirectRouteProvider
    {
        protected override IReadOnlyList<IDirectRouteFactory>
        GetActionRouteFactories(HttpActionDescriptor actionDescriptor)
        {
            return actionDescriptor.GetCustomAttributes<IDirectRouteFactory>(inherit: true);
        }
    }
}
