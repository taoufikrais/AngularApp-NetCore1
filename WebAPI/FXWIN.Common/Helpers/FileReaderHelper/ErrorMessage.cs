using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace FXWIN.Common.Helpers
{
    /// <summary>
    /// Class for handling errors occured in Conversion from object source (file data) to object destination 
    /// </summary>
    public class ErrorMessage : ErrorMessageBase
    {
        #region Constructor
        /// <summary>
        /// Initializes a new instance of the <see cref="ErrorMessage"/> class.
        /// </summary>
        /// <param name="errorType">Type of the error.</param>
        public ErrorMessage(ErrorMessageType errorType)
            : base(errorType)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="ErrorMessage"/> class.
        /// </summary>
        /// <param name="errorType">Type of the error.</param>
        /// <param name="message">The message.</param>
        public ErrorMessage(ErrorMessageType errorType, string message)
            : base(errorType, message)
        {
        }
        #endregion
    }

    /// <summary>
    /// Class for handling warning occured in Conversion from object source (file data) to object destination 
    /// </summary>
    public class WarningMessage : WarningMessageBase
    {
        #region Constructor
        /// <summary>
        /// Initializes a new instance of the <see cref="WarningMessage"/> class.
        /// </summary>
        /// <param name="message">Warning message</param>
        public WarningMessage(string message)
            : base(message)
        {
        }

        #endregion
    }
}