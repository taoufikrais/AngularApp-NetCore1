using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace FXWIN.Common.Helpers
{
    /// <summary>
    /// Class source that represents exactly the file data to read
    /// </summary>
    /// <typeparam name="TDestination">The type of the destination.</typeparam>
    public abstract class Source<TDestination> : ITransformer<TDestination> where TDestination : new()
    {
        /// <summary>
        /// Gets the transformed TDestination object.
        /// </summary>
        /// <returns></returns>
        public abstract ITransformedResult<TDestination> GetTransformed();
    }
}
