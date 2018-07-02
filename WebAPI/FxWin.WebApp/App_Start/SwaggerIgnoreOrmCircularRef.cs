using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Swashbuckle.Swagger;

namespace FxWin.WebApp.App_Start
{
    /// <summary>
    /// Swagger: ASP.NET Fixing Circular Self References
    /// fiw Swagger UI freezes after API fetch and browser crashes (Hangs on "Fetching resource list" )
    /// https://systemout.net/2017/04/07/swagger-asp-net-core-fixing-circular-self-references/
    /// </summary>
    /// <typeparam name="TNsType"></typeparam>
    public class SwaggerIgnoreOrmCircularRef<TNsType> : ISchemaFilter
    {
        public void Apply(Schema model, SchemaRegistry context, Type type)
        {
            if (model.properties == null)
                return;
            var excludeList = new List<string>();

            if (type.Namespace == typeof(TNsType).Namespace)
            {
                excludeList.AddRange(
                    from prop in type.GetProperties()
                    where prop.PropertyType.Namespace == typeof(TNsType).Namespace
                    select prop.Name) ; //.ToCamelCase());
            }

            foreach (var prop in excludeList)
            {
                if (model.properties.ContainsKey(prop))
                    model.properties.Remove(prop);
            }
        }
    }

    public static class StringExtensions
    {
        public static string ToCamelCase(this string str)
        {
            if (string.IsNullOrEmpty(str))
                return str;
            return str[0].ToString().ToLower() + str.Substring(1, str.Length - 1);
        }
    }
}