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
    
    public partial class LinkFxContractSignalContract
    {
        public int Id { get; set; }
        public Nullable<int> FxContractId { get; set; }
        public Nullable<int> PurchaseContractId { get; set; }
        public Nullable<int> SupplyContractId { get; set; }
        public bool Include { get; set; }
        public bool IsNew { get; set; }
        public Nullable<bool> IsToBeStormImported { get; set; }
    
        public virtual FxContract FxContract { get; set; }
        public virtual PurchaseContract PurchaseContract { get; set; }
        public virtual SupplyContract SupplyContract { get; set; }
    }
}
