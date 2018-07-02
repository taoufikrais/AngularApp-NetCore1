using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace FXWIN.Common.Helpers
{
    /// <summary>
    /// Class for handling errors occured in Conversion from object source (file data) to object destination 
    /// </summary>
    public abstract class ErrorMessageBase : IErrorMessage
    {
        #region Members
        private ErrorMessageType errorType;
        private string message;
        #endregion

        #region Properties
        /// <summary>
        /// Gets or sets the message of the error
        /// </summary>
        /// <value>
        /// The message.
        /// </value>
        public string Message
        {
            get { return this.message; }
            set { this.message = value; }
        }
        /// <summary>
        /// Gets the type of the error.
        /// </summary>
        /// <value>
        /// The type of the error (business, technical).
        /// </value>
        public ErrorMessageType ErrorType
        {
            get { return this.errorType; }
        }
        #endregion

        #region Constructor
        /// <summary>
        /// Initializes a new instance of the <see cref="ErrorMessageBase"/> class.
        /// </summary>
        /// <param name="errorType">Type of the error.</param>
        public ErrorMessageBase(ErrorMessageType errorType)
        {
            this.errorType = errorType;
        }
        /// <summary>
        /// Initializes a new instance of the <see cref="ErrorMessageBase"/> class.
        /// </summary>
        /// <param name="errorType">Type of the error.</param>
        /// <param name="message">The message.</param>
        public ErrorMessageBase(ErrorMessageType errorType, string message)
        {
            this.errorType = errorType;
            this.message = message;
        }
        #endregion
    }

    public abstract class WarningMessageBase : IWarnings
    {
        #region Members
        private string message;
        #endregion

        #region Properties
        public string Message
        {
            get { return this.message; }
            set { this.message = value; }
        }
        #endregion

        #region Constructors
        public WarningMessageBase(string msg)
        {
            this.message = msg;
        }
        #endregion
    }
}
