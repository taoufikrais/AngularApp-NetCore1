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
    
    public partial class UnderlyingTerm_AuditTrail
    {
        public int AuditId { get; set; }
        public Nullable<int> EntityId { get; set; }
        public Nullable<System.DateTime> ModificationDate { get; set; }
        public string PropertyChangedName { get; set; }
        public string OperationType { get; set; }
        public string ModifyBy { get; set; }
        public string OldValue { get; set; }
        public string NewValue { get; set; }
        public string Code { get; set; }
        public string Object { get; set; }
    }
}
