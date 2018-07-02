namespace FXWIN.Data.Provider
{
    public partial class Operation
    {
        //private decimal? _EnergyMMBtu;
        //public decimal? EnergyMMBtu
        //{
        //    get
        //    {
        //        _EnergyMMBtu = this.EnergyTW0.HasValue ? this.EnergyTW0 * Constantes.TxConverisonTwhToMMBtu : (decimal?)null;
        //        return _EnergyMMBtu;
        //    }
        //    set
        //    {
        //        _EnergyMMBtu = value;
        //    }
        //}
        public virtual InternalState InternalState { get; set; }
    }
}
