using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace FXWIN.Common.Helpers
{
    /// <summary>
    /// Interface for transformation operation
    /// </summary>
    /// <typeparam name="TDestination">The type of the destination.</typeparam>
    internal interface ITransformer<TDestination>
        where TDestination : new()
    {
        /// <summary>
        /// Gets the transformed TDestination object.
        /// </summary>
        /// <returns></returns>
        ITransformedResult<TDestination> GetTransformed();
    }
}
