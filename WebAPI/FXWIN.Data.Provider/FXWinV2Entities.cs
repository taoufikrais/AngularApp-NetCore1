using FXWIN.Common;
using FXWIN.Common.Extensions;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Transactions;
using System.Data.Entity.Infrastructure;

namespace FXWIN.Data.Provider
{
    public partial class FXWinV2Entities
    {
        public FXWinV2Entities(bool lazyLoadingEnabled = true): base("name=FXWinV2Entities")
        {
            this.Configuration.LazyLoadingEnabled = lazyLoadingEnabled;
            this.Configuration.ProxyCreationEnabled = lazyLoadingEnabled;
            //important UpdateGraph se  base sur  le detect change il faut l'activer
            this.Configuration.AutoDetectChangesEnabled = true;
            //convert all datetime to UTC kind
            //((IObjectContextAdapter)this).ObjectContext.ObjectMaterialized += (sender, e) => DateTimeKindAttribute.Apply(e.Entity);
        }

        public void ExecuteStoreCommand(string commandText, params object[] parameters)
        {
            this.Database.ExecuteSqlCommand(commandText, parameters);
        }


        public void BulkInsert<T>(IEnumerable<T> collection)
        {
            if (collection != null && collection.Count() > 0)
            {
                var conn = (SqlConnection)Database.Connection;
                try
                {
                    using (SqlBulkCopy bulkCopy = new SqlBulkCopy(this.Database.Connection.ConnectionString, SqlBulkCopyOptions.FireTriggers))
                    {
                        string tablename = typeof(T).Name.ToString();
                        if (tablename.Equals("Port"))
                        {
                            tablename += "s";
                        }
                        bulkCopy.DestinationTableName = "dbo." + tablename;
                        DataTable table = collection.ToDataTable<T>();
                        bulkCopy.WriteToServer(table);
                    }
                }
                catch(Exception exp)
                {

                    throw;
                }
            }
        }


        ///<summary>
        ///Compute operation physical FX Exposure 
        ///</summary>
        ///<param name="operation"></param>
        private decimal? OperationPhysicalFXExposure(Operation operation)
        {
            decimal? physicalFXExposure = 0;
            LinkFxContractSignalContract lfcsc = LinkFxContractSignalContracts
                                                     .Where(l => l.SupplyContractId == operation.SupplyContractId
                                                              || l.PurchaseContractId == operation.PurchaseContractId)
                                                     .FirstOrDefault();
            if (lfcsc != null)
            {
                FxContract fxContract = lfcsc.FxContract;
                if (fxContract != null)
                {
                    switch (fxContract.ContractTypeId)
                    {
                        case 1:
                            switch (fxContract.MarginSharingBEE)
                            {
                                case true:
                                    physicalFXExposure = (operation.Amount2 * 3) / 2;
                                    break;
                                case false:
                                    physicalFXExposure = operation.Amount2;
                                    break;
                            }
                            break;
                        case 2:
                            switch (fxContract.MarginSharingBEE)
                            {
                                case true:
                                    physicalFXExposure = -((operation.Amount2 * 3) / 2);
                                    break;
                                case false:
                                    physicalFXExposure = -operation.Amount2;
                                    break;
                            }
                            break;
                    }
                    return physicalFXExposure;
                }
                else
                {
                    return physicalFXExposure;
                }
            }
            else
            {
                return physicalFXExposure;
            }
        }

        ///<summary>
        ///Compute Operation FX Hedge exposure
        ///</summary>
        ///<param name="operation"></param>
        public void CargoFxExposure(Operation operation)
        {
            //recupérer et grouper les HedgeLeg de chaque operation
            Dictionary<Int32, FXHedge> OperationfxHedgeValidatedDico = new Dictionary<int, FXHedge>();
            Dictionary<Int32, FXHedge> OperationfxHedgeBrouillonDico = new Dictionary<int, FXHedge>();
            Dictionary<Int32, FXHedge> OperationfxHedgeEnCoursDico = new Dictionary<int, FXHedge>();

            foreach (HedgeLeg hedgeLeg in operation.HedgeLegs)
            {
                if (!OperationfxHedgeValidatedDico.Keys.Contains(hedgeLeg.FXHedge.Id) && (hedgeLeg.FXHedge.WorkflowStateId != 1 && hedgeLeg.FXHedge.WorkflowStateId != 2))
                {
                    OperationfxHedgeValidatedDico.Add(hedgeLeg.FXHedge.Id, hedgeLeg.FXHedge);
                }
                if (!OperationfxHedgeBrouillonDico.Keys.Contains(hedgeLeg.FXHedge.Id) && hedgeLeg.FXHedge.WorkflowStateId == 1)
                {
                    OperationfxHedgeBrouillonDico.Add(hedgeLeg.FXHedge.Id, hedgeLeg.FXHedge);
                }
                if (!OperationfxHedgeEnCoursDico.Keys.Contains(hedgeLeg.FXHedge.Id) && hedgeLeg.FXHedge.WorkflowStateId == 2)
                {
                    OperationfxHedgeEnCoursDico.Add(hedgeLeg.FXHedge.Id, hedgeLeg.FXHedge);
                }
            }

            foreach (FXHedge fxHedge in OperationfxHedgeValidatedDico.Values)
            {
                foreach (ExecutionFX ex in fxHedge.ExecutionFXes)
                {
                    if (ex.Amount.HasValue)
                    {
                        operation.CargoValidatedFxHedgeExposure += operation.CargoValidatedFxHedgeExposure + ex.Amount;
                    }
                }
            }

            foreach (FXHedge fxHedge in OperationfxHedgeValidatedDico.Values)
            {
                foreach (ExecutionFX ex in fxHedge.ExecutionFXes)
                {
                    if (ex.Amount.HasValue)
                    {
                        operation.CargoBrouillonFxHedgeExposure += operation.CargoBrouillonFxHedgeExposure + ex.Amount;
                    }
                }
            }

            foreach (FXHedge fxHedge in OperationfxHedgeEnCoursDico.Values)
            {
                foreach (ExecutionFX ex in fxHedge.ExecutionFXes)
                {
                    if (ex.Amount.HasValue)
                    {
                        operation.CargoEnCoursFxHedgeExposure += operation.CargoEnCoursFxHedgeExposure + ex.Amount;
                    }
                }
            }
        }
        ///<sumary>
        ///Compute Operation Commodity Hedge Exposure
        /// </sumary>
        ///<param name=operation></param>
        private void CargoCommodityHedgeExposure(Operation operation)
        {
            //    foreach (CommodityHedge ch in operation.CommodityHedges)
            //    {
            //        foreach (HedgeCommoMaturity hcm in ch.HedgeCommoMaturity)
            //        {
            //            if (hcm.MtM.HasValue)
            //            {
            //                operation.CargoCommodityHedgeExposure += operation.CargoCommodityHedgeExposure + hcm.MtM;
            //            }
            //        }
            //    }
        }

        /// Get All Ports
        /// </summary>
        /// <returns></returns>
        public List<Port> GetAllPorts(bool excludeDefault)
        {
            var query = from e in Ports
                        orderby e.Code
                        select e;

            List<Port> result = query.ToList<Port>();

            if (result != null && result.Count > 0 && excludeDefault)
                return result.Where(p => p.Id != 0).ToList();

            return result;
        }

        /// <summary>
        /// Get All Vessel
        /// </summary>
        /// <returns></returns>
        public List<Vessel> GetAllVessels(bool excludeDefault)
        {
            var query = from e in Vessels
                        orderby e.Code
                        select e;

            List<Vessel> result = query.ToList();

            if (result != null && result.Count > 0 && excludeDefault)
                return result.Where(p => p.Id != 0).ToList();

            return result;
        }

        /// <summary>
        /// Get All Units
        /// </summary>
        /// <returns></returns>
        public List<Unit> GetAllUnits(bool excludeDefault)
        {
            var query = from e in Units
                        orderby e.SignalCode, e.PomaxCode
                        select e;

            List<Unit> result = query.ToList<Unit>();

            if (result != null && result.Count > 0 && excludeDefault)
                return result.Where(p => p.Id != 0).ToList();

            return result;
        }

        /// <summary>
        /// Get All TimeSerie
        /// </summary>
        /// <returns></returns>
        public List<TimeSerie> GetAllTimeSeries(bool excludeDefault)
        {
            var query = from e in TimeSeries
                        orderby e.Code
                        select e;

            List<TimeSerie> result = query.ToList<TimeSerie>();

            if (result != null && result.Count > 0 && excludeDefault)
                return result.Where(p => p.Id != 0).ToList();

            return result;
        }

        public List<TimeSerieValue> GetAllTimeSerieValues(bool excludeDefault)
        {
            var query = from e in TimeSerieValues
                        orderby e.Date
                        select e;

            List<TimeSerieValue> result = query.ToList<TimeSerieValue>();

            if (result != null && result.Count > 0 && excludeDefault)
                return result.Where(p => p.Id != 0).ToList();

            return result;
        }

        /// <summary>
        /// Get All PurchaseContracts
        /// </summary>
        /// <returns></returns>
        public List<PurchaseContract> GetAllPurchaseContracts(bool excludeDefault)
        {
            var query = from e in PurchaseContracts
                        orderby e.Code
                        select e;

            List<PurchaseContract> result = query.ToList<PurchaseContract>();

            if (result != null && result.Count > 0 && excludeDefault)
                return result.Where(p => p.Id != 0).ToList();

            return result;
        }

        /// <summary>
        /// Get All SupplyContracts
        /// </summary>
        /// <returns></returns>
        public List<SupplyContract> GetAllSupplyContracts(bool excludeDefault)
        {
            var query = from e in SupplyContracts
                        orderby e.Code
                        select e;

            List<SupplyContract> result = query.ToList<SupplyContract>();

            if (result != null && result.Count > 0 && excludeDefault)
                return result.Where(p => p.Id != 0).ToList();

            return result;
        }

        public List<Currency> GetAllCurrencies(bool excludeDefault)
        {
            var query = from e in Currencies
                        orderby e.Code
                        select e;

            List<Currency> result = query.ToList<Currency>();

            if (result != null && result.Count > 0 && excludeDefault)
                return result.Where(p => p.Id != 0).ToList();

            return result;
        }

        public List<PortType> GetAllPortTypes(bool excludeDefault)
        {
            var query = from e in PortTypes
                        orderby e.Code
                        select e;

            List<PortType> result = query.ToList<PortType>();

            if (result != null && result.Count > 0 && excludeDefault)
                return result.Where(p => p.Id != 0).ToList();

            return result;
        }

        //public LastUsedImportParameters GetAllLastUsedImportParameters()
        //{
        //    var query = from e in LastUsedImportParameters
        //                select e;

        //    LastUsedImportParameters result = query.FirstOrDefault();
        //    return result;
        //}

        public List<CargoType> GetAllCargoType(bool excludeDefault)
        {
            var query = from e in CargoTypes
                        orderby e.Name
                        select e;

            List<CargoType> result = query.ToList<CargoType>();

            if (result != null && result.Count > 0 && excludeDefault)
                return result.Where(p => p.Id != 0).ToList();

            return result;
        }

        public List<OperationType> GetAllOperationType(bool excludeDefault)
        {
            var query = from e in OperationTypes
                        orderby e.Name
                        select e;

            List<OperationType> result = query.ToList<OperationType>();

            if (result != null && result.Count > 0 && excludeDefault)
                return result.Where(p => p.Id != 0).ToList();

            return result;
        }

        public List<PurchaseSale> GetAllPurchaseSale(bool excludeDefault)
        {
            var query = from e in PurchaseSales
                        orderby e.Code
                        select e;

            List<PurchaseSale> result = query.ToList<PurchaseSale>();

            if (result != null && result.Count > 0 && excludeDefault)
                return result.Where(p => p.Id != 0).ToList();

            return result;
        }

        public List<Cargo> GetAllCargos()
        {
            var query = from e in Cargoes
                        orderby e.Code
                        select e;

            List<Cargo> result = query.ToList<Cargo>();

            return result;
        }

        public List<Operation> GetAllOperations()
        {
            var query = from e in Operations
                        select e;

            List<Operation> result = query.ToList<Operation>();

            return result;
        }
        public List<Qualification> GetAllQualification()
        {
            var query = from e in Qualifications
                        orderby e.Code
                        select e;

            List<Qualification> result = query.ToList<Qualification>();

            return result;
        }

        public List<WorkflowState> GetAllWorkflowState()
        {
            var query = from e in WorkflowStates
                        orderby e.Code
                        select e;

            List<WorkflowState> result = query.ToList<WorkflowState>();

            return result;
        }

        public List<ManagementIntent> GetAllManagementIntent()
        {
            var query = from e in ManagementIntents
                        orderby e.Code
                        select e;

            List<ManagementIntent> result = query.ToList<ManagementIntent>();

            return result;
        }

        public List<HedgeType> GetAllHedgeType()
        {
            var query = from e in HedgeTypes
                        orderby e.Code
                        select e;

            List<HedgeType> result = query.ToList<HedgeType>();

            return result;
        }

        public IEnumerable<LinkLegHedgeCommoHedge> GetInitialFxHedgeByHedgeCommoMaturity(HedgeCommoMaturity hedgeCommoMaturity)
        {
            if (hedgeCommoMaturity == null || hedgeCommoMaturity.Id == 0) return null;
            return LinkLegHedgeCommoHedges.Where(l => l.HedgeCommoMaturity.Id == hedgeCommoMaturity.Id && l.LinkTypeId == 1).OrderBy(l => l.HedgeLeg.FXHedge.Code);

        }

        public IEnumerable<LinkLegHedgeCommoHedge> GetFinalFxHedgeByHedgeCommoMaturity(HedgeCommoMaturity hedgeCommoMaturity)
        {
            if (hedgeCommoMaturity == null || hedgeCommoMaturity.Id == 0) return null;
            return LinkLegHedgeCommoHedges.Where(l => l.HedgeCommoMaturity.Id == hedgeCommoMaturity.Id && l.LinkTypeId == 2).OrderBy(l => l.HedgeLeg.FXHedge.Code);
        }

        public List<InternalState> GetAllInternalState(bool excludeDefault)
        {
            var query = from e in InternalStates
                        orderby e.Name
                        select e;

            List<InternalState> result = query.ToList<InternalState>();

            if (result != null && result.Count > 0 && excludeDefault)
                return result.Where(p => p.Id != 0).ToList();

            return result;
        }

        public List<InternalState> GetAllInternalStateCollection(bool excludeDefault)
        {
            var query = from e in InternalStates
                        orderby e.Name
                        select e;

            List<InternalState> result = query.ToList<InternalState>();

            if (result != null && result.Count > 0 && excludeDefault)
                return result.Where(p => p.Id != 0).ToList();

            return result;
        }

        public List<ExcludedContracts> GetAllLinkSignalContractExclusion()
        {
            IQueryable<ExcludedContracts> query = from e in SignalContractExclusions
                                                  select new ExcludedContracts
                                                  {
                                                      Id = e.Id,
                                                      PurchaseContract = e.PurchaseContract.Code,
                                                      SaleContract = e.SupplyContract.Code
                                                  };

            return query.ToList();
        }

        public void CleanCargo()
        {
            var query = from o in Operations
                        select o.CargoId;
            IEnumerable<int> cargoIds = query.Distinct();

            List<Cargo> cargoList = Cargoes.Where(c => !cargoIds.Any(element => c.Id == element)).ToList();

            Cargoes.RemoveRange(cargoList);
        }
    }
}
