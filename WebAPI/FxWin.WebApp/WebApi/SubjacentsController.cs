using FXWIN.Data.Provider;
using RefactorThis.GraphDiff;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.OData;
using System.Web.OData.Query;
using System.Web.OData.Routing;

namespace FxWin.WebApp.WebApi
{
    [ODataRoutePrefix("Subjacents")]
    [EnableQuery(MaxExpansionDepth = 6)]
    [ApiExplorerSettings(IgnoreApi = false)]
    public class SubjacentsController : ODataController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        // READ BY KEY
        [ODataRoute("({Id})")]
        [ResponseType(typeof(Subjacent))]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> GetSubjacent(int Id)
        {
            Subjacent subjacent = await _db.Subjacents.SingleOrDefaultAsync(i => i.Id == Id);

            if (subjacent == null)
                return NotFound();

            return Ok(subjacent);
        }


        [ODataRoute("Default.GetSubjacentViews")]
        [HttpGet]
        [EnableQuery]
        public async Task<IEnumerable<SubjacentView>> GetSubjacentViews()
        {
            var withoutCount = from u in _db.UnderlyingTerms
                               join s in _db.Subjacents on u.UnderlyingId equals s.Id
                               join st in _db.SubjacentTypes on s.SubjacentTypeId equals st.Id
                               join p in _db.PurchaseSales on s.PurchaseSaleId equals p.Id
                               join b in _db.Books on s.BookId equals b.Id
                               select new { Id = s.Id, Code = s.Code, Type = st.Code, OperationType = p.Code, BookCode = b.Code };

            var withCount = from d in withoutCount
                            group d by new { d.Id, d.Code, d.Type, d.OperationType, d.BookCode } into g
                            select new SubjacentView
                            {
                                Id = g.Key.Id
                                ,
                                Code = g.Key.Code
                                ,
                                Type = g.Key.Type
                                ,
                                NumberOfMaturities = g.Count()
                                ,
                                OperationType = g.Key.OperationType
                                ,
                                BookCode = g.Key.BookCode
                            };

            return await withCount.ToListAsync();
        }

        // DELETE
        [HttpDelete]
        [ODataRoute("({Id})")]
        [ResponseType(typeof(Subjacent))]
        public async Task<IHttpActionResult> Delete(int Id)
        {
            Subjacent subjacent = await _db.Subjacents.FindAsync(Id);

            if (subjacent == null)
                return NotFound();

            List<HedgeLeg> hedgeLegs = new List<HedgeLeg>();
            List<CommodityHedge> commoHedges = new List<CommodityHedge>();
            List<UnderlyingTerm> underLyingTerms = new List<UnderlyingTerm>();

            foreach (UnderlyingTerm u in subjacent.UnderlyingTerms)
            {
                hedgeLegs.AddRange(u.HedgeLegs);
                commoHedges.AddRange(u.CommodityHedges);
                underLyingTerms.Add(u);
            }

            foreach (HedgeLeg h in hedgeLegs)
                _db.HedgeLegs.Remove(h);

            foreach (CommodityHedge c in commoHedges)
                _db.CommodityHedges.Remove(c);

            foreach (UnderlyingTerm u in underLyingTerms)
                _db.UnderlyingTerms.Remove(u);

            _db.Subjacents.Remove(subjacent);

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (Exception exp)
            {
                throw;
            }

            return Ok(subjacent);
        }

        // UPDATE
        [HttpPut]
        [ODataRoute("({Id})")]
        public async Task<IHttpActionResult> Put(int Id, Subjacent subjacent)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (Id != subjacent.Id)
                return BadRequest();

            try
            {
                _db.UpdateGraph(subjacent, map => map
                                            .AssociatedEntity(s => s.SubjacentType)
                                            .AssociatedEntity(s => s.ContractType)
                                            .AssociatedEntity(s => s.Book)
                                            .OwnedCollection(s => s.UnderlyingTerms
                                            //, with => with.OwnedEntity(u => u.Currency)
                                            )
                                        );
                await _db.SaveChangesAsync();
            }
            catch (DbEntityValidationException e)
            {
                List<string> errors = new List<string>();
                foreach (var eve in e.EntityValidationErrors)
                {
                    errors.Add(
                        string.Format("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
                            eve.Entry.Entity.GetType().Name, eve.Entry.State));
                    foreach (var ve in eve.ValidationErrors)
                    {
                        errors.Add(string.Format("- Property: \"{0}\", Error: \"{1}\"",
                            ve.PropertyName, ve.ErrorMessage));
                    }
                }
                throw;
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!subjacentExist(Id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            catch (Exception exp)
            {
                Console.WriteLine(exp.Message);
                throw;
            }
            return Updated(subjacent);
        }

        private bool subjacentExist(int id)
        {
            return _db.Subjacents.Count(e => e.Id == id) > 0;
        }
    }
}