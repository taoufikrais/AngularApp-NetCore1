using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FXWIN.Data.Provider
{
    public partial class VW_ExportFxHedges
    {
        public FxwinTrade ConvertToFxWinTrade(CultureInfo culture = null)
        {
            return new FxwinTrade
            {
                IdSIAM = this.IdSIAM.Value,
                SIAM = this.SIAM,
                Code = this.Code,
                Book = this.Book,
                Maturity = this.Maturity.Value.ToString("MM/dd/yyyy"),
                UnderlyingMonth = this.UnderlyingMonth.Value.ToString("MM/dd/yyyy"),
                PurchaseSale = this.PurchaseSale,
                Amount = this.Amount.Value,
                Currency = this.Currency,
                ExecutionDate = this.ExecutionDate.Value.ToString("MM/dd/yyyy"),
                FwdPoint = this.FwdPoint.Value,
                ForwardPoints=this.ForwardPoints.Value,
                FxRate =this.FxRate.Value ,
                SpotRate =this.SpotRate.Value,
                TradeStatus=this.Status,
                StatusId = this.StatusId,
                ModificationDate = this.ModificationDate.Value.ToString("MM/dd/yyyy HH:mm:ss"),
                FxCreationUser = this.FxCreationUser,
            };
        }
    }

}
