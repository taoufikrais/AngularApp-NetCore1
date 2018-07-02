using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FXWIN.Data.Provider
{
    // The extension method
    public static class DataContextExtensions
    {
        public static FXWinV2Entities BulkInserts<T>(this FXWinV2Entities context, T entity, int count, int batchSize) where T : class
        {
            context.Set<T>().Add(entity);

            if (count % batchSize == 0)
            {
                context.SaveChanges();
                context.Dispose();
                context = new FXWinV2Entities();

                // This is optional
                context.Configuration.AutoDetectChangesEnabled = false;
            }
            return context;
        }
    }


}
