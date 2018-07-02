using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace FXWIN.Common.Helpers
{
    /// <summary>
    /// Class helper That reads file and transform file's data (TSource) to another object (TDestination)
    /// </summary>
    /// <typeparam name="TSource">The type of the source.</typeparam>
    /// <typeparam name="TDestination">The type of the destination.</typeparam>
    public class FileDataImportHelper<TSource, TDestination>
        where TSource : Source<TDestination>
        where TDestination : new()
    {

        /// <summary>
        /// Gets the data from file given in parameters and transform it to TDestination object
        /// </summary>
        /// <param name="filePath">The file path.</param>
        /// <param name="errorMode">The error mode.</param>
        /// <param name="isFirstLineHeader">if set to <c>true</c> [the file's first line will be considered as a header file].</param>
        /// <returns></returns>
        public IDataOutputResult<TDestination> GetData(string filePath, ErrorMode errorMode, bool isFirstLineHeader)
        {
            FlatFileReaderHelper<TSource, TDestination> readerHelper = new FlatFileReaderHelper<TSource, TDestination>();
            var result = readerHelper.GetDataFromFile(filePath, errorMode, isFirstLineHeader);
            return result;
        }
    }
}
