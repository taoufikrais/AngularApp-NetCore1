using System.ComponentModel.DataAnnotations;

namespace FXWIN.Data.Provider
{
    public class ExportPomax
    {
        [Key]
        public string Code { get; set; }
        public string Currency { get; set; }
        public string Amount { get; set; }
        public string PurchaseSale { get; set; }
        public string FwdPoint { get; set; }
        public string Maturity { get; set; }
        public string ExecutionDate { get; set; }
        public string Book { get; set; }
        public string Underlying { get; set; }
        public string ExactlyMaturityDate { get; set; }
    }
}