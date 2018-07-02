using System;
using System.ComponentModel.DataAnnotations;

namespace FXWIN.Data.Provider
{
    public class SubjacentSynthesis
    {
        [Key]
        public int Id { get; set; }
        public string Code { get; set; }
        public DateTime MaturityDate { get; set; }
        public string LabelEcheance { get; set; }
        public DateTime PaymentDate { get; set; }
        public string DisplayName { get; set; }
        public bool? IsBEEMarginSharing { get; set; }
        public int SubjacentId { get; set; }
        public int? PurchaseSale { get; set; }
        public int? IsBoValidated { get; set; }
        public string Book { get; set; }

    }
}