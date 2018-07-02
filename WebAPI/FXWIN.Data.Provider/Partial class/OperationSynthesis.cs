using System;
using System.ComponentModel.DataAnnotations;

namespace FXWIN.Data.Provider
{
    public class OperationSynthesis
    {
        [Key]
        public int OperationId { get; set; }
        public string CargoCode { get; set; }
        public int CargoId { get; set; }
        public decimal? Volume { get; set; }
        public DateTime Operationdate { get; set; }
        public int? BOValidationStatus { get; set; }
        public string FXContract { get; set; }
        public int? PurchaseSaleId { get; set; }
        public string OperationType { get; set; }
        public int FXContractId { get; set; }
        public string SignalContract { get; set; }
        public InternalState InternalState { get; set; }
        public string CargoState { get; set; }
        private decimal? _EnergyMMBtu ;
        public decimal? EnergyMMBtu
        {
            get
            {
                _EnergyMMBtu = this.Volume.HasValue ? this.Volume * Constantes.TxConverisonTwhToMMBtu : (decimal?)null;
                return _EnergyMMBtu;
            }
            set
            {
                _EnergyMMBtu = value;
            }
        }
        //public int legId { get; set; }
    }
}