using System.Web.Http;
using FXWIN.Data.Provider;
using System;
using System.Collections.Generic;
using System.Web.Http.Description;
using System.Globalization;
using System.Linq;
using FXWIN.Common.Extensions;

namespace FxWin.WebApp.WebApi
{
    [RoutePrefix("api/FXHedges")]
    public class FXHedgesController : BasicApiController<FXHedge>
    {
        public FXHedgesController() : base(false)
        {
        }


        [ResponseType(typeof(FxwinTrade))]
        [HttpGet]
        [Route("GetFxWinHedgeTrade")]
        public List<FxwinTrade> GetFxWinHedgeTrade(DateTime startDate, DateTime endDate,string versionDate=null, DateTime? executionStartDate = null, DateTime? executionEndDate = null)
        {
            var query = this._repository.CurrentContext.VW_ExportFxHedges.Where(p => p.UnderlyingMonth >= startDate.Date
                                                            && p.UnderlyingMonth <= endDate.Date);

            DateTime? versionDateTime = null;
            if (!string.IsNullOrEmpty(versionDate) && versionDate != "null")
            {
                versionDateTime = DateTime.ParseExact(versionDate, "yyyyMMddHHmmss", null);
                versionDateTime = versionDateTime.Value.AddMinutes(1);
            }
            if (versionDateTime.HasValue)
            {
                query = query.Where(p => p.ModificationDate.Value > versionDateTime.Value);
            }
            if (executionStartDate.HasValue && executionEndDate.HasValue)
            {
                query = query.Where(p => p.ExecutionDate.Value.Date >= executionStartDate.Value.Date && p.ExecutionDate.Value.Date <= executionEndDate.Value.Date).OrderByDescending(h => h.ModificationDate);
            }
            var data = query.OrderByDescending(h => h.ModificationDate).ToList();

            var dataReturn = new List<FxwinTrade>();
            if (!data.IsNullOrEmpty())
            {
                CultureInfo fr = new CultureInfo("fr-FR");
                 data.ForEach(d => dataReturn.Add(d.ConvertToFxWinTrade(fr)));
            }

            return dataReturn;
        }
    }
}
