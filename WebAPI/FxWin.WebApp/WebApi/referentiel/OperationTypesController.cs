using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Migrations;
using System.Data.Entity.Validation;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.OData;
using System.Web.OData.Query;
using System.Web.OData.Routing;
using FXWIN.Data.Provider;

//using System.Web.Http.OData;


namespace FxWin.WebApp.WebApi
{
    //RouteByDefault
    [ODataRoutePrefix("OperationTypes")]
    //[EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
    public class OperationTypesController : ODataController //ApiController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        //GET: api/OperationTypees
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]//PageSize = 25, 
        //[CustomQueryable]
        public IQueryable<OperationType> GetOperationTypes()
        {
           var res = _db.OperationTypes.AsQueryable();
            return res;
        }

        // GET URL: http://localhost:60257/webapi/OperationTypes/5
        // GET URL: http://localhost:60257/odata/OperationTypes(5)/
        [ODataRoute("({Id})")]
        [ResponseType(typeof(OperationType))]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> Get( int Id)
        {
            //Find() and FindAsync() are methods on type DbSet (which is what db.Items is). Include() returns a DbQuery object, 
            //which is why FindAsync() is not available. Use SingleOrDefaultAsync() to do the same thing as FindAsync()
            //(the difference is it will go straight to the database and won't look in the context to see if the entity exists first)...
            //OperationType OperationType = await _db.OperationTypes.FindAsync(Id);
            OperationType OperationType = await _db.OperationTypes.SingleOrDefaultAsync(i => i.Id == Id);
            if (OperationType == null)
            {
                return NotFound();
            }

            return Ok(OperationType);
        }

        // GET /odata/Products(1)/ODataRouting.Models.Book
        // GET URL: http://localhost:60257/api/OperationTypes/5
        // GET URL: http://localhost:60257/api/OperationTypes(5)/
        [ResponseType(typeof(OperationType))]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> GetOperationType( int Id)//[FromBody] web api classic
        {
            OperationType OperationType = await _db.OperationTypes.FindAsync(Id);
            if (OperationType == null)
            {
                return NotFound();
            }

            return Ok(OperationType);
        }

        // POST URL: http://localhost:60257/api/OperationTypes
        [ResponseType(typeof(OperationType))]
        [HttpPost]
        [ODataRoute()]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> Post([FromBody] OperationType OperationType)//[FromBody] in classic web api 
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (OperationType == null)
            {
                return BadRequest("Object value null");
            }
            _db.OperationTypes.AddOrUpdate(OperationType);
            try
            {
                await _db.SaveChangesAsync();
             
            }
            catch (DbEntityValidationException e)
            {
                List<string> errors = new List<string>();
                foreach (var eve in e.EntityValidationErrors)
                {
                    errors.Add(string.Format("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
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
                if (!OperationTypeExists(OperationType.Id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return Created(OperationType);
            //return CreatedAtRoute("DefaultApi", new { id = OperationType.Id }, OperationType);
        }

        // PUT URL : http://localhost:60257/api/OperationTypes/1 classic web api 
        // PUT URL : http://localhost:60257/api/OperationTypes(1)/ odata service 
        //[ResponseType(typeof(void))]
        [ResponseType(typeof(OperationType))]
        [HttpPut]
        [ODataRoute("({Id})")]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> Put( int Id ,[FromBody] OperationType OperationType)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (Id != OperationType.Id)
            {
                return BadRequest();
            }
            _db.Entry(OperationType).State = EntityState.Modified;
            
            try
            {
                _db.OperationTypes.AddOrUpdate(OperationType);
                await _db.SaveChangesAsync();
            }
            catch (DbEntityValidationException e)
            {
                List<string> errors = new List<string>();
                foreach (var eve in e.EntityValidationErrors)
                {
                    errors.Add(string.Format("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
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
                if (!OperationTypeExists(Id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return Updated(OperationType);
            //return StatusCode(HttpStatusCode.NoContent);
        }

        // DELETE: http://localhost:60257/api/OperationTypes/1
        [ResponseType(typeof(OperationType))]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> Delete(int id)
        {
            OperationType OperationType = await _db.OperationTypes.FindAsync(id);
            if (OperationType == null)
            {
                return NotFound();
            }

            _db.OperationTypes.Remove(OperationType);
            try
            {
                await _db.SaveChangesAsync();
            }
            catch (Exception exp)
            {
                Console.WriteLine(exp.Message);
                throw;
            }
          

            return Ok(OperationType);
        }

        [ODataRoute()]
        [HttpPatch]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public IHttpActionResult Patch( int Id, Delta<OperationType> delta)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var contactType = _db.OperationTypes.Single(t => t.Id == Id);
            delta.Patch(contactType);
            _db.SaveChanges();
            return Updated(contactType);
        }
      
        private bool OperationTypeExists(int id)
        {
            return _db.OperationTypes.Count(e => e.Id == id) > 0;
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _db.Dispose();
            }
            base.Dispose(disposing);
        }

       
    }
}