using System.Linq;
using System.Web.Http;
using System.Web.OData;
using System.Web.OData.Query;
using System.Web.OData.Routing;
using FXWIN.Data.Provider;

namespace FxWin.WebApp.WebApi
{

    //[ODataRoutePrefix(typeof(T))]
    [EnableQuery(MaxExpansionDepth = 6)]
    public class BasicOdataApiController<T> : ODataController where T : class
    {
      
        BaseService<T> _repository = new BaseService<T>(false);

        [EnableQuery(AllowedQueryOptions = AllowedQueryOptions.All, MaxExpansionDepth = 6)] //PageSize = 25, 
        public virtual IQueryable<T> GetAll()
        {
            var res = _repository.GetAll();
            return res;
            //var res = options.ApplyTo(_db.Cargos.AsQueryable());
            // return (IQueryable<Cargo>) res;
        }


        public virtual T Get(int id)
        {
            return _repository.Get(id);
        }

        public virtual void Post(int Id, T item)
        {
            _repository.Save(item, Id);
        }
    }
}
