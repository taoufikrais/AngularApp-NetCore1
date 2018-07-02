using System.ComponentModel.DataAnnotations;

namespace FXWIN.Data.Provider
{
    public class SubjacentView
    {
        [Key]
        public int Id { get; set; }
        public string Code { get; set; }
        public string Type { get; set; }
        public string OperationType { get; set; }
        public string BookCode { get; set; }
        public int NumberOfMaturities { get; set; }
    }
}