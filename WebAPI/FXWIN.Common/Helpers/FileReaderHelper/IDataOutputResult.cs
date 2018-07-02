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
    public interface IDataOutputResult<T> where T : new()
    {
        /// <summary>
        /// Gets or sets the errors message.
        /// </summary>
        /// <value>
        /// The errors message.
        /// </value>
        List<IErrorMessage> ErrorsMessage { get; set; }

        /// <summary>
        /// Gets or sets the warnings message.
        /// </summary>
        /// <value>
        /// The Warnings message.
        /// </value>
        List<IWarnings> WarningMessage { get; set; }

        /// <summary>
        /// Gets or sets the result data.
        /// </summary>
        /// <value>
        /// The result data.
        /// </value>
        List<T> ResultData { get; set; }

        /// <summary>
        /// Gets a value indicating whether this instance has error.
        /// </summary>
        /// <value>
        ///   <c>true</c> if this instance has error; otherwise, <c>false</c>.
        /// </value>
        bool HasError { get; }

        /// <summary>
        /// Gets the technical errors.
        /// </summary>
        /// <returns></returns>
        List<IErrorMessage> GetTechnicalErrors();

        /// <summary>
        /// Gets the business errors.
        /// </summary>
        /// <returns></returns>
        List<IErrorMessage> GetBusinessErrors();

        /// <summary>
        /// Gets a value indicating whether this instance has business error.
        /// </summary>
        /// <value>
        /// 	<c>true</c> if this instance has business error; otherwise, <c>false</c>.
        /// </value>
        bool HasBusinessError { get; }

        /// <summary>
        /// Gets a value indicating whether this instance has technical error.
        /// </summary>
        /// <value>
        /// 	<c>true</c> if this instance has technical error; otherwise, <c>false</c>.
        /// </value>
        bool HasTechnicalError { get; }


        /// <summary>
        /// Gets a value indicating whether this instance has warnings.
        /// </summary>
        /// <value>
        /// 	<c>true</c> if this instance has warnings; otherwise, <c>false</c>.
        /// </value>
        bool HasWarnings { get; }

        /// <summary>
        /// Gets the formatted errors according to it's type.
        /// </summary>
        /// <param name="type">The type.</param>
        /// <returns></returns>
        string GetFormattedErrors(ErrorMessageType type);
    }
}
