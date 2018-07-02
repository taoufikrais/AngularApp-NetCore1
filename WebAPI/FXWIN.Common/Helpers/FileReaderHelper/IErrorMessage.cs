using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace FXWIN.Common.Helpers
{
    /// <summary>
    /// Interface for handling errors occured in Conversion from object source (file data) to object destination 
    /// </summary>
    public interface IErrorMessage
    {
        /// <summary>
        /// Gets or sets the message of the error
        /// </summary>
        /// <value>
        /// The message.
        /// </value>
        string Message { get; set; }

        /// <summary>
        /// Gets the type of the error.
        /// </summary>
        /// <value>
        /// The type of the error (business, technical).
        /// </value>
        ErrorMessageType ErrorType { get; }
    }

    public interface IWarnings
    {
        string Message { get; set; }
    }
}
