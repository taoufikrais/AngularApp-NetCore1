using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FXWIN.Data.Provider
{
    public partial class Vessel
    {
        public static Vessel Default
        {
            get
            {
                Vessel defaultVessel = new Vessel();
                defaultVessel.Name = Constantes.UNDEFINED;
                defaultVessel.BunkerFuelTypeId = (int)eBunkerFuelType.DEFAULT;
                return defaultVessel;
            }
        }

        public static Vessel GetDefaultVessel(string code)
        {
            Vessel vessel = Vessel.Default;
            vessel.Code = code;

            return vessel;
        }


    }
}
