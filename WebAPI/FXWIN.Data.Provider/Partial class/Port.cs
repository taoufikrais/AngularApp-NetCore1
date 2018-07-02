using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FXWIN.Data.Provider
{
    public partial class Port //: IDataErrorInfo
    {
        /// <summary>
        /// Get instance of Port with default values
        /// </summary>
        public static Port Default
        {
            get
            {
                return new Port()
                {
                    Name = Constantes.UNDEFINED,
                    TypePortId = (int)ePortType.DEFAULT,
                    Cost = 0,
                    CountryId = (int)eCountry.DEFAULT,
                    DeviseId = (int)eCurrency.USD
                };
            }
        }

        public static Port GetDefaultPort(string code, int portType)
        {
            Port port = Port.Default;
            port.Code = code;
            port.TypePortId = portType;
            return port;
        }

  
    }
}
