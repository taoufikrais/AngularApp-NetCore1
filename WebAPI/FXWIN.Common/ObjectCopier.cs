using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Formatters.Binary;
using System.IO;

namespace FXWIN.Common
{
    /// <summary>
    /// Reference Article http://www.codeproject.com/KB/tips/SerializedObjectCloner.aspx
    /// 
    /// Provides a method for performing a deep copy of an object.
    /// Binary Serialization is used to perform the copy.
    /// </summary>

    public static class ObjectCopier
    {
        //public static TSource Clone<TSource>(TSource obj) where TSource : new()
        //{
        //    TSource clone = new TSource();
        //    foreach (var item in clone.GetType().GetProperties())
        //    {
        //        if (item.CanRead)
        //        {
        //            var value = item.GetValue(obj, null);

        //            if (item.CanWrite)
        //                item.SetValue(clone, value, null);
        //        }
        //    }

        //    return clone;
        //}


        /// <summary>
        /// Perform a deep Copy of the object.
        /// </summary>
        /// <typeparam name="TSource">The type of object being copied.</typeparam>
        /// <param name="source">The object instance to copy.</param>
        /// <returns>The copied object.</returns>
        public static T Clone<T>(T source)
        {
            if (!typeof(T).IsSerializable)
            {
                throw new ArgumentException("The type must be serializable.", "source");
            }

            // Don't serialize a null object, simply return the default for that object
            if (Object.ReferenceEquals(source, null))
            {
                return default(T);
            }

            IFormatter formatter = new BinaryFormatter();
            Stream stream = new MemoryStream();
            using (stream)
            {
                formatter.Serialize(stream, source);
                stream.Seek(0, SeekOrigin.Begin);
                return (T)formatter.Deserialize(stream);
            }
        }

        /// <summary>
        ///  Perform a deep Copy of a list.
        /// </summary>
        /// <typeparam name="TSource"></typeparam>
        /// <param name="tl">The liste to colne.</param>
        /// <returns></returns>
        public static IEnumerable<T> CloneList<T>(IEnumerable<T> tl)
        {
            foreach (T t in tl)
            {
                yield return (T)Clone(t);
            }
        }

    }
}