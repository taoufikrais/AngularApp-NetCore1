using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FXWIN.Data.Provider
{
    public partial class VW_ExportPomax
    {
        private const string DATEFORMAT = "dd/MM/yyyy";
        private const string DECIMALFORMAT = "D";
        public ExportPomax ConvertToExportPomax(CultureInfo culture = null)
        {
            return new ExportPomax
            {
                Amount = culture != null ? this.Amount.Value.ToString(culture) : this.Amount.Value.ToString(),
                Book = this.Book,
                Code = this.Code,
                Currency = this.Currency,
                ExecutionDate = this.ExecutionDate.HasValue ? this.ExecutionDate.Value.ToString(DATEFORMAT) : null,
                FwdPoint = culture != null ? this.FwdPoint.Value.ToString(culture) : this.FwdPoint.ToString(),
                PurchaseSale = this.PurchaseSale,
                Underlying = this.Underlying.HasValue ? this.Underlying.Value.ToString() : null,
                Maturity = this.UnderlyingMonth?.ToString(DATEFORMAT) ?? string.Empty,
                //Exposed by web service to CTRM
                ExactlyMaturityDate = this.Maturity?.ToString(DATEFORMAT) ?? string.Empty,
            };
        }
    }

}
