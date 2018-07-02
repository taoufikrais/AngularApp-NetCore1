using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using FXWIN.Common.Extensions;

namespace FXWIN.Common.Helpers
{
    /// <summary>
    /// Class helper That reads file and transform file's data (TSource) to another object (TDestination)
    /// </summary>
    /// <typeparam name="TSource">The type of the source (Class that represent exactelly the file to read).</typeparam>
    /// <typeparam name="TDestination">The type of the destination.</typeparam>
    internal class FlatFileReaderHelper<TSource, TDestination>
        where TSource : Source<TDestination>
        where TDestination : new()
    {
        #region Members
        /// <summary>
        /// Reference to a FileHelperEngine that manipulate file read operations
        /// </summary>
        FileHelpers.FileHelperEngine<TSource> fileEngine;
        #endregion

        #region Constructor
        /// <summary>
        /// Initializes a new instance of the <see cref="FlatFileReaderHelper&lt;TSource, TDestination&gt;"/> class.
        /// </summary>
        public FlatFileReaderHelper()
        {
            fileEngine = new FileHelpers.FileHelperEngine<TSource>();
        }
        #endregion

        #region Methods
        /// <summary>
        /// Gets the data from file.
        /// </summary>
        /// <param name="filePath">The file path.</param>
        /// <param name="errorMode">The error mode.</param>
        /// <param name="isFirstLineHeader">if set to <c>true</c> [the file's first line will be considered as a header file].</param>
        /// <returns>Return an object that contains source's data (file) converted to TDestination object with Errors 
        /// (business and technical) if any.</returns>
        public IDataOutputResult<TDestination> GetDataFromFile(string filePath, ErrorMode errorMode, bool isFirstLineHeader)
        {
            switch (errorMode)
            {
                case ErrorMode.ThrowException:
                    fileEngine.ErrorManager.ErrorMode = FileHelpers.ErrorMode.ThrowException;
                    break;
                case ErrorMode.SaveAndContinue:
                    fileEngine.ErrorManager.ErrorMode = FileHelpers.ErrorMode.SaveAndContinue;
                    break;
                case ErrorMode.IgnoreAndContinue:
                    fileEngine.ErrorManager.ErrorMode = FileHelpers.ErrorMode.IgnoreAndContinue;
                    break;
            }

            if (isFirstLineHeader)
                fileEngine.Options.IgnoreFirstLines = 1;

            try
            {
                TSource[] data = fileEngine.ReadFile(filePath);
                List<IErrorMessage> errors = fileEngine.ErrorManager.GetFileTechnicalErrors();
                List<TDestination> convertedData = new List<TDestination>();
                foreach (var item in data)
                {
                    ITransformedResult<TDestination> transformedResult = item.GetTransformed();
                    if (transformedResult.HasError)
                    {
                        errors.Add(transformedResult.ErrorMessage);
                    }
                    if (!transformedResult.IsTechnicalError)
                    {
                        convertedData.Add(transformedResult.ResultData);
                    }
                }

                return new DataOutputResult<TDestination>(errors, convertedData);
            }
            catch (Exception ex)
            {
                List<IErrorMessage> errorList = new List<IErrorMessage>();
                IErrorMessage error = new ErrorMessage(ErrorMessageType.TechnicalMessage);
                errorList.Add(error);
                error.Message = ex.InnerException.IsNotNull() ? ex.InnerException.Message : ex.Message;
                return new DataOutputResult<TDestination>(errorList, null);
            }
        }
        #endregion
    }
}