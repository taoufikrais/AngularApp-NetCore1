using FxWin.WebApp.Helper;
using FXWIN.Data.Provider;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.OData;
using System.Web.OData.Extensions;
using System.Web.OData.Query;
using System.Web.OData.Routing;

namespace FxWin.WebApp.WebApi
{
    [ODataRoutePrefix("UnderlyingTerms")]
    [EnableQuery(MaxExpansionDepth = 6)]
    [ApiExplorerSettings(IgnoreApi = false)]
    public class UnderlyingTermController : ODataController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All, MaxExpansionDepth = 6)]//PageSize = 25, 
        public IQueryable<UnderlyingTerm> GetUnderlyingTerms()
        {
            var res = _db.UnderlyingTerms.AsQueryable();
            return res;
        }

        // READ ALL
        [ODataRoute("Default.GetUnderlyingSynthesises")]
        [HttpGet]
        public async Task<IEnumerable<SubjacentSynthesis>> GetUnderlyingSynthesises(int monthUnderlyingMonth, int yearUnderlyingMonth)
        {
            IQueryable<SubjacentSynthesis> query = from t in _db.UnderlyingTerms
                                                   join s in _db.Subjacents on t.UnderlyingId equals s.Id
                                                   where t.Maturity.Year == yearUnderlyingMonth && t.Maturity.Month == monthUnderlyingMonth
                                                   select new SubjacentSynthesis
                                                   {
                                                       Code = s.Code,
                                                       SubjacentId = s.Id,
                                                       PurchaseSale = s.PurchaseSaleId,
                                                       IsBEEMarginSharing = s.IsBEEMarginSharing,
                                                       Id = t.Id,
                                                       LabelEcheance = t.Label,
                                                       MaturityDate = t.Maturity,
                                                       PaymentDate = t.PaymentDate,
                                                       IsBoValidated = t.IsBOValidated,
                                                       Book = t.Subjacent.Book.Code
                                                       
                                                   };
            return await query.ToListAsync();
        }

        [ODataRoute("Default.GetUnderlyingSynthesisByMaturity")]
        [HttpGet]
        public async Task<IEnumerable<SubjacentSynthesis>> GetUnderlyingSynthesisByMaturity(DateTime date)
        {
            var query = from t in _db.UnderlyingTerms
                        join s in _db.Subjacents on t.UnderlyingId equals s.Id
                        where t.Maturity.Year == date.Year && t.Maturity.Month == date.Month
                        select new SubjacentSynthesis
                        {
                            Code = s.Code,
                            SubjacentId = s.Id,
                            PurchaseSale = s.PurchaseSaleId,
                            IsBEEMarginSharing = s.IsBEEMarginSharing,
                            Id = t.Id,
                            LabelEcheance = t.Label,
                            MaturityDate = t.Maturity,
                            PaymentDate = t.PaymentDate,
                            IsBoValidated = t.IsBOValidated,
                            Book = t.Subjacent.Book.Code,
                        };

            return await query.ToListAsync();
        }
        
        // DELETE
        [HttpDelete]
        [ODataRoute("({Id})")]
        [ResponseType(typeof(UnderlyingTerm))]
        public async Task<IHttpActionResult> Delete(int Id)
        {
            UnderlyingTerm underlyingTerm = await _db.UnderlyingTerms.FindAsync(Id);

            if (underlyingTerm == null)
                return NotFound();

            if (underlyingTerm.IsBOValidated != 0)
                return new HttpActionResult(HttpStatusCode.Conflict, "This Underlying Term cannot be deleted - It is not in \"Not validated\" State");
            if (underlyingTerm.HedgeLegs.Count != 0)
                return new HttpActionResult(HttpStatusCode.Conflict, "This Underlying Term Cannot Be Deleted - It is Currenctly Linked to A Hedge Leg");
            if (underlyingTerm.CommodityHedges.Count != 0)
                return new HttpActionResult(HttpStatusCode.Conflict, "This Underlying Term Cannot Be Deleted - It is Currenctly Linked to A Commodity Hedge");

            _db.UnderlyingTerms.Remove(underlyingTerm);

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (Exception exp)
            {
                throw;
            }

            return Ok(underlyingTerm);
        }
    }
}