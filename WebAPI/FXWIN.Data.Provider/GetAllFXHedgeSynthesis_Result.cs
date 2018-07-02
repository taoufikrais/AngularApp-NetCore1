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
    
    public partial class GetAllFXHedgeSynthesis_Result
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public int InternalStateId { get; set; }
        public string InternalStateCode { get; set; }
        public string Actarus { get; set; }
        public string Notice { get; set; }
        public int ManagementIntentId { get; set; }
        public string ManagementIntentCode { get; set; }
        public string Comment { get; set; }
        public int QualificationId { get; set; }
        public string QualificationCode { get; set; }
        public int CurrencyId { get; set; }
        public string CurrencyCode { get; set; }
        public int HedgeTypeId { get; set; }
        public string HedgeTypeCode { get; set; }
        public int WorkflowStateId { get; set; }
        public string WorkflowStateCode { get; set; }
        public System.DateTime CreationDate { get; set; }
        public string CreationUser { get; set; }
        public Nullable<System.DateTime> ModificationDate { get; set; }
        public string ModificationUser { get; set; }
        public Nullable<System.DateTime> ExecutionDate { get; set; }
        public Nullable<System.DateTime> CallExpirationDate { get; set; }
        public Nullable<System.DateTime> PutExpirationDate { get; set; }
        public Nullable<decimal> CallAmount { get; set; }
        public Nullable<decimal> PutAmount { get; set; }
        public Nullable<int> CallUnderlyingTermId { get; set; }
        public Nullable<int> PutUnderlyingTermId { get; set; }
        public string CallUnderlyingCode { get; set; }
        public string PutUnderlyingCode { get; set; }
        public string BuyLegContract { get; set; }
        public string SaleLegContract { get; set; }
        public Nullable<System.DateTime> BuyLegUnderlyingMonth { get; set; }
        public Nullable<System.DateTime> SaleLegUnderlyingMonth { get; set; }
        public Nullable<int> BuyLegMultipleCargoes { get; set; }
        public Nullable<int> SaleLegMultipleCargoes { get; set; }
        public string BuyLegCargoCode { get; set; }
        public string SaleLegCargoCode { get; set; }
        public string BuyLegInitialeCommoHedge { get; set; }
        public string BuyLegFinaleCommoHedge { get; set; }
        public string SaleLegInitialeCommoHedge { get; set; }
        public string SaleLegFinaleCommoHedge { get; set; }
        public string MosarRef { get; set; }
        public string Mosar3rdParty { get; set; }
    }
}
