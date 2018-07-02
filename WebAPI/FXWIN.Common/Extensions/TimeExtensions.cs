using System;
using FXWIN.Common.Helpers;

namespace FXWIN.Common.Extensions
{
    public static class TimeExtensions
    {
        /// <summary>
        /// Gets a DateTime representing midnight on the current date
        /// </summary>
        /// <param name="current">The current date</param>
        public static DateTime Midnight(this DateTime current)
        {
            DateTime midnight = new DateTime(current.Year, current.Month, current.Day);
            return midnight;
        }

        /// <summary>
        /// Gets a DateTime representing noon on the current date
        /// </summary>
        /// <param name="current">The current date</param>
        public static DateTime Noon(this DateTime current)
        {
            DateTime noon = new DateTime(current.Year, current.Month, current.Day, 12, 0, 0);
            return noon;
        }
        /// <summary>
        /// Sets the time of the current date with minute precision
        /// </summary>
        /// <param name="current">The current date</param>
        /// <param name="hour">The hour</param>
        /// <param name="minute">The minute</param>
        public static DateTime SetTime(this DateTime current, int hour, int minute)
        {
            return SetTime(current, hour, minute, 0, 0);
        }

        /// <summary>
        /// Sets the time of the current date with second precision
        /// </summary>
        /// <param name="current">The current date</param>
        /// <param name="hour">The hour</param>
        /// <param name="minute">The minute</param>
        /// <param name="second">The second</param>
        /// <returns></returns>
        public static DateTime SetTime(this DateTime current, int hour, int minute, int second)
        {
            return SetTime(current, hour, minute, second, 0);
        }

        /// <summary>
        /// Sets the time of the current date with millisecond precision
        /// </summary>
        /// <param name="current">The current date</param>
        /// <param name="hour">The hour</param>
        /// <param name="minute">The minute</param>
        /// <param name="second">The second</param>
        /// <param name="millisecond">The millisecond</param>
        /// <returns></returns>
        public static DateTime SetTime(this DateTime current, int hour, int minute, int second, int millisecond)
        {
            DateTime atTime = new DateTime(current.Year, current.Month, current.Day, hour, minute, second, millisecond);
            return atTime;
        }


        /// <summary>
        /// Return a string in "yyyyMMdd-HHmmss" format that represent a date passed in parameter
        /// </summary>
        /// <param name="date">The current date</param>
        /// <returns></returns>
        public static string ToTimeSeriesFileNameString(this DateTime date)
        {
            return date.ToString("yyyyMMdd-HHmmss");
        }


        /// <summary>
        /// Get the number of days in month of the given date
        /// </summary>
        /// <param name="date"></param>
        /// <returns></returns>
        public static int NumberDaysInMonth(this DateTime date)
        {
            return DateTime.DaysInMonth(date.Year, date.Month);
        }


        /// <summary>
        /// Includes the day in date.
        /// </summary>
        /// <param name="date">The date.</param>
        /// <returns></returns>
        public static DateTime IncludeDay(this DateTime date)
        {
            return date;
        }

        /// <summary>
        /// Excludes the day in date (It gives the yesterday's date).
        /// </summary>
        /// <param name="date">The date.</param>
        /// <returns></returns>
        public static DateTime ExcludeDay(this DateTime date)
        {
            return date.AddDays(-1);
        }

        /// <summary>
        /// Gives the date of the next day.
        /// </summary>
        /// <param name="date">The date.</param>
        /// <returns></returns>
        public static DateTime NextDay(this DateTime date)
        {
            return date.AddDays(1);
        }

        /// <summary>
        /// Gives the date of the next week.
        /// </summary>
        /// <param name="date">The date.</param>
        /// <returns></returns>
        public static DateTime NextWeek(this DateTime date)
        {
            return date.AddDays(7);
        }

        /// <summary>
        /// Gives the date of the next month.
        /// </summary>
        /// <param name="date">The date.</param>
        /// <returns></returns>
        public static DateTime NextMonth(this DateTime date)
        {
            return date.AddMonths(1);
        }

        /// <summary>
        /// Gives the date of the next year.
        /// </summary>
        /// <param name="date">The date.</param>
        /// <returns></returns>
        public static DateTime NextYear (this DateTime date)
        {
            return date.AddYears(1);
        }

        /// <summary>
        /// Gets true when date is in the given period interval.
        /// </summary>
        /// <param name="date">The date.</param>
        /// <param name="period">The period.</param>
        /// <returns></returns>
        public static bool InPeriod (this DateTime date, DateTimeInterval period)
        {
            return date <= period.EndInterval && date >= period.StartInterval;
        }

        /// <summary>
        /// Includes or exclude date according to the time in date.
        /// </summary>
        /// <param name="date">The date.</param>
        /// <returns>
        ///  <c>the tomorrow's date</c> if the specified date is afternoon; otherwise, <c>the same date</c>.
        /// </returns>
        public static DateTime ToPomaxEndDate(this DateTime date)
        {
            if (date.Hour == 0 && date.Minute == 0)
                return date;

            return date.IsAfterNoon() ? date : date.AddDays(-1);
        }

        public static DateTime ToPomaxEndDate2(this DateTime date)
        {
            if (date.Hour == 0 && date.Minute == 0)
                return date.AddDays(-1);

            return date.IsAfterNoon() ? date : date.AddDays(-1);
        }

        /// <summary>
        /// Includes or exclude date according to the time in date.
        /// </summary>
        /// <param name="date">The date.</param>
        /// <returns>
        ///  <c>the same date</c> if the specified date is afternoon; otherwise, <c>the yesterday's date</c>.
        /// </returns>
        public static DateTime ToPomaxStartDate(this DateTime date)
        {
            return date.IsAfterNoon() ? date.AddDays(1) : date;
        }

        public static DateTime ToPomaxStartDate2(this DateTime date)
        {
            return date.IsAfterNoon() ? date.AddDays(1) : date.SetTime(0, 0, 0);
        }

        /// <summary>
        /// Determines whether the specified date is noon.
        /// </summary>
        /// <param name="date">The date.</param>
        /// <returns>
        ///   <c>true</c> if the specified date is noon; otherwise, <c>false</c>.
        /// </returns>
        public static bool IsNoon(this DateTime date)
        {
            return date == date.Noon();
        }

        /// <summary>
        /// Determines whether the time in specified date is afternoon.
        /// </summary>
        /// <param name="date">The date.</param>
        /// <returns>
        ///   <c>true</c> if the specified date is after noon; otherwise, <c>false</c>.
        /// </returns>
        public static bool IsAfterNoon(this DateTime date)
        {
            return date.CompareTo(date.Noon()) > 0;
        }

        /// <summary>
        /// Determines whether the time in the specified date is morning.
        /// </summary>
        /// <param name="date">The date.</param>
        /// <returns>
        ///   <c>true</c> if the time in specified date is morning; otherwise, <c>false</c>.
        /// </returns>
        public static bool IsMorning(this DateTime date)
        {
            return date.CompareTo(date.Noon()) < 0;
        }

        /// <summary>
        /// Determines whether the specified date is between the given dates
        /// </summary>
        /// <param name="date">The date to compare.</param>
        /// <param name="smallerDate">The smaller date.</param>
        /// <param name="greaterDate">The greater date.</param>
        /// <returns>
        ///   <c>true</c> if the specified date is between the two dates; otherwise, <c>false</c>.
        /// </returns>
        public static bool IsBetweenDates(this DateTime date, DateTime smallerDate, DateTime greaterDate)
        {
            return date <= greaterDate && date >= smallerDate;
        }

        /// <summary>
        /// Returns a date starting with the first day in the month
        /// </summary>
        /// <param name="date">The date.</param>
        /// <returns></returns>
        public static DateTime ToStartMonth(this DateTime date)
        {
            return new DateTime(date.Year, date.Month, 1);
        }
    }
}
