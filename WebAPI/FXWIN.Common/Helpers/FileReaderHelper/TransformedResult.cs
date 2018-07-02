using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace FXWIN.Common.Helpers
{
    /// <summary>
    /// Class that contains the result of conversion from object source (file data) to object destination T
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class TransformedResult<T> : ITransformedResult<T> where T : new()
    {
        #region Members
        private T resultData;
        private IErrorMessage errorMessage;
        #endregion

        #region Properties
        /// <summary>
        /// Gets or sets the error message.
        /// </summary>
        /// <value>
        /// The error message.
        /// </value>
        public IErrorMessage ErrorMessage
        {
            get { return this.errorMessage; }
            set { this.errorMessage = value; }
        }

        /// <summary>
        /// Gets or sets the result data.
        /// </summary>
        /// <value>
        /// The result data.
        /// </value>
        public T ResultData
        {
            get { return this.resultData; }
            set { this.resultData = value; }
        }

        /// <summary>
        /// Gets a value indicating whether this instance has error.
        /// </summary>
        /// <value>
        ///   <c>true</c> if this instance has error; otherwise, <c>false</c>.
        /// </value>
        public bool HasError
        {
            get { return this.errorMessage != null; }
        }

        /// <summary>
        /// Gets a value indicating whether this instance is business error.
        /// </summary>
        /// <value>
        /// 	<c>true</c> if this instance is business error; otherwise, <c>false</c>.
        /// </value>
        public bool IsBusinessError
        {
            get { return this.HasError && this.errorMessage.ErrorType == ErrorMessageType.BusinessMessage; }
        }

        /// <summary>
        /// Gets a value indicating whether this instance is technical error.
        /// </summary>
        /// <value>
        /// 	<c>true</c> if this instance is technical error; otherwise, <c>false</c>.
        /// </value>
        public bool IsTechnicalError
        {
            get { return this.HasError && this.errorMessage.ErrorType == ErrorMessageType.TechnicalMessage; }
        }
        #endregion

        #region Constructor
        /// <summary>
        /// Initializes a new instance of the <see cref="TransformedResult&lt;T&gt;"/> class.
        /// </summary>
        /// <param name="errorMessage">The error message.</param>
        /// <param name="result">The result object.</param>
        public TransformedResult(IErrorMessage errorMessage, T result)
        {
            this.errorMessage = errorMessage;
            this.resultData = result;
        }
        #endregion
    }
}
