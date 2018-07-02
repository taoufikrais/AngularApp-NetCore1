using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace FXWIN.Common.Helpers
{
    /// <summary>
    /// File read error mode
    /// </summary>
    public enum ErrorMode
    {
        ThrowException = 0,
        SaveAndContinue = 1,
        IgnoreAndContinue = 2
    }

    /// <summary>
    /// Indicates whether the message is technical or functional
    /// </summary>
    public enum ErrorMessageType
    {
        TechnicalMessage = 0,
        BusinessMessage = 1
    }
}
