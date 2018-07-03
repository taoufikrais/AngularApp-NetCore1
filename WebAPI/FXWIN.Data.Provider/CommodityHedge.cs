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
    
    public partial class CommodityHedge
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public CommodityHedge()
        {
            this.HedgeCommoMaturities = new HashSet<HedgeCommoMaturity>();
            this.LinkLegHedgeCommoHedges = new HashSet<LinkLegHedgeCommoHedge>();
        }
    
        public int Id { get; set; }
        public string Code { get; set; }
        public int InternalStateId { get; set; }
        public Nullable<System.DateTime> ExecutionDate { get; set; }
        public int TimeSerieId { get; set; }
        public int PurchaseSaleId { get; set; }
        public Nullable<decimal> Strike { get; set; }
        public Nullable<int> FxContractId { get; set; }
        public Nullable<int> OperationId { get; set; }
        public string Maturity { get; set; }
        public Nullable<bool> IsContractUnderlying { get; set; }
        public Nullable<bool> IsContractAndOperationUnderlying { get; set; }
        public Nullable<bool> IsOtherUnderlying { get; set; }
        public Nullable<int> FxContractId2 { get; set; }
        public Nullable<int> UnderlyingTermId { get; set; }
        public string CreationUser { get; set; }
        public System.DateTime CreationDate { get; set; }
        public string ModificationUser { get; set; }
        public Nullable<System.DateTime> ModificationDate { get; set; }
    
        public virtual FxContract FxContract { get; set; }
        public virtual InternalState InternalState { get; set; }
        public virtual Operation Operation { get; set; }
        public virtual PurchaseSale PurchaseSale { get; set; }
        public virtual TimeSerie TimeSerie { get; set; }
        public virtual UnderlyingTerm UnderlyingTerm { get; set; }
        public virtual FxContract FxContract1 { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<HedgeCommoMaturity> HedgeCommoMaturities { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<LinkLegHedgeCommoHedge> LinkLegHedgeCommoHedges { get; set; }
    }
}