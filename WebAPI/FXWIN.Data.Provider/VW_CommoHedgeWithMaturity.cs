//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace FXWIN.Data.Provider
{
    using System;
    using System.Collections.Generic;
    
    public partial class VW_CommoHedgeWithMaturity
    {
        public int CommodityHedgeId { get; set; }
        public string Code { get; set; }
        public Nullable<System.DateTime> ExecutionDate { get; set; }
        public Nullable<int> FxContractId { get; set; }
        public int InternalStateId { get; set; }
        public string MaturityLabel { get; set; }
        public Nullable<int> OperationId { get; set; }
        public int PurchaseSaleId { get; set; }
        public Nullable<decimal> Strike { get; set; }
        public Nullable<int> UnderlyingTermId { get; set; }
        public int TimeSerieId { get; set; }
        public int MaturityId { get; set; }
        public Nullable<decimal> FXFinalExpo { get; set; }
        public Nullable<decimal> FXInitialExpo { get; set; }
        public System.DateTime Maturity { get; set; }
        public Nullable<System.DateTime> PaymentDate { get; set; }
        public decimal Volume { get; set; }
    }
}
