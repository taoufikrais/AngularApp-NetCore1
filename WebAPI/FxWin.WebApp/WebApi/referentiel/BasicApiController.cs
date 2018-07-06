using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.Http.Results;
using System.Web.Http.Tracing;
using FXWIN.Data.Provider;
using Newtonsoft.Json;
 

namespace FxWin.WebApp.WebApi
{
    public class BasicApiController<T> : ApiController where T : class
    {
        //private readonly FXWinV2Entities _dbContext;
        public BaseService<T> _repository;
        public bool lazyLoadingEnabled;

        /// <summary>
        /// BasicApiController
        /// </summary>
        /// <param name="_lazyLoadingEnabled"></param>
        public BasicApiController(bool _lazyLoadingEnabled = true) : base()
        {
            this.lazyLoadingEnabled = _lazyLoadingEnabled;
            _repository = new BaseService<T>(lazyLoadingEnabled);
        }

        /// <summary>
        /// DbContext
        /// </summary>
        [Route("")]
        public virtual IQueryable<T> GetAll()
        {
            try
            {
                var entities = _repository.GetAll();
                var setting = new JsonSerializerSettings
                {
                    PreserveReferencesHandling = PreserveReferencesHandling.None,
                    //PreserveReferencesHandling= PreserveReferencesHandling.Objects,
                    ReferenceLoopHandling = ReferenceLoopHandling.Serialize,
                    Formatting = Formatting.Indented
                };
                //return Ok(entities);
                //return Json(entities, setting);
                var res = entities.ToList();
                return entities;
            }
            catch (System.Exception)
            {
                throw;
            }
          
        }

        [Route("{id:int}")]
        public virtual T Get(int id)
        {
            var res=  _repository.Get(id);
            return res;
        }

        [Route("")]
        public virtual void Put(int id ,T item)
        {
            //Configuration.Services.GetTraceWriter().Info(Request, "Put "+ typeof(T).Name , "");
            var res= _repository.Save(item,id);
        }

        [Route("")]
        public async virtual Task<IHttpActionResult> Delete(int id)
        {
            var entity = _repository.Get(id);
            if (entity == null)
            {
                return NotFound();
            }
               _repository.Delete(entity);

            return Ok(entity);
        }

       

    }

}
