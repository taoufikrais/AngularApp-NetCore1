using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using FXWIN.Common.Extensions;

namespace FXWIN.Common.Helpers
{
    /// <summary>
    /// Class inherited from IDataOutputResult<T> that contains the result of conversion from object source (file data) to object destination T
    /// </summary>
    /// <typeparam name="T"></typeparam>
    internal class DataOutputResult<T> : IDataOutputResult<T> where T : new()
    {
        #region Members
        private List<IErrorMessage> errorsMessage = new List<IErrorMessage>();
        private List<IWarnings> warningMessage = new List<IWarnings>();
        private List<T> resultData = new List<T>();

        #endregion

        #region Properties
        /// <summary>
        /// Gets or sets the errors message.
        /// </summary>
        /// <value>
        /// The errors message.
        /// </value>
        public List<IErrorMessage> ErrorsMessage
        {
            get { return this.errorsMessage; }
            set { this.errorsMessage = value; }
        }
        /// <summary>
        /// Gets or sets the errors message.
        /// </summary>
        /// <value>
        /// The errors message.
        /// </value>
        public List<IWarnings> WarningMessage
        {
            get { return this.warningMessage; }
            set { this.warningMessage = value; }
        }
        /// <summary>
        /// Gets or sets the result data.
        /// </summary>
        /// <value>
        /// The result data.
        /// </value>
        public List<T> ResultData
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
            get { return this.errorsMessage.Count > 0; }
        }

        /// <summary>
        /// Gets a value indicating whether this instance warnings.
        /// </summary>
        /// <value>
        ///   <c>true</c> if this instance has warnings; otherwise, <c>false</c>.
        /// </value>
        public bool HasWarnings
        {
            get { return this.warningMessage.Count > 0; }
        }

        /// <summary>
        /// Gets a value indicating whether this instance has technical error.
        /// </summary>
        /// <value>
        /// 	<c>true</c> if this instance has technical error; otherwise, <c>false</c>.
        /// </value>
        public bool HasTechnicalError
        {
            get { return this.errorsMessage.Any(er => er.ErrorType == ErrorMessageType.TechnicalMessage); }
        }

        /// <summary>
        /// Gets a value indicating whether this instance has business error.
        /// </summary>
        /// <value>
        /// 	<c>true</c> if this instance has business error; otherwise, <c>false</c>.
        /// </value>
        public bool HasBusinessError
        {
            get { return this.errorsMessage.Any(er => er.ErrorType == ErrorMessageType.BusinessMessage); }
        }

        /// <summary>
        /// Gets the business error messages.
        /// </summary>
        public List<IErrorMessage> BusinessErrorMessages
        {
            get { return this.ErrorsMessage.IsNullOrEmpty() ? new List<IErrorMessage>() : this.ErrorsMessage.Where(m => m.ErrorType == ErrorMessageType.BusinessMessage).ToList(); }
        }

        /// <summary>
        /// Gets the technical error messages.
        /// </summary>
        public List<IErrorMessage> TechnicalErrorMessages
        {
            get { return this.ErrorsMessage.IsNullOrEmpty() ? new List<IErrorMessage>() : this.ErrorsMessage.Where(m => m.ErrorType == ErrorMessageType.TechnicalMessage).ToList(); }
        }

        #endregion

        #region Constructor
        /// <summary>
        /// Initializes a new instance of the <see cref="DataOutputResult&lt;T&gt;"/> class.
        /// </summary>
        /// <param name="errors">The errors.</param>
        /// <param name="results">The results.</param>
        public DataOutputResult(List<IErrorMessage> errors, List<T> results)
        {
            this.errorsMessage = errors;
            this.resultData = results;
        }
        #endregion

        #region Methods
        /// <summary>
        /// Gets the technical errors.
        /// </summary>
        /// <returns></returns>
        public List<IErrorMessage> GetTechnicalErrors()
        {
            if (this.HasError)
                return this.ErrorsMessage.Where(er => er.ErrorType == ErrorMessageType.TechnicalMessage).ToList();

            return new List<IErrorMessage>();
        }

        /// <summary>
        /// Gets the business errors.
        /// </summary>
        /// <returns></returns>
        public List<IErrorMessage> GetBusinessErrors()
        {
            if (this.HasError)
                return this.ErrorsMessage.Where(er => er.ErrorType == ErrorMessageType.BusinessMessage).ToList();

            return new List<IErrorMessage>();
        }

        /// <summary>
        /// Gets the formatted errors according to error type.
        /// </summary>
        /// <param name="type">The type.</param>
        /// <returns></returns>
        public string GetFormattedErrors(ErrorMessageType type)
        {
            StringBuilder sb = new StringBuilder();
            List<IErrorMessage> errorMessage = null;
            switch (type)
            {
                case ErrorMessageType.TechnicalMessage:
                    errorMessage = this.TechnicalErrorMessages;
                    break;
                case ErrorMessageType.BusinessMessage:
                    errorMessage = this.BusinessErrorMessages;
                    break;
            }
            foreach (var item in errorMessage)
            {
                sb.AppendLine(item.Message);
            }

            return sb.ToString();
        }
        #endregion
    }
}
