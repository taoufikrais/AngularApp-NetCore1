using System;
using FXWIN.Common.Extensions;

namespace FXWIN.Common.Helpers
{
    public static class DateTimeHelper
    {
        public static int GetNumberOfMonthDifference(DateTime startDate, DateTime endDate)
        {
            int result = 0;

            int yearDiff = endDate.Year - startDate.Year;
            result = (12 * yearDiff) + endDate.Month - startDate.Month;
            return result;
        }

        private static int Modulo(int a, int b, int modulo)
        {
            return (a - b) >= 0 ? a - b : a - b + modulo;
        }

        private static int GetModuloByDate(DateTime date)
        {
            return DateTime.DaysInMonth(date.Year, date.Month);
        }

        public static DateTime ToEndOfMonth(this DateTime date)
        {
            return new DateTime(date.Year, date.Month, DateTime.DaysInMonth(date.Year, date.Month)).SetTime(23,59,59);
        }

        public static DateTime ToStartOfMonth(this DateTime date)
        {
            return new DateTime(date.Year, date.Month, 1);
        }

        public static DateTime Min(DateTime dt1, DateTime dt2)
        {
            // min < 0 => dt1 is earlier.
            // min > 0 => dt2 is earlier.
            // min = 0 => dt1 equals dt2.
            int min = DateTime.Compare(dt1, dt2);
            if (min < 0)
                return dt1;
            else
                return dt2;
        }

        public static DateTime Max(DateTime dt1, DateTime dt2)
        {
            // min < 0 => dt1 is earlier.
            // min > 0 => dt2 is earlier.
            // min = 0 => dt1 equals dt2.
            int max = DateTime.Compare(dt1, dt2);
            if (max < 0)
                return dt2;
            else
                return dt1;
        }
    }
}