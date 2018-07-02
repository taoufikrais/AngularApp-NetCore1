using System;
using System.ComponentModel.DataAnnotations;


namespace FXWIN.Data.Provider
{
    public class FxwinTrade
    {
        [Key]
        public int IdSIAM { get; set; }
        public string SIAM { get; set; }
        public string Code { get; set; }
        public string Currency { get; set; }
        public decimal Amount { get; set; }
        public string PurchaseSale { get; set; }
        public decimal FwdPoint { get; set; }
        public string Maturity { get; set; }
        public string UnderlyingMonth { get; set; }
        public string ExecutionDate { get; set; }
        public string Book { get; set; }
        public decimal SpotRate { get; set; }
        public decimal ForwardPoints { get; set; }
        public decimal FxRate { get; set; }
        public string FxCreationUser { get; set; }
        public string TradeStatus { get; set; }
        public int StatusId { get; set; }
        public string ModificationDate { get; set; }
        private string _dealType= "FX_FORWARD";
        public string DealType { get { return _dealType; } set { _dealType = value; } }
        //public bool DealDeleted { get; set; }
    }
}

