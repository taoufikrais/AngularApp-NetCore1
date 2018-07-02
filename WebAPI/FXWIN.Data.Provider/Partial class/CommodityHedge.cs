namespace FXWIN.Data.Provider
{
    public partial class CommodityHedge
    {
        private decimal? _TotalVolume = 0;
        public decimal? TotalVolume
        {
            get
            {
                foreach (HedgeCommoMaturity hcm in this.HedgeCommoMaturities)
                    _TotalVolume += hcm.Volume;
                return _TotalVolume;
            }
            set
            {
                _TotalVolume = value;
            }
        }
    }
}
