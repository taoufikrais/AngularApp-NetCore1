using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Data;
using System.Linq;
using System.Reflection;
using System.Xml.Serialization;

namespace FXWIN.Common.Extensions
{
    public static class CollectionExtension
    {
        /// <summary>
        /// Transform collection into DataTable
        /// </summary>
        /// <typeparam name="TSource">The type of the source.</typeparam>
        /// <param name="source">The source.</param>
        /// <returns>DataTable</returns>
        public static DataTable ToDataTable<TSource>(this IEnumerable<TSource> source)
        {
            if (source.IsNullOrEmpty())
                return new DataTable();

            var dt = new DataTable(typeof(TSource).Name);
            PropertyInfo[] propslist = typeof(TSource).GetProperties(BindingFlags.Public | BindingFlags.Instance).Where(p => !p.IsDefined(typeof(XmlIgnoreAttribute), false)
                                              && p.GetCustomAttributes(typeof(BrowsableAttribute), false).IsNullOrEmpty()).ToArray();
            var props = propslist.Where(p => !p.PropertyType.Name.Contains("ICollection") && p.PropertyType.FullName.StartsWith("System")).ToList();
            foreach (var property in props)
            {
                if (!property.PropertyType.Name.Contains("ICollection"))
                {
                    dt.Columns.Add(property.Name, Nullable.GetUnderlyingType(property.PropertyType) ?? property.PropertyType);
                }
            }

            foreach (var item in source)
            {
                var values = new object[props.Count-1];
                for (var i = 0; i < props.Count-1; i++)
                {
                    values[i] = props[i].GetValue(item, null) ?? DBNull.Value;
                }

                dt.Rows.Add(values);
            }

            return dt;
        }

        /// <summary>
        /// Determines whether the object's properties passed in parameter are equal.
        /// </summary>
        /// <typeparam name="TSource"></typeparam>
        /// <param name="first">The first object.</param>
        /// <param name="second">The second object.</param>
        /// <param name="compareProperties">The properties to compare.</param>
        /// <returns></returns>
        public static bool ObjectPropertiesAreEqual<T>(T first, T second, params string[] compareProperties) where T : class
        {
            if (compareProperties == null || compareProperties.Length == 0)
                throw new ArgumentNullException("compareProperties");
            
            if (first != null && second != null)
            {
                Type type = typeof(T);
                List<string> compareList = new List<string>(compareProperties);

                PropertyInfo[] pInfos = type.GetProperties();
                foreach (var item in compareList)
                {
                    if(!pInfos.Any(p=>p.Name == item))
                        throw new MissingFieldException(string.Format("{0} is not recognized as a member of class {1}", item, type.Name));
                }

                foreach (PropertyInfo pi in pInfos)
                {
                    if (compareList.Contains(pi.Name))
                    {
                        object firstValue = type.GetProperty(pi.Name).GetValue(first, null);
                        object secondValue = type.GetProperty(pi.Name).GetValue(second, null);
                        
                        if (firstValue != null && firstValue.ToString() == string.Empty && secondValue == null)
                            continue;
                        if (firstValue == null && secondValue != null && secondValue.ToString() == string.Empty)
                            continue;

                        if (firstValue != secondValue && (firstValue == null || (!firstValue.Equals(secondValue))))
                        {
                            return false;
                        }
                    }
                }
                return true;
            }
            return first == second;
        }
        
        public static IEnumerable<TSource> RemoveDuplicatesBy<TSource>(this IEnumerable<TSource> source, string[] compareProperties) where TSource : class
        {
            Dictionary<TSource, int> uniqueStore = new Dictionary<TSource, int>();
            List<TSource> finalList = new List<TSource>();

            foreach (TSource currValue in source)
            {
                if (!uniqueStore.Keys.Any(key => ObjectPropertiesAreEqual(key, currValue, compareProperties)))
                {
                    uniqueStore.Add(currValue, 0);
                    finalList.Add(currValue);
                }
            }
            return finalList.AsEnumerable();
        }

        /// <summary>
        /// return duplicated elements in given source collection.
        /// </summary>
        /// <typeparam name="TSource">Source type.</typeparam>
        /// <typeparam name="TKey">Key type.</typeparam>
        /// <param name="source">The source.</param>
        /// <param name="keySelector">The key selector.</param>
        /// <returns></returns>
        public static IEnumerable<TSource> DuplicatesBy<TSource, TKey> (this IEnumerable<TSource> source, Func<TSource, TKey> keySelector)
        {
            HashSet<TKey> seenKeys = new HashSet<TKey>();
            foreach (TSource element in source)
            {
                // Yield it if the key hasn't actually been added - i.e. it was already in the set
                if (!seenKeys.Add(keySelector(element)))
                {
                    yield return element;
                }
            }
        }


        /// <summary>
        /// Determines whether [is null or empty] [the specified source].
        /// </summary>
        /// <typeparam name="TSource">The type of the source.</typeparam>
        /// <param name="source">The source.</param>
        /// <returns>
        ///   <c>true</c> if [is null or empty] [the specified source]; otherwise, <c>false</c>.
        /// </returns>
        public static bool IsNullOrEmpty<TSource>(this IEnumerable<TSource> source)
        {
            return source == null || source.Count() == 0;
        }

        /// <summary>
        /// Clones the specified source with adding null value into the cloned collection.
        /// </summary>
        /// <typeparam name="TSource">The type of the source.</typeparam>
        /// <param name="source">The source.</param>
        /// <param name="newValueAtStartCollection">if set to <c>true</c> [new value at start collection]; otherwise, <c>false</c>.</param>
        /// <returns></returns>
        public static ObservableCollection<TSource> CloneWithNullValue<TSource>(this ObservableCollection<TSource> source, bool newValueAtStartCollection) where TSource : new()
        {
            ObservableCollection<TSource> col = new ObservableCollection<TSource>(source.Copy<TSource>());
            AddNewValue<TSource>(col, newValueAtStartCollection);
            return col;
        }

        public static void AddNewValue<TSource>(this ObservableCollection<TSource> source, bool newValueAtStartCollection) where TSource : new()
        {
            if (!source.IsNullOrEmpty())
            {
                List<TSource> oldList = source.ToList();
                TSource emptySource = new TSource();

                source.Clear();
                if (newValueAtStartCollection)
                {
                    source.Add(emptySource);
                    oldList.ForEach(element => source.Add(element));
                }
                else
                {                    
                    oldList.ForEach(element => source.Add(element));
                    source.Add(emptySource);
                }
            }
        }

        public static void CopyTo<TSource>(this IEnumerable<TSource> source, out IEnumerable<TSource> destination) where TSource : new()
        {
            destination = new Collection<TSource>();
            if (!source.IsNullOrEmpty())
            {
                foreach (var item in source)
                {
                    (destination as Collection<TSource>).Add(item);
                }
            }
        }

        public static IEnumerable<TSource> Copy<TSource>(this IEnumerable<TSource> source) where TSource : new()
        {
            if (!source.IsNullOrEmpty())
            {
                IEnumerable<TSource> result = new Collection<TSource>();
                foreach (var item in source)
                {
                    (result as Collection<TSource>).Add(item);
                }

                return result;
            }
            return new Collection<TSource>();
        }

        public static IEnumerable<TSource> Clone<TSource>(this IEnumerable<TSource> source) where TSource : new()
        {
            if (!source.IsNullOrEmpty())
            {
                return ObjectCopier.CloneList<TSource>(source);

                //IEnumerable<TSource> result = new Collection<TSource>();
                //foreach (var item in source)
                //{
                //    (result as Collection<TSource>).Add(Utilities.Clone<TSource>(item));
                //}

                //return result;
            }
            return new Collection<TSource>();
        }

        public static void ForEach<TSource>(this IEnumerable<TSource> source, Action<TSource> action)
        {
            if(!source.IsNullOrEmpty())
            {
                foreach (var item in source)
                {
                    action(item);
                }
            }
        }

        public static ObservableCollection<TSource> ToObservableCollection<TSource>(this IEnumerable<TSource> source)
        {
            if (!source.IsNullOrEmpty())
            {
                ObservableCollection<TSource> collection = new ObservableCollection<TSource>();
                source.ForEach(element => collection.Add(element));
                return collection;
            }
            return new ObservableCollection<TSource>();
        }

        //public static void Foreach<TSourceKey, TSourceValue>(this IDictionary<TSourceKey, TSourceValue> source, Action<TSourceKey, TSourceValue> action)
        //{
        //    if(source.IsNotNull())
        //    {
        //        foreach (var item in source)
        //        {
        //            action(item.Key, item.Value);
        //        }
        //    }
        //}


        //public static void AddNewValue<TSource>(this IEnumerable<TSource> source, bool nullValueIsStartItemCollection) where TSource : new()
        //{
        //    if (!source.IsNullOrEmpty())
        //    {
        //        IEnumerable<TSource> emptySource = new[] { new TSource() };
        //        if (nullValueIsStartItemCollection)
        //            source = emptySource.Concat(source);
        //        else
        //            source.Concat(emptySource);
        //    }
        //}

        //public static IEnumerable<TSource> AddNewValue<TSource>(this IEnumerable<TSource> source, bool nullValueIsStartItemCollection) where TSource : new()
        //{
        //    if (!source.IsNullOrEmpty())
        //    {
        //        TSource value = new TSource();
        //        foreach (var cur in source)
        //        {
        //            yield return cur;
        //        }
        //        yield return value;
        //    }
        //}

    }
}
