using System.ComponentModel.DataAnnotations;


namespace FXWIN.Data.Provider
{
    public partial class Cargo_AuditTrail
    {
        [Key]
        public int Id
        {
            get { return this.AuditId; }
            set { this.AuditId = value; }
        }
    }

    public partial class CommodityHedge_AuditTrail
    {
        [Key]
        public int Id
        {
            get { return this.AuditId; }
            set { this.AuditId = value; }
        }
    }
    public partial class ExecutionFX_AuditTrail
    {
        [Key]
        public int Id
        {
            get { return this.AuditId; }
            set { this.AuditId = value; }
        }
    }

    public partial class FxHedge_AuditTrail
    {
        [Key]
        public int Id
        {
            get { return this.AuditId; }
            set { this.AuditId = value; }
        }
    }

    public partial class HedgeCommoMaturity_AuditTrail
    {
        [Key]
        public int Id
        {
            get { return this.AuditId; }
            set { this.AuditId = value; }
        }
    }

    public partial class HedgeLeg_AuditTrail
    {
        [Key]
        public int Id
        {
            get { return this.AuditId; }
            set { this.AuditId = value; }
        }
    }

    public partial class Operation_AuditTrail
    {
        [Key]
        public int Id
        {
            get { return this.AuditId; }
            set { this.AuditId = value; }
        }
    }

    public partial class Subjacent_AuditTrail
    {
        [Key]
        public int Id
        {
            get { return this.AuditId; }
            set { this.AuditId = value; }
        }
    }

    public partial class UnderlyingTerm_AuditTrail
    {
        [Key]
        public int Id
        {
            get { return this.AuditId; }
            set { this.AuditId = value; }
        }
    }

    public partial class VW_CommoHedgeWithMaturity
    {
        [Key]
        public int Id
        {
            get { return this.CommodityHedgeId; }
            set { this.CommodityHedgeId = value; }
        }
    }

    public partial class VW_CubeOperation
    {
        [Key]
        public int Id
        {
            get { return this.OperationId; }
            set { this.OperationId = value; }
        }
    }

    public partial class SharedLayout
    {
        [Key]
        public int Id
        {
            get { return this.LayoutId; }
            set { this.LayoutId = value; }
        }
    }

    public partial class FxParameter
    {
        [Key]
        public string Id
        {
            get { return this.Key; }
            set { this.Key = value; }
        }
    }
}
