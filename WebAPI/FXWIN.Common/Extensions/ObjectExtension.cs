using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace FXWIN.Common.Extensions
{
    public static class ObjectExtension
    {
        /// <summary>
        /// Determines whether [is not null] [the specified obj].
        /// </summary>
        /// <param name="obj">The obj.</param>
        /// <returns>
        ///   <c>true</c> if [is not null] [the specified obj]; otherwise, <c>false</c>.
        /// </returns>
        public static bool IsNotNull(this object obj)
        {
            return obj != null;
        }

        /// <summary>
        /// Determines whether the specified obj is null.
        /// </summary>
        /// <param name="obj">The obj.</param>
        /// <returns>
        ///   <c>true</c> if the specified obj is null; otherwise, <c>false</c>.
        /// </returns>
        public static bool IsNull(this object obj)
        {
            return obj == null;
        }
    }
}
