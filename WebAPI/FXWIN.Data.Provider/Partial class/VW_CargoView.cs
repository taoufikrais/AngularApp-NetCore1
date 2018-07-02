using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FXWIN.Data.Provider
{
    public partial class VW_CargoView
    {
        [Key]
        public int Id
        {
            get { return this.CargoId; }
            set { this.CargoId = value; }
        }
    }
}
