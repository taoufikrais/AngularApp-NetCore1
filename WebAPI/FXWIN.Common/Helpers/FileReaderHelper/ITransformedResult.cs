using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace FXWIN.Common.Helpers
{
    /// <summary>
    /// Interface that contains the result of conversion from object source (file data) to object destination T
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public interface ITransformedResult<T> where T : new()
    {
        /// <summary>
        /// Gets or sets the error message.
        /// </summary>
        /// <value>
        /// The error message.
        /// </value>
        IErrorMessage ErrorMessage { get; set; }

        /// <summary>
        /// Gets or sets the result data.
        /// </summary>
        /// <value>
        /// The result data.
        /// </value>
        T ResultData { get; set; }

        /// <summary>
        /// Gets a value indicating whether this instance has error.
        /// </summary>
        /// <value>
        ///   <c>true</c> if this instance has error; otherwise, <c>false</c>.
        /// </value>
        bool HasError { get; }

        /// <summary>
        /// Gets a value indicating whether this instance is business error.
        /// </summary>
        /// <value>
        /// 	<c>true</c> if this instance is business error; otherwise, <c>false</c>.
        /// </value>
        bool IsBusinessError { get; }

        /// <summary>
        /// Gets a value indicating whether this instance is technical error.
        /// </summary>
        /// <value>
        /// 	<c>true</c> if this instance is technical error; otherwise, <c>false</c>.
        /// </value>
        bool IsTechnicalError { get; }
    }
}
