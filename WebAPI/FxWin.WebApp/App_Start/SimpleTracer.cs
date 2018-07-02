using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Http.Tracing;
using FXWIN.Data.Provider;
using Newtonsoft.Json;

namespace FxWin.WebApp.App_Start
{
    public class SimpleTracer : ITraceWriter
    {
        //private static readonly ILog log = log4net.LogManager.GetLogger(typeof(MyProjectTracer));
        public void Trace(HttpRequestMessage request, string category, TraceLevel level, Action<TraceRecord> traceAction)
        {
            TraceRecord rec = new TraceRecord(request, category, level);
            string strjson = GetJsonRequest();
            //var c = JsonConvert.DeserializeObject<Cargo>(strjson);
            //var sc = JsonConvert.DeserializeObject<SignalContractExclusion>(strjson);
            try
            {
                var fx = JsonConvert.DeserializeObject<FXHedge>(strjson);
                traceAction(rec);
                WriteTrace(rec);
            }
            catch (Exception exp)
            {
                Console.WriteLine(exp.Message);
                throw exp;
            }

        }

        protected void WriteTrace(TraceRecord rec)
        {
            var message = string.Format("{0};{1};{2}", rec.Operator, rec.Operation, rec.Message);
            //log.Info(strLog);
            System.Diagnostics.Trace.WriteLine(message, rec.Category);
        }

        private string GetJsonRequest()
        {
            try
            {
                System.IO.StreamReader reader = new System.IO.StreamReader(HttpContext.Current.Request.InputStream);
                reader.BaseStream.Position = 0;
                return reader.ReadToEnd();
            }
            catch (Exception exp)
            {
                Console.WriteLine(exp.Message);
                return null;
            }
        }

     }
}