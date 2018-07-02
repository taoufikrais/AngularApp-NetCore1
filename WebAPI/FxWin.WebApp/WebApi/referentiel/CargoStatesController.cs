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
    [ODataRoutePrefix("CargoStates")]
    [ApiExplorerSettings(IgnoreApi = false)]
    public class CargoStatesController : ODataController //ApiController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        //GET: api/CargoStatees
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]//PageSize = 25, 
        //[CustomQueryable]
        public IQueryable<CargoState> GetCargoStates()
        {
           var res = _db.CargoStates.AsQueryable();
            return res;
        }

        // GET URL: http://localhost:60257/api/CargoStates/5
        // GET URL: http://localhost:60257/api/CargoStates(5)/
        [ODataRoute("({Id})")]
        [ResponseType(typeof(CargoState))]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> Get( int Id)
        {
            //Find() and FindAsync() are methods on type DbSet (which is what db.Items is). Include() returns a DbQuery object, 
            //which is why FindAsync() is not available. Use SingleOrDefaultAsync() to do the same thing as FindAsync()
            //(the difference is it will go straight to the database and won't look in the context to see if the entity exists first)...
            //CargoState CargoState = await _db.CargoStates.FindAsync(Id);
            CargoState CargoState = await _db.CargoStates.SingleOrDefaultAsync(i => i.Id == Id);
            if (CargoState == null)
            {
                return NotFound();
            }

            return Ok(CargoState);
        }

        // GET /odata/Products(1)/ODataRouting.Models.Book
        // GET URL: http://localhost:60257/api/CargoStates/5
        // GET URL: http://localhost:60257/api/CargoStates(5)/
        [ResponseType(typeof(CargoState))]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> GetCargoState( int Id)//[FromBody] web api classic
        {
            CargoState CargoState = await _db.CargoStates.FindAsync(Id);
            if (CargoState == null)
            {
                return NotFound();
            }

            return Ok(CargoState);
        }

        // POST URL: http://localhost:60257/api/CargoStates
        [ResponseType(typeof(CargoState))]
        [HttpPost]
        [ODataRoute()]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> Post([FromBody] CargoState CargoState)//[FromBody] in classic web api 
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (CargoState == null)
            {
                return BadRequest("Object value null");
            }
            _db.CargoStates.AddOrUpdate(CargoState);
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
                if (!CargoStateExists(CargoState.Id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return Created(CargoState);
            //return CreatedAtRoute("DefaultApi", new { id = CargoState.Id }, CargoState);
        }

        // PUT URL : http://localhost:60257/api/CargoStates/1 classic web api 
        // PUT URL : http://localhost:60257/api/CargoStates(1)/ odata service 
        //[ResponseType(typeof(void))]
        [ResponseType(typeof(CargoState))]
        [HttpPut]
        [ODataRoute("({Id})")]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> Put( int Id ,[FromBody] CargoState CargoState)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (Id != CargoState.Id)
            {
                return BadRequest();
            }
            _db.Entry(CargoState).State = EntityState.Modified;
            
            try
            {
                _db.CargoStates.AddOrUpdate(CargoState);
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
                if (!CargoStateExists(Id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return Updated(CargoState);
            //return StatusCode(HttpStatusCode.NoContent);
        }

        // DELETE: http://localhost:60257/api/CargoStates/1
        [ResponseType(typeof(CargoState))]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public async Task<IHttpActionResult> Delete(int id)
        {
            CargoState CargoState = await _db.CargoStates.FindAsync(id);
            if (CargoState == null)
            {
                return NotFound();
            }

            _db.CargoStates.Remove(CargoState);
            try
            {
                await _db.SaveChangesAsync();
            }
            catch (Exception exp)
            {
                Console.WriteLine(exp.Message);
                throw;
            }
          

            return Ok(CargoState);
        }

        [ODataRoute()]
        [HttpPatch]
        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All)]
        public IHttpActionResult Patch( int Id, Delta<CargoState> delta)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var contactType = _db.CargoStates.Single(t => t.Id == Id);
            delta.Patch(contactType);
            _db.SaveChanges();
            return Updated(contactType);
        }
      
        private bool CargoStateExists(int id)
        {
            return _db.CargoStates.Count(e => e.Id == id) > 0;
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