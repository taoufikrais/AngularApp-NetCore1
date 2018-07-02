using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using RefactorThis.GraphDiff;
using System.Data.SqlClient;
using FXWIN.Common.Extensions;

namespace FXWIN.Data.Provider
{
    public class BaseService<TObject> where TObject : class
    {
        private FXWinV2Entities _context;

        public BaseService(bool lazyLoadingEnabled)
        {
            _context = new FXWinV2Entities(lazyLoadingEnabled);
        }


        public FXWinV2Entities CurrentContext
        {
            get { return _context; }
        }
        public BaseService()
        {
        }

 
        public void ExecuteStoreCommand(string commandText, params object[] parameters)
        {
            _context.Database.ExecuteSqlCommand(commandText, parameters);
        }

        public void BulkInsert<T>(IEnumerable<T> collection)
        {
            if (collection != null && collection.Count() > 0)
            {
                try
                {
                    using (SqlBulkCopy bulkCopy = new SqlBulkCopy(_context.Database.Connection.ConnectionString, SqlBulkCopyOptions.FireTriggers))
                    {
                        bulkCopy.DestinationTableName = "dbo." + typeof(T).Name;
                        bulkCopy.WriteToServer(collection.ToDataTable<T>());
                    }

                    // Usage
                    //using (var scope = new TransactionScope())
                    //{
                    //    FXWinV2Entities context;

                    //    using (context = new FXWinV2Entities())
                    //    {
                    //        foreach (T c in collection)
                    //        {
                    //            // insert in batch
                    //            context = context.BulkInserts(c, collection.Count(), 100);
                    //        }

                    //        context.SaveChanges(); // save remaining items
                    //    }

                    //    scope.Complete();
                    //}
                }
                catch
                {
                    throw;
                }
            }
        }

        public void SaveCollection<T>(IEnumerable<TObject> collection)
        {
            if (collection != null && collection.Count() > 0)
            {
                try
                {
                    foreach (var item in collection)
                    {
                        //try
                        //{
                        //    //Add(item);
                            _context.Set<TObject>().Add(item);
                        //  _context.SaveChanges();
                        //}
                        //catch (Exception exp)
                        //{
                        //    throw;
                        //}
                    }
                    _context.SaveChanges();
                }
                catch (Exception)
                {
                    throw;
                }
            }
        }

        public IQueryable<TObject> GetAll()
        {
            var res = _context.Set<TObject>().AsNoTracking().AsQueryable();
            return res;
        }

        public async Task<ICollection<TObject>> GetAllAsync()
        {
            return await _context.Set<TObject>().AsNoTracking().ToListAsync();
        }

        public TObject Get(int id)
        {
            return _context.Set<TObject>().Find(id);
        }

        public async Task<TObject> GetAsync(int id)
        {
            return await _context.Set<TObject>().FindAsync(id);
        }

        public TObject Find(Expression<Func<TObject, bool>> match)
        {
            return _context.Set<TObject>().SingleOrDefault(match);
        }

        public async Task<TObject> FindAsync(Expression<Func<TObject, bool>> match)
        {
            return await _context.Set<TObject>().SingleOrDefaultAsync(match);
        }

        public ICollection<TObject> FindAll(Expression<Func<TObject, bool>> match)
        {
            return _context.Set<TObject>().Where(match).ToList();
        }

        public async Task<ICollection<TObject>> FindAllAsync(Expression<Func<TObject, bool>> match)
        {
            return await _context.Set<TObject>().Where(match).ToListAsync();
        }

        public TObject Add(TObject t)
        {
            _context.Set<TObject>().Add(t);
            _context.SaveChanges();
            return t;
        }

        public async Task<TObject> AddAsync(TObject t)
        {
            _context.Set<TObject>().Add(t);
            await _context.SaveChangesAsync();
            return t;
        }

        public TObject Save(TObject updated, int key)
        {
            if (updated == null)
                return null;

            TObject existing = _context.Set<TObject>().Find(key);
            if (existing != null)
            {
                _context.Entry(existing).CurrentValues.SetValues(updated);
                _context.SaveChanges();
            }
            else
            {
                Add(updated);
            }
            return existing;
        }

        public async Task<TObject> UpdateAsync(TObject updated, int key)
        {
            if (updated == null)
                return null;

            TObject existing = await _context.Set<TObject>().FindAsync(key);
            if (existing != null)
            {
                _context.Entry(existing).CurrentValues.SetValues(updated);
                await _context.SaveChangesAsync();
            }
            return existing;
        }

        public void Delete(TObject t)
        {
            _context.Set<TObject>().Remove(t);
            _context.SaveChanges();
        }

        public async Task<int> DeleteAsync(TObject t)
        {
            _context.Set<TObject>().Remove(t);
            return await _context.SaveChangesAsync();
        }

        public int Count()
        {
            return _context.Set<TObject>().Count();
        }

        public async Task<int> CountAsync()
        {
            return await _context.Set<TObject>().CountAsync();
        }

        public int CountAll(Expression<Func<TObject, bool>> match)
        {
            return _context.Set<TObject>().Count(match);
        }

        public async Task<int> CountAllAsync(Expression<Func<TObject, bool>> match)
        {
            return await _context.Set<TObject>().CountAsync(match);
        }

        public async Task<int> SaveChanges()
        {
           return await this._context.SaveChangesAsync();
        }

        // Flag: Has Dispose already been called?
        bool disposed = false;
        // Public implementation of Dispose pattern callable by consumers.
        public void Dispose()
        {
            this._context.Dispose();
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        // Protected implementation of Dispose pattern.
        protected virtual void Dispose(bool disposing)
        {
            if (disposed)
                return;

            if (disposing)
            {
                // Free any other managed objects here.
                //
            }

            // Free any unmanaged objects here.
            //
            disposed = true;


        }
    }
}