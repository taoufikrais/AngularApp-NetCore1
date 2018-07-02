using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using FXWIN.Common.Helpers;

namespace FXWIN.Common.Extensions
{
    public static class ErrorManagerExtension
    {
        public static List<IErrorMessage> GetFileTechnicalErrors(this FileHelpers.ErrorManager errorManager)
        {
            List<IErrorMessage> returnList = new List<IErrorMessage>();
            foreach (var item in errorManager.Errors)
            {
                IErrorMessage errorMessage = new ErrorMessage(ErrorMessageType.TechnicalMessage);
                errorMessage.Message = string.Format("Line:{0}, record:{1}, Exception:{2}", item.LineNumber, item.RecordString, item.ExceptionInfo.InnerException.IsNotNull() ? item.ExceptionInfo.InnerException.Message : item.ExceptionInfo.Message);
                returnList.Add(errorMessage);
            }
            return returnList;
        }
    }
}
