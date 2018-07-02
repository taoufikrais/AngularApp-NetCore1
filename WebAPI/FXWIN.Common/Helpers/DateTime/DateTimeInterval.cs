using System;
using System.Collections.Generic;
using FXWIN.Common.Extensions;

namespace FXWIN.Common.Helpers
{
    /// <summary>
    /// Class helper to manage periods (monthly, weekly ... periods)
    /// </summary>
    public class DateTimeInterval: IComparable
    {
        #region Members
        private DateTime startInterval;
        private DateTime endInterval;
        #endregion

        #region Properties
        public DateTime EndInterval
        {
            get { return endInterval; }
            set { endInterval = value; }
        }

        public DateTime StartInterval
        {
            get { return startInterval; }
            set { startInterval = value; }
        }
        public int NbDaysOfInterval
        {
            get { return EndInterval.Subtract(StartInterval).Days; }
        }
        
        public int NbDaysOfIntervalPomax
        {
            get
            {
                if (this.StartInterval == this.EndInterval)
                    return 0;
                int nbDays = 0;
                DateTime date = this.StartInterval;
                if (!this.StartInterval.IsAfterNoon())
                {
                    nbDays++;
                    date = date.AddDays(1);
                }
                if (this.StartInterval.Hour == 23 && this.StartInterval.Minute == 59 && this.StartInterval.Second == 59
                    && this.EndInterval.Hour == 0 && this.EndInterval.Minute == 0 && this.EndInterval.Second == 0)
                {
                    nbDays--;
                }

                while (date < this.EndInterval)
                {
                    if (date.Day == this.EndInterval.Date.Day && this.EndInterval.Month == date.Month && this.EndInterval.Year == date.Year)
                    {
                        if (this.EndInterval.Hour < 12)
                        {
                            return nbDays;
                        }
                        else
                        {
                            return ++nbDays;
                        }
                    }
                    else
                    {
                        date = date.AddDays(1);
                        //if (date < this.EndInterval)
                        //{
                            nbDays++;
                        //}
                    }
                }
                return nbDays;
            }
        }

        #endregion

        #region Constructor
        public DateTimeInterval()
        {
        }

        public DateTimeInterval(DateTimeInterval period)
        {
            this.StartInterval = period.StartInterval;
            this.EndInterval = period.EndInterval;
        }

        public DateTimeInterval(DateTime start, DateTime end)
        {
            if (startInterval > endInterval)
                throw new NotImplementedException("endInterval must be greater than startInterval");
            startInterval = start;
            endInterval = end;
        } 
        #endregion

        public List<DateTimeInterval> GetPeriodsByFullMonth()
        {
            List<DateTimeInterval> result = new List<DateTimeInterval>();
            DateTime date = startInterval;

            while (date < endInterval.ToEndOfMonth())
            {
                date = date.ToEndOfMonth();
                DateTimeInterval dInterval = new DateTimeInterval
                {
                    StartInterval = new DateTime(date.Year, date.Month, 1),
                    EndInterval = date
                };
                result.Add(dInterval);
                date = date.AddSeconds(2);
            }

            return result;
        }

        public List<DateTimeInterval> GetPeriodsByMonth()
        {
            List<DateTimeInterval> result = new List<DateTimeInterval>();
            DateTime date = startInterval;

            while (date < endInterval)
            {
                date = date.ToEndOfMonth();
                DateTimeInterval dInterval = new DateTimeInterval
                {
                    StartInterval = new DateTime(date.Year, date.Month, 1),
                    EndInterval = date > endInterval ? endInterval : date
                };
                result.Add(dInterval);
                date = date.AddDays(1);
            }

            return result;
        }

        public List<DateTimeInterval> GetPeriodsByDay()
        {
            List<DateTimeInterval> result = new List<DateTimeInterval>();
            DateTime date = startInterval;

            while (date < endInterval)
            {                
                DateTimeInterval dInterval = new DateTimeInterval
                {
                    StartInterval = date,
                    EndInterval = date.AddDays(1)
                };

                result.Add(dInterval);
                date = date.AddDays(1);
            }

            return result;
        }

        public List<DateTimeInterval> GetPeriodsByWeek()
        {
            List<DateTimeInterval> result = new List<DateTimeInterval>();
            DateTime date = startInterval;

            while (date < endInterval)
            {
                DateTimeInterval dInterval = new DateTimeInterval
                {
                    StartInterval = date,
                    EndInterval = date.AddDays(7)
                };

                result.Add(dInterval);
                date = date.AddDays(7);
            }

            return result;
        }

        public List<DateTimeInterval> GetPeriodsByWeeksInMonth()
        {
            List<DateTimeInterval> result = new List<DateTimeInterval>();
            DateTime date = startInterval;

            while (date < endInterval)
            {
                DateTimeInterval dInterval = new DateTimeInterval
                {
                    StartInterval = date,
                    EndInterval = DateTimeHelper.Min(date.AddDays(7), date.ToEndOfMonth())
                };

                result.Add(dInterval);
                date = date.AddDays(7);
            }

            return result;
        }       

        public void ToPomaxPeriod()
        {
            this.StartInterval = this.StartInterval.ToPomaxStartDate();
            this.EndInterval = this.EndInterval.ToPomaxEndDate();
        }

        public bool IsIntersects(DateTimeInterval period)
        {
            return this.StartInterval.IsBetweenDates(period.StartInterval, period.EndInterval) || this.EndInterval.IsBetweenDates(period.StartInterval, period.EndInterval)
                || period.StartInterval.IsBetweenDates(this.StartInterval, this.EndInterval) || period.EndInterval.IsBetweenDates(this.StartInterval, this.EndInterval);
        }

        public override bool Equals(object obj)
        {
            // If parameter is null return false.
            if (obj == null)
            {
                return false;
            }

            // If parameter cannot be cast to DateTimeInterval return false.
            DateTimeInterval p = obj as DateTimeInterval;
            if ((System.Object)p == null)
            {
                return false;
            }

            // Return true if the fields match:
            return (StartInterval == p.StartInterval) && (EndInterval == p.EndInterval);
        }

        public override int GetHashCode()
        {
            return (StartInterval.Year + StartInterval.Month + StartInterval.Day) ^ EndInterval.Month + 13;
        }

        /// <summary>
        /// Implements the operator ==.
        /// </summary>
        /// <param name="a">DateTimeInterval a.</param>
        /// <param name="b">DateTimeInterval b.</param>
        /// <returns>
        /// The result of the operator.
        /// </returns>
        public static bool operator ==(DateTimeInterval a, DateTimeInterval b)
        {
            // If both are null, or both are same instance, return true.
            if (System.Object.ReferenceEquals(a, b))
            {
                return true;
            }

            // If one is null, but not both, return false.
            if (((object)a == null) || ((object)b == null))
            {
                return false;
            }

            // Return true if the fields match:
            return a.StartInterval == b.StartInterval && a.EndInterval == b.EndInterval;
        }

        /// <summary>
        /// Implements the operator !=.
        /// </summary>
        /// <param name="a">DateTimeInterval a.</param>
        /// <param name="b">DateTimeInterval b.</param>
        /// <returns>
        /// The result of the operator.
        /// </returns>
        public static bool operator !=(DateTimeInterval a, DateTimeInterval b)
        {
            return !(a == b);
        }

        //public static bool operator <(DateTimeInterval a, DateTimeInterval b)
        //{
        //    return Comparison(a, b) < 0;
        //}

        //public static bool operator >(DateTimeInterval a, DateTimeInterval b)
        //{
        //    return Comparison(a, b) > 0;
        //}

        //public static int Comparison(DateTimeInterval a, DateTimeInterval b)
        //{

        //    if (a.StartInterval < b.StartInterval)
        //        return -1;

        //    else if (a.StartInterval == b.StartInterval && a.EndInterval == b.EndInterval)
        //        return 0;

        //    else if (a.StartInterval > b.StartInterval)
        //        return 1;
        //    return 0;
        //}

        public int CompareTo(object obj)
        {
            if(obj is DateTimeInterval)
            {
                DateTimeInterval temp = (DateTimeInterval)obj;
                if (temp.StartInterval == this.StartInterval && temp.EndInterval == this.EndInterval)
                    return 0;
                else
                    return -1;// 1 or -1 => Not important. We would juste like to know if periods are equal                
            }

            throw new ArgumentException("object is not a DateTimeInterval");    
        }
    }

    public static class DateTimeIntervalExtension
    {
         /// <summary>
        /// Gets the total periods by month.
        /// </summary>
        /// <param name="period1">The period1.</param>
        /// <param name="period2">The period2.</param>
        /// <param name="ignoreEmptyPeriods">if set to <c>true</c> not consider periods between the smallest end date period and the greatest
        /// start date period.</param>
        /// <returns></returns>
        public static List<DateTimeInterval> GetTotalPeriodsByMonth(this DateTimeInterval  period1, DateTimeInterval period2, bool ignoreEmptyPeriods)
        {
            if (IsOverlapedPeriods(period1, period2))
            {
                return new DateTimeInterval(DateTimeHelper.Min(period1.StartInterval, period2.StartInterval),
                   DateTimeHelper.Max(period1.EndInterval, period2.EndInterval)).GetPeriodsByFullMonth();
            }
            else
            {
                List<DateTimeInterval> lst = new List<DateTimeInterval>();
                if (ignoreEmptyPeriods)
                {
                    lst.AddRange(new DateTimeInterval(DateTimeHelper.Min(period1.StartInterval, period2.StartInterval),
                        DateTimeHelper.Min(period1.EndInterval, period2.EndInterval)).GetPeriodsByFullMonth());
                    lst.AddRange(new DateTimeInterval(DateTimeHelper.Max(period1.StartInterval, period2.StartInterval),
                        DateTimeHelper.Max(period1.EndInterval, period2.EndInterval)).GetPeriodsByFullMonth());
                }
                else
                    lst.AddRange(new DateTimeInterval(DateTimeHelper.Min(period1.StartInterval, period2.StartInterval),
                        DateTimeHelper.Max(period1.EndInterval, period2.EndInterval)).GetPeriodsByFullMonth());

                return lst;
            }
        }        
        /// <summary>
        /// Determines whether the whole or parts of period1 and period2 are overlaped
        /// </summary>
        /// <param name="period1">The period1.</param>
        /// <param name="period2">The period2.</param>
        /// <returns>
        ///   <c>true</c> if any overlaped periods; otherwise, <c>false</c>.
        /// </returns>
        public static bool IsOverlapedPeriods(this DateTimeInterval period1, DateTimeInterval period2)
        {            
            if (period1 == null)
                throw new ArgumentNullException("period1");
            if (period2 == null)
                throw new ArgumentNullException("period2");

            return period2.StartInterval.InPeriod(period1) || period1.StartInterval.InPeriod(period2);
        }

        public static DateTimeInterval GetOverlapedPeriod(this DateTimeInterval period1, DateTimeInterval period2)
        {
            if (IsOverlapedPeriods(period1, period2))
            {
                return new DateTimeInterval(
                    DateTimeHelper.Max(period1.StartInterval, period2.StartInterval),
                    DateTimeHelper.Min(period1.EndInterval, period2.EndInterval));
            }
            else
                return null;
        }
        public static List<DateTimeInterval> GetOverlapedPeriodByMonththis(this DateTimeInterval period1, DateTimeInterval period2)
        {
            DateTimeInterval overlapedPeriod = GetOverlapedPeriod(period1, period2);
            if (overlapedPeriod != null)
                return overlapedPeriod.GetPeriodsByFullMonth();
            return null;
        }
        public static List<DateTimeInterval> GetOverlapedPeriodByWeek(this DateTimeInterval period1, DateTimeInterval period2)
        {
            DateTimeInterval overlapedPeriod = GetOverlapedPeriod(period1, period2);
            if (overlapedPeriod != null)
                return overlapedPeriod.GetPeriodsByWeek();
            return null;
        }
        public static List<DateTimeInterval> GetOverlapedPeriodByDay(this DateTimeInterval period1, DateTimeInterval period2)
        {
            DateTimeInterval overlapedPeriod = GetOverlapedPeriod(period1, period2);
            if (overlapedPeriod != null)
                return overlapedPeriod.GetPeriodsByDay();
            return null;
        }
    }
}
