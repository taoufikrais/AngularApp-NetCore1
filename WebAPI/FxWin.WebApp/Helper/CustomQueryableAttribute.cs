using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http.Filters;
using System.Web.OData.Query;

namespace FxWin.WebApp.Helper
{
    /// <summary>
    /// http://localhost:60257/api/Cargos?$top=25&$count=true
    /// l'apple à cette URL génere une erreur de ce type Odata: The query parameter '$count' is not supported
    /// en realité c'est un prolem de d'acces cross origin , l'errreur remonté par le navigateur n'est pas correcte , dés coup j'ai devolpé cette class  ,
    /// elle resoud une parti du problems pour les metodes GET mais on auras de blocage d'acces sur methodes post et put,
    /// la bonne solution est implimenté dans le fichier global.asax methode enablecrossOrigin  
    /// Adding OData Inline Count Support to the ASP.NET Web API
    /// Supporting OData $inlinecount with the new Web API OData preview package
    /// for resolve this error when to call odata wab api service from angular client : 
    /// Odata: The query parameter '$count' is not supported 
    /// https://www.strathweb.com/2012/08/supporting-odata-inlinecount-with-the-new-web-api-odata-preview-package/
    /// https://janvanderhaegen.wordpress.com/2015/04/30/supporting-odata-inlinecount-json-verbose-with-web-api-odata/
    /// </summary>
    public class CustomQueryableAttribute : QueryableAttribute
    {
        public override void OnActionExecuted(HttpActionExecutedContext actionExecutedContext)
        {
            long? originalsize = null;
            var inlinecount = HttpUtility.ParseQueryString(actionExecutedContext.Request.RequestUri.Query).Get("$inlinecount");

            object responseObject;
            actionExecutedContext.Response.TryGetContentValue(out responseObject);
            var originalquery = responseObject as IQueryable<object>;

            if (originalquery != null && inlinecount == "allpages")
                originalsize = originalquery.Count();

            base.OnActionExecuted(actionExecutedContext);

            if (ResponseIsValid(actionExecutedContext.Response))
            {
                actionExecutedContext.Response.TryGetContentValue(out responseObject);

                if (responseObject is IQueryable)
                {
                    var robj = responseObject as IQueryable<object>;

                    if (originalsize != null)
                    {
                        actionExecutedContext.Response = actionExecutedContext.Request.CreateResponse(HttpStatusCode.OK, new ODataMetadata<object>(robj, originalsize));
                    }
                }
            }
        }

        public override void ValidateQuery(HttpRequestMessage request, ODataQueryOptions queryOptions)
        {
            //everything is allowed
        }

        private bool ResponseIsValid(HttpResponseMessage response)
        {
            if (response == null || response.StatusCode != HttpStatusCode.OK || !(response.Content is ObjectContent)) return false;
            return true;
        }
    }

    /// <summary>
    /// Adding OData Inline Count Support to the ASP.NET Web API
    /// https://thedevstop.wordpress.com/2012/04/05/adding-odata-inline-count-support-to-the-asp-net-web-api/
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class ODataMetadata<T> where T : class
    {
        private readonly long? _count;
        private IEnumerable<T> _result;

        public ODataMetadata(IEnumerable<T> result, long? count)
        {
            _count = count;
            _result = result;
        }

        public IEnumerable<T> Results
        {
            get { return _result; }
        }

        public long? Count
        {
            get { return _count; }
        }
    }
}