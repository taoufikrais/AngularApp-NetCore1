using System.ComponentModel;
using System.Windows;

namespace FXWIN.Common
{
    public static class VisualStudio
    {
        private static bool? isInDesignMode;

        /// <summary>
        /// Gets a value indicating whether the control is in design mode (running in Blend
        /// or Visual Studio).
        /// </summary>
        public static bool IsInDesignMode
        {
            get
            {
                if (!isInDesignMode.HasValue)
                {
                }
                return isInDesignMode.Value;
            }
        }
    }
}
