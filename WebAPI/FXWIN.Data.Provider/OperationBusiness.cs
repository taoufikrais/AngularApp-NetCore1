using FXWIN.Common.Extensions;
using FXWIN.ConnectionHubs;
using FXWIN.Data.Provider.OperationsService;
using log4net;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Validation;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;

namespace FXWIN.Data.Provider
{
    public class OperationBusiness : IDisposable
    {
        private static readonly ILog _logger = LogManager.GetLogger(typeof(OperationBusiness).Name);
        private readonly FXWinV2Entities _dataContext = new FXWinV2Entities(false);
        private string IdGaia = "Signal";//WindowsIdentity.GetCurrent().Name.Substring(WindowsIdentity.GetCurrent().Name.IndexOf(@"\") + 1);
        
        private bool disposed;
        #region Members

        private List<Port> portsList;
        private List<Vessel> vesselsList;
        private List<PurchaseContract> purchaseContractList = null;
        private List<SupplyContract> supplyContractList = null;
        private List<CargoType> cargoTypeList = null;
        private List<OperationType> operationTypeList = null;
        private List<PurchaseSale> purchasesaleList = null;
        private List<Cargo> cargoList = null;
        private List<ExcludedContracts> signalContractExclusionsList = null;
        private List<Operation> operationList = null;
        private List<int> listOperationIdAdded = null;

        #endregion

        #region Properties

        public List<Port> PortsList
        {
            get { return portsList; }
            set { portsList = value; }
        }
        public List<Vessel> VesselsList
        {
            get { return vesselsList; }
            set { vesselsList = value; }
        }
        public List<PurchaseContract> PurchaseContractList
        {
            get { return this.purchaseContractList; }
            set { this.purchaseContractList = value; }
        }
        public List<SupplyContract> SupplyContractList
        {
            get { return supplyContractList; }
            set { supplyContractList = value; }
        }
        public List<CargoType> CargoTypeList
        {
            get { return cargoTypeList; }
            set { cargoTypeList = value; }
        }
        public List<OperationType> OperationTypeList
        {
            get { return operationTypeList; }
            set { operationTypeList = value; }
        }
        public List<PurchaseSale> PurchasesaleList
        {
            get { return purchasesaleList; }
            set { purchasesaleList = value; }
        }
        public List<Cargo> CargoList
        {
            get { return this._dataContext.Cargoes.ToList(); }
            //set { cargoList = value; }
        }
        public List<ExcludedContracts> SignalContractExclusionsList
        {
            get { return signalContractExclusionsList; }
            set { signalContractExclusionsList = value; }
        }
        public List<Operation> OperationList
        {
            get { return this._dataContext.Operations.ToList(); }
           // set { operationList = value; }
        }

        #endregion

        #region Constructor
        public OperationBusiness()
        {
            portsList = _dataContext.GetAllPorts(false);
            vesselsList = _dataContext.GetAllVessels(false);
            PurchaseContractList = _dataContext.GetAllPurchaseContracts(false);
            SupplyContractList = _dataContext.GetAllSupplyContracts(false);
            CargoTypeList = _dataContext.GetAllCargoType(false);
            OperationTypeList = _dataContext.GetAllOperationType(false);
            purchasesaleList = _dataContext.GetAllPurchaseSale(false);
           // CargoList = _dataContext.GetAllCargos();
            signalContractExclusionsList = GetAllLinkSignalContractExclusion();
            //OperationList = _dataContext.GetAllOperations();
        }
        #endregion

        #region Methods

        #region Public

        public string SaveOperations(List<ListOperations> lstOperationOutput, string program, DateTime startDate, DateTime endDate, out bool sommeErrors)
        {
          var messages= new StringBuilder();
            try
            {
                sommeErrors = false;
                _logger.Info("Start Save Operations ");
                //using (TransactionScope scope = new TransactionScope())
                //{
                if (lstOperationOutput != null && lstOperationOutput.Count > 0)
                {
                    RemoveCargoAndOperationsByDate(startDate, endDate);
                    this.RefreshData();

                    List<Vessel> vesselsToSave = new List<Vessel>();
                    List<Port> portsListToSave = new List<Port>();
                    //Type de cargaison Signal : (FOB, EXSHIP ....)
                    List<CargoType> cargoTypeListToSave = new List<CargoType>();
                    //Type de Cargaison Signal : (Achat, Vente ...)
                    //List<PurchaseSale> purchaseSaleListToSave = new List<PurchaseSale>();
                    //Type d'operation Signal : (Chargement, Dechargement ....)
                    List<OperationType> operationTypeListToSave = new List<OperationType>();
                    List<PurchaseContract> purchaseContractToSave = new List<PurchaseContract>();
                    List<SupplyContract> supplyContractToSave = new List<SupplyContract>();
                    List<Cargo> cargoListToSave = new List<Cargo>();
                    List<LinkFxContractSignalContract> listLinkFxContractSignalContractToSave = new List<LinkFxContractSignalContract>();
                    PurchaseContract purchaseContractToAdd = null;
                    SupplyContract supplyContractToAdd = null;
                    LinkFxContractSignalContract linkFxContractSignalContractToAdd = null;

                    // Set IsNew to False for LinkFxContractSignalContract
                    SetAllLinkFxSignalContractToIsNewToFalse();

                    #region Build Vessels, ports
                    foreach (ListOperations operation in lstOperationOutput)
                    {
                        // Build Vessels List
                        Vessel v = VesselsList.FirstOrDefault(ves => ves.Code == operation.codeNavire);//code_Navire
                        if (v == null && !vesselsToSave.Exists(x => x.Code == operation.codeNavire))
                        {
                            vesselsToSave.Add(Vessel.GetDefaultVessel(operation.codeNavire));
                        }

                        // Build Ports List
                        if (!string.IsNullOrEmpty(operation.codeTerminal))
                        {
                            Port PortTerminal = PortsList.FirstOrDefault(po => po.Code == operation.codeTerminal);
                            if (PortTerminal == null && !portsListToSave.Exists(x => x.Code == operation.codeTerminal))
                                portsListToSave.Add(Port.GetDefaultPort(operation.codeTerminal, (int)ePortType.DEFAULT));
                        }

                        // Build Ports List
                        if (!string.IsNullOrEmpty(operation.portChargement))
                        {
                            Port loadingPort = PortsList.FirstOrDefault(po => po.Code == operation.portChargement);
                            if (loadingPort == null && !portsListToSave.Exists(x => x.Code == operation.portChargement))
                                portsListToSave.Add(Port.GetDefaultPort(operation.portChargement, (int)ePortType.LOADING));
                        }

                        //Type de cargaison - FOB EX SHIP...
                        if (!string.IsNullOrEmpty(operation.typeCargaison))
                        {
                            CargoType typeCargaison = CargoTypeList.FirstOrDefault(po => po.Name == operation.typeCargaison);
                            if (typeCargaison == null && !cargoTypeListToSave.Exists(x => x.Name == operation.typeCargaison))
                                cargoTypeListToSave.Add(new CargoType { Name = operation.typeCargaison });
                        }

                        // Type de operation : Achat/Vente
                        // Inutile !!!
                        //if (!string.IsNullOrEmpty(operation.typeElementOperation))
                        //{
                        //    int purchaseSale = 0;

                        //    switch (operation.typeElementOperation)
                        //    {
                        //        case "ACHAT": purchaseSale = 1;
                        //            break;

                        //        case "VENTE": purchaseSale = 2;
                        //            break;

                        //        default:
                        //            purchaseSale = -1;
                        //            break;
                        //    }

                        //    if (purchaseSale > 0)
                        //    {
                        //        PurchaseSale typeOperationElement = purchasesaleList.FirstOrDefault(ps => ps.Id == purchaseSale);

                        //        if (typeOperationElement == null && !purchaseSaleListToSave.Exists(x => x.Code == operation.typeElementOperation))
                        //            purchaseSaleListToSave.Add(new PurchaseSale { Code = operation.typeElementOperation });
                        //    }                                
                        //}

                        // Type de operation : Chargement / Dechargement
                        if (!string.IsNullOrEmpty(operation.typeOperation))
                        {
                            OperationType typeOperation = operationTypeList.FirstOrDefault(ot => ot.Name == operation.typeOperation);
                            if (typeOperation == null && !operationTypeListToSave.Exists(x => x.Name == operation.typeOperation))
                                operationTypeListToSave.Add(new OperationType { Name = operation.typeOperation });
                        }

                        // Build PurchaseContract List
                        if (!string.IsNullOrEmpty(operation.codeContrat)
                            && string.Equals(operation.typeElementOperation.TrimEnd().TrimStart().ToUpper(), "ACHAT"))
                        {
                            PurchaseContract purchase = PurchaseContractList.FirstOrDefault(p => p.Code == operation.codeContrat);
                            if (purchase == null && !purchaseContractToSave.Exists(x => x.Code == operation.codeContrat))
                            {
                                purchaseContractToAdd = new PurchaseContract
                                {
                                    Code = operation.codeContrat
                                };

                                purchaseContractToSave.Add(purchaseContractToAdd);

                                linkFxContractSignalContractToAdd = new LinkFxContractSignalContract
                                {
                                    PurchaseContract = purchaseContractToAdd,
                                    IsToBeStormImported = false,
                                    IsNew = true
                                };

                                listLinkFxContractSignalContractToSave.Add(linkFxContractSignalContractToAdd);
                                messages.AppendLine(operation.codeContrat +",");
                            }
                        }

                        // Build SupplyContract List
                        if (!string.IsNullOrEmpty(operation.codeContrat)
                            && string.Equals(operation.typeElementOperation.TrimEnd().TrimStart().ToUpper(), "VENTE"))
                        {
                            SupplyContract Supply = SupplyContractList.FirstOrDefault(p => p.Code == operation.codeContrat);
                            if (Supply == null && !supplyContractToSave.Exists(x => x.Code == operation.codeContrat))
                            {
                                supplyContractToAdd = new SupplyContract
                                {
                                    Code = operation.codeContrat
                                };

                                supplyContractToSave.Add(supplyContractToAdd);

                                linkFxContractSignalContractToAdd = new LinkFxContractSignalContract
                                {
                                    SupplyContract = supplyContractToAdd,
                                    IsToBeStormImported = false,
                                    IsNew = true
                                };

                                listLinkFxContractSignalContractToSave.Add(linkFxContractSignalContractToAdd);
                                messages.AppendLine(operation.codeContrat +",");
                            }
                        }

                        // Build Cargo List
                        if (!string.IsNullOrEmpty(operation.codeCargaison))
                        {
                            if (string.Equals(operation.typeElementOperation.TrimEnd().TrimStart().ToUpper(), "ACHAT")
                                && IsSignalPurchaseContractIncluded(operation.codeContrat))
                            {
                                Cargo cargo = CargoList.FirstOrDefault(p => p.Code == operation.codeCargaison && p.CargoStateId != (int)eCargoState.CURTAILED);
                                if (cargo == null && !cargoListToSave.Exists(x => x.Code == operation.codeCargaison))
                                    cargoListToSave.Add(new Cargo
                                    {
                                        Code = operation.codeCargaison,
                                        InternalStateId = (int)eInternalStatus.OK,
                                        LoadingDate = operation.dateOperation.Date,
                                        CreationDate = DateTime.Now,
                                        CreationUser = IdGaia
                                    });
                            }
                            else if (string.Equals(operation.typeElementOperation.TrimEnd().TrimStart().ToUpper(), "VENTE")
                                && IsSignalSaleContractIncluded(operation.codeContrat))
                            {
                                Cargo cargo = CargoList.FirstOrDefault(p => p.Code == operation.codeCargaison && p.CargoStateId != (int)eCargoState.CURTAILED);
                                if (cargo == null && !cargoListToSave.Exists(x => x.Code == operation.codeCargaison))
                                    cargoListToSave.Add(new Cargo
                                    {
                                        Code = operation.codeCargaison,
                                        InternalStateId = (int)eInternalStatus.OK,
                                        LoadingDate = operation.dateOperation.Date,
                                        CreationDate = DateTime.Now,
                                        CreationUser = IdGaia
                                    });
                            }
                        }
                    }
                    #endregion

                    #region Save and Refresh Vessels, ports, type de cargaison
                    // Save All created data
                    //_dataContext.BulkInsert<Vessel>(vesselsToSave);
                    //_dataContext.BulkInsert<Port>(portsListToSave);
                    //_dataContext.BulkInsert<CargoType>(cargoTypeListToSave);
                    //_dataContext.BulkInsert<OperationType>(operationTypeListToSave);

                    new BaseService<Vessel>(false).SaveCollection<Vessel>(vesselsToSave);
                    new BaseService<Port>(false).SaveCollection<Port>(portsListToSave);
                    new BaseService<CargoType>(false).SaveCollection<CargoType>(cargoTypeListToSave);
                    new BaseService<OperationType>(false).SaveCollection<OperationType>(operationTypeListToSave);
                  

                    SaveCollection(purchaseContractToSave);
                    SaveCollection(supplyContractToSave);
                    SaveCollection(listLinkFxContractSignalContractToSave);

                    //_dataContext.BulkInsert<Cargo>(cargoListToSave);
                    new BaseService<Cargo>(false).SaveCollection<Cargo>(cargoListToSave);

                    // Refresh Data : Vessels, ports, cargo...
                    this.RefreshData();
                    #endregion

                    List<Operation> operations = new List<Operation>();
                    Dictionary<string, List<ListOperations>> cargoGroupeDictionary = new Dictionary<string, List<ListOperations>>();

                    foreach (var operation in lstOperationOutput)
                    {
                        if (!cargoGroupeDictionary.Keys.Contains((operation.codeCargaison)))
                        {
                            cargoGroupeDictionary.Add(operation.codeCargaison, new List<ListOperations>());
                            if (operation.dateOperation.Date >= startDate && operation.dateOperation.Date <= endDate)
                            {
                                cargoGroupeDictionary[operation.codeCargaison].Add(operation);
                            }
                        }
                        else if (operation.dateOperation.Date >= startDate && operation.dateOperation.Date <= endDate)
                        {
                            cargoGroupeDictionary[operation.codeCargaison].Add(operation);
                        }
                    }

                    HashSet<Operation> OperationsToUpdate = new HashSet<Operation>();
                    //Dictionary<string, HashSet<string>> operationToExclude = new Dictionary<string, HashSet<string>>();
                    Dictionary<string, HashSet<int>> operationToExclude = new Dictionary<string, HashSet<int>>();
                    foreach (var cargoElement in cargoGroupeDictionary)
                    {
                        foreach (var exclusion in SignalContractExclusionsList)
                        {
                            List<ListOperations> lstPurchase = cargoElement.Value.Where(v => string.Equals(v.codeContrat, exclusion.PurchaseContract)
                                && string.Equals(v.typeElementOperation.TrimEnd().TrimStart().ToUpper(), "ACHAT")).ToList();

                            List<ListOperations> lstSale = cargoElement.Value.Where(v => string.Equals(v.codeContrat, exclusion.SaleContract)
                                && string.Equals(v.typeElementOperation.TrimEnd().TrimStart().ToUpper(), "VENTE")).ToList();

                            if (!lstPurchase.IsNullOrEmpty() && !lstSale.IsNullOrEmpty())
                            {
                                var groupPurchase = lstPurchase.GroupBy(p => p.idCargaison).ToList();
                                var groupSale = lstSale.GroupBy(p => p.idCargaison).ToList();

                                HashSet<int> cargoIdToExclude = new HashSet<int>();
                                groupPurchase.ForEach(item =>
                                {
                                    if (groupSale.Any(g => g.Key == item.Key))
                                    {
                                        cargoIdToExclude.Add(item.Key);
                                    }
                                });
                                groupSale.ForEach(item =>
                                {
                                    if (groupPurchase.Any(g => g.Key == item.Key))
                                    {
                                        cargoIdToExclude.Add(item.Key);
                                    }
                                });

                                if (!cargoIdToExclude.IsNullOrEmpty())
                                {
                                    if (!operationToExclude.Keys.Contains(cargoElement.Key))
                                    {
                                        operationToExclude.Add(cargoElement.Key, new HashSet<int>());
                                        cargoIdToExclude.ForEach(element => operationToExclude[cargoElement.Key].Add(element));
                                    }
                                    else
                                    {
                                        cargoIdToExclude.ForEach(element => operationToExclude[cargoElement.Key].Add(element));
                                    }
                                }
                            }

                            //if (cargoElement.Value.Any(v => string.Equals(v.codeContrat, exclusion.PurchaseContract)
                            //    && string.Equals(v.typeElementOperation.TrimEnd().TrimStart().ToUpper(), "ACHAT"))
                            //    && cargoElement.Value.Any(v => string.Equals(v.codeContrat, exclusion.SaleContract)
                            //    && string.Equals(v.typeElementOperation.TrimEnd().TrimStart().ToUpper(), "VENTE")))
                            //{
                            //    if (!operationToExclude.Keys.Contains(cargoElement.Key))
                            //    {
                            //        operationToExclude.Add(cargoElement.Key, new HashSet<string>());
                            //        operationToExclude[cargoElement.Key].Add(exclusion.PurchaseContract);
                            //        operationToExclude[cargoElement.Key].Add(exclusion.SaleContract);
                            //    }
                            //    else
                            //    {
                            //        operationToExclude[cargoElement.Key].Add(exclusion.PurchaseContract);
                            //        operationToExclude[cargoElement.Key].Add(exclusion.SaleContract);
                            //    }
                            //}
                        }
                    }

                    //operationToExclude.ForEach(item => cargoGroupeDictionary[item.Key].RemoveAll(o => item.Value.Contains(o.codeContrat)));
                    operationToExclude.ForEach(item => cargoGroupeDictionary[item.Key].RemoveAll(o => item.Value.Contains(o.idCargaison)));

                    bool sommeOperationImported = false;

                    // Init the list of OperationId Added
                    this.listOperationIdAdded = new List<int>();

                    foreach (var listOperation in cargoGroupeDictionary)
                    {
                        foreach (var operation in listOperation.Value)
                        {
                            if (this.SignalContractExists(operation.codeContrat)
                                && (
                                        (string.Equals(operation.typeElementOperation.TrimEnd().TrimStart().ToUpper(), "ACHAT")
                                            && !listLinkFxContractSignalContractToSave.Any
                                            (
                                                c => c.PurchaseContractId.HasValue
                                                    && string.Equals(c.PurchaseContract.Code, operation.codeContrat)
                                            )
                                        )
                                    || (string.Equals(operation.typeElementOperation.TrimEnd().TrimStart().ToUpper(), "VENTE")
                                            && !listLinkFxContractSignalContractToSave.Any
                                            (
                                                c => c.SupplyContractId.HasValue && string.Equals(c.SupplyContract.Code, operation.codeContrat)
                                            )
                                        )
                                    )
                                && !IsSignalContractExcluded(operation.codeContrat))
                            {
                                sommeOperationImported = true;

                                #region  L'operation n'existe pas donc je la crée.
                                if (!IsOperationExists(operation.codeCargaison) && operation.dateOperation.Date <= endDate && operation.dateOperation.Date >= startDate)
                                {

                                    Operation entity = new Operation
                                    {
                                        OperationSignal = program,
                                        PurchaseContractId = GetPurchaseContractId(operation.codeContrat),
                                        SupplyContractId = GetSaleContractId(operation.codeContrat),
                                        PortId = GetPortId(operation.codeTerminal),
                                        CurrencyId = GetdefaultCurrencyId(),
                                        OperationDate = new DateTime(operation.dateOperation.Year, operation.dateOperation.Month, operation.dateOperation.Day),
                                        VesselId = GetVesselId(operation.codeNavire),
                                        CargoTypeId = GetCargoTypeId(operation.typeCargaison),
                                        OperationTypeId = GetOperationTypeId(operation.typeOperation),
                                        PurchaseMiddleOfficeCode = operation.codeCpAcheteuse,
                                        SaleMiddleOfficeCode = operation.codeCpVendeuse,
                                        CargoId = GetCargoId(operation.codeCargaison, false),
                                        PurchaseSaleId = GetPurchaseSaleId(operation.typeElementOperation),
                                        OperationVolumeM3 = (decimal)operation.volumeOperation,
                                        EnergyTW0 = (decimal)operation.quantiteOperation,
                                        LostAtSeaM3 = (decimal)operation.volumePertes,
                                        LostAtSeaTW0 = (decimal)operation.quantitePertes,
                                        LoadingPortId = GetPortId(operation.portChargement),
                                        CodeAbattement = (int?)Convert.ToInt32(operation.codeAbattement),
                                        InternalStateId = (int)eInternalStatus.OK,
                                        CreationUser = IdGaia,
                                        CreationDate = DateTime.Now
                                        //FoundInSignal = true
                                    };
                                    operations.Add(entity);
                                }
                                #endregion

                                #region L'operation existe

                                else
                                {
                                    // 3 cas possibles:
                                    // 1-operation dont la cargaison est abattue
                                    // 2-operation dont la cargaison est non abattue
                                    // 3-operation non existante (c'est la nouvelle avec la cargaison qui a le meme code que celle qui est abattue coté FX-Win)

                                    // Get des operations avec quadruplet, si operation n'existe pas alors je la crée.
                                    // Si elle existe => alors elle st soit abattue donc on ne fairt rien soit non abattue et on update l'operation

                                    // Canceled ! Mantis 2175 Ajout de la date de l'operation pour identifier l'opération (le quadruplet ne suffit pas). Il faut le faire sur
                                    // le quintuplet.
                                    Operation operationToUpdate = this.GetOperation(operation.codeCargaison, operation.codeTerminal, operation.typeOperation,
                                                                    operation.codeContrat, startDate, endDate);

                                    if (operationToUpdate.IsNull())
                                    {
                                        // cas 3
                                        Operation entity = new Operation
                                        {
                                            OperationSignal = program,
                                            PurchaseContractId = GetPurchaseContractId(operation.codeContrat),
                                            SupplyContractId = GetSaleContractId(operation.codeContrat),
                                            CurrencyId = GetdefaultCurrencyId(),
                                            PortId = GetPortId(operation.codeTerminal),
                                            OperationDate = new DateTime(operation.dateOperation.Year, operation.dateOperation.Month, operation.dateOperation.Day),
                                            VesselId = GetVesselId(operation.codeNavire),
                                            CargoTypeId = GetCargoTypeId(operation.typeCargaison),
                                            OperationTypeId = GetOperationTypeId(operation.typeOperation),
                                            PurchaseMiddleOfficeCode = operation.codeCpAcheteuse,
                                            SaleMiddleOfficeCode = operation.codeCpVendeuse,
                                            CargoId = GetCargoId(operation.codeCargaison, false),
                                            PurchaseSaleId = GetPurchaseSaleId(operation.typeElementOperation),
                                            OperationVolumeM3 = (decimal)operation.volumeOperation,
                                            EnergyTW0 = (decimal)operation.quantiteOperation,
                                            LostAtSeaM3 = (decimal)operation.volumePertes,
                                            LostAtSeaTW0 = (decimal)operation.quantitePertes,
                                            LoadingPortId = GetPortId(operation.portChargement),
                                            CodeAbattement = (int?)Convert.ToInt32(operation.codeAbattement),
                                            InternalStateId = (int)eInternalStatus.OK,
                                            CreationDate = DateTime.Now,
                                            CreationUser = IdGaia,
                                            
                                            //FoundInSignal = true
                                        };
                                        operations.Add(entity);
                                    }
                                    else
                                    {
                                        // Cas 1 on ne fait rien => on ne touche pas aux cargaisons abattues
                                        // Cas 2 on modifie l'operation avec les nouvelles données SIGNaL.
                                        //if (operationToUpdate.Cargo.CargoStateId != (int)eCargoState.CURTAILED)
                                        //{
                                        operationToUpdate.OperationSignal = program;
                                        operationToUpdate.PurchaseContractId = GetPurchaseContractId(operation.codeContrat);
                                        operationToUpdate.SupplyContractId = GetSaleContractId(operation.codeContrat);
                                        operationToUpdate.PortId = GetPortId(operation.codeTerminal);
                                        operationToUpdate.VesselId = GetVesselId(operation.codeNavire);
                                        operationToUpdate.CargoTypeId = GetCargoTypeId(operation.typeCargaison);
                                        operationToUpdate.OperationTypeId = GetOperationTypeId(operation.typeOperation);
                                        operationToUpdate.PurchaseMiddleOfficeCode = operation.codeCpAcheteuse;
                                        operationToUpdate.SaleMiddleOfficeCode = operation.codeCpVendeuse;
                                        operationToUpdate.CargoId = GetCargoId(operation.codeCargaison, false);
                                        operationToUpdate.PurchaseSaleId = GetPurchaseSaleId(operation.typeElementOperation);
                                        operationToUpdate.OperationVolumeM3 = (decimal)operation.volumeOperation;
                                        operationToUpdate.EnergyTW0 = (decimal)operation.quantiteOperation;
                                        operationToUpdate.LostAtSeaM3 = (decimal)operation.volumePertes;
                                        operationToUpdate.LostAtSeaTW0 = (decimal)operation.quantitePertes;
                                        operationToUpdate.LoadingPortId = GetPortId(operation.portChargement);
                                        operationToUpdate.CodeAbattement = (int?)Convert.ToInt32(operation.codeAbattement);
                                        operationToUpdate.CreationUser = IdGaia;
                                        //operationToUpdate.Added = true;

                                        //if (    (operationToUpdate.PayementDate2.HasValue || operationToUpdate.Amount2.HasValue)
                                        //    &&  operationToUpdate.OperationDate != operation.dateOperation)

                                        if ((operationToUpdate.IsBOValidated == 2)
                                            && operationToUpdate.OperationDate != operation.dateOperation.Date)
                                        {
                                            operationToUpdate.InternalStateId = (int)eInternalStatus.EN_ERREUR_CHGT_DATE_OPERATION;// En erreur chgmt date operation
                                            operationToUpdate.Cargo.CargoStateId = (int)eCargoState.ON_ERROR_MODIFIED_DATE;
                                            sommeErrors = true;
                                            SetHedgeInternalStatus(operationToUpdate, eInternalStatus.EN_ERREUR_CHGT_DATE_OPERATION);
                                            SetCommodityInternalStatus(operationToUpdate, eInternalStatus.EN_ERREUR_CHGT_DATE_OPERATION);
                                        }
                                        else
                                        {
                                            if ((operationToUpdate.IsBOValidated == 1)
                                                && (operationToUpdate.OperationDate != operation.dateOperation.Date))
                                            {
                                                operationToUpdate.OperationDate = new DateTime(operation.dateOperation.Year, operation.dateOperation.Month, operation.dateOperation.Day);
                                            }
                                            else
                                            {
                                                operationToUpdate.InternalStateId = (int)eInternalStatus.OK;// En erreur chgmt date operation
                                                operationToUpdate.Cargo.CargoStateId = (int)eCargoState.OK;
                                            }

                                        }

                                        if (operation.dateOperation.Date <= endDate && operation.dateOperation.Date >= startDate)
                                        {
                                            operationToUpdate.OperationDate = new DateTime(operation.dateOperation.Year, operation.dateOperation.Month, operation.dateOperation.Day);
                                        }

                                        operationToUpdate.ModificationDate = DateTime.Now;
                                        operationToUpdate.ModificationUser = IdGaia;
                                        OperationsToUpdate.Add(operationToUpdate);
                                    }
                                }

                                #endregion
                            }
                        }
                    }

                    #region Mettre en erreur les operation manquantes
                    if (sommeOperationImported)
                    {
                        List<Operation> missedOperationList = OperationList.Where(o => o.OperationDate >= startDate
                                                              && o.OperationDate <= endDate
                                                              && o.Cargo.CargoStateId != (int)eCargoState.CURTAILED).Except(OperationsToUpdate).ToList();

                        foreach (var missed in missedOperationList)
                        {
                            sommeErrors = true;
                            missed.InternalStateId = (int)eInternalStatus.EN_ERREUR_ABSENCE_OPERATION;
                            missed.Cargo.CargoStateId = (int)eCargoState.ON_ERROR_MISSING_OPERATION;
                            missed.ModificationUser = IdGaia;
                            missed.ModificationDate = DateTime.Now;
                            SetHedgeInternalStatus(missed, eInternalStatus.EN_ERREUR_ABSENCE_OPERATION);
                            SetCommodityInternalStatus(missed, eInternalStatus.EN_ERREUR_ABSENCE_OPERATION);
                        }
                        _dataContext.SaveChanges();
                    }
                    #endregion

                    //_dataContext.BulkInsert<Operation>(operations);
                    new BaseService<Operation>(false).SaveCollection<Operation>(operations);

                    _dataContext.CleanCargo();
                }

                // Commit de la transaction
                //    scope.Complete();
                //}
            }
            catch (DbEntityValidationException e)
            {
                List<string> errors = new List<string>();
                foreach (var eve in e.EntityValidationErrors)
                {
                    errors.Add(string.Format("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
                        eve.Entry.Entity.GetType().Name, eve.Entry.State));
                    foreach (var ve in eve.ValidationErrors)
                    {
                        errors.Add(string.Format("- Property: \"{0}\", Error: \"{1}\"",
                            ve.PropertyName, ve.ErrorMessage));
                        
                    }

                    messages.AppendLine(String.Join(", ", errors.ToArray()));
                }
                throw;
            }
            //catch (TransactionAbortedException ex)
            //{
            //    Console.WriteLine("TransactionAbortedException Message: {0}", ex.Message);
            //    throw;
            //}
            catch (ApplicationException ex)
            {
                _logger.Error("ApplicationException Message: "+ ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                _logger.Error("ApplicationException Message:"+ ex.Message);
                _dataContext.CleanCargo();
                throw;
            }
            _logger.Info("End Save Operations ");
            return messages.ToString();
        }

        private int GetdefaultCurrencyId()
        {
           return _dataContext.Currencies.FirstOrDefault(c => c.Code == "USD").Id;
        }

        private void SaveCollection(List<LinkFxContractSignalContract> listLinkFxContractSignalContractToSave)
        {
            _dataContext.LinkFxContractSignalContracts.AddRange(listLinkFxContractSignalContractToSave);
            _dataContext.SaveChanges();
        }

        private void SaveCollection(List<SupplyContract> supplyContractToSave)
        {
            _dataContext.SupplyContracts.AddRange(supplyContractToSave);
            _dataContext.SaveChanges();
        }

        private void SaveCollection(List<PurchaseContract> purchaseContractToSave)
        {
            _dataContext.PurchaseContracts.AddRange(purchaseContractToSave);
            _dataContext.SaveChanges();
        }

        private void SetHedgeInternalStatus(Operation operation, eInternalStatus internalStatus)
        {
            var query = from h in _dataContext.HedgeLegs
                        join f in _dataContext.FXHedges on h.FXHedgeId equals f.Id
                        where h.OperationId == operation.Id
                        select f;

            List<FXHedge> fxHedgeList = query.ToList();

            foreach (var fxHedge in fxHedgeList)
            {
                fxHedge.InternalStateId = (int)internalStatus;
            }
        }

        private void SetCommodityInternalStatus(Operation operation, eInternalStatus internalStatus)
        {
            var query = from c in _dataContext.CommodityHedges
                        where c.OperationId == operation.Id
                        select c;

            List<CommodityHedge> commoHedgeList = query.ToList();

            foreach (var commoHedge in commoHedgeList)
            {
                commoHedge.InternalStateId = (int)internalStatus;
            }
        }

        // Canceled!!! the Mantis 2175 Ajout de la date de l'operation pour identifier l'opération (le quadruplet ne suffit pas). Il faut le faire sur
        // le quintuplet.
        private Operation GetOperation(string codeCargaison, string port, string typeOperation, string codeContrat, DateTime startDate, DateTime endDate)
        {
            try
            {
                Operation op = this.OperationList.FirstOrDefault
                (
                    o => (o.Cargo.IsNotNull() && string.Equals(o.Cargo.Code, codeCargaison)
                                    && o.Cargo.CargoStateId != (int)eCargoState.CURTAILED)
                            && (o.OperationDate <= endDate
                                    && o.OperationDate >= startDate)
                            && (o.PortId.HasValue
                                    && string.Equals(o.Port.Code, port))
                            && (o.OperationTypeId.HasValue
                                    && string.Equals(o.OperationType.Name, typeOperation))
                            && ((o.SupplyContractId.HasValue
                                        && string.Equals(o.SupplyContract.Code, codeContrat))
                                        || (o.PurchaseContractId.HasValue
                                            && string.Equals(o.PurchaseContract.Code, codeContrat))
                                )
                            && !this.listOperationIdAdded.Contains(o.Id)
                );

                if (op != null)
                {
                    this.listOperationIdAdded.Add(op.Id);
                    //op.Added = true;
                }

                return op;
            }
            catch (Exception)
            {
                throw;
            }
        }
        #endregion

        #region Private

        private void RefreshData()
        {
            this.PortsList = _dataContext.Ports.Where(p => p.Id != 0).ToList();
            this.VesselsList = _dataContext.Vessels.Where<Vessel>(p => p.Id != 0).ToList();
            this.PurchaseContractList = _dataContext.PurchaseContracts.Where(p => p.Id != 0).ToList();
            this.SupplyContractList = _dataContext.SupplyContracts.Where(p => p.Id != 0).ToList();
            this.CargoTypeList = _dataContext.CargoTypes.Where(p => p.Id != 0).ToList();
            this.OperationTypeList = _dataContext.OperationTypes.Where(p => p.Id != 0).ToList();
            this.PurchasesaleList = _dataContext.PurchaseSales.Where(p => p.Id != 0).ToList();
            //this.CargoList = _dataContext.Cargoes.ToList();
            this.SignalContractExclusionsList = GetAllLinkSignalContractExclusion();
            //this.OperationList = _dataContext.Operations.ToList();
        }

        public List<ExcludedContracts> GetAllLinkSignalContractExclusion()
        {
            IQueryable<ExcludedContracts> query = from e in _dataContext.SignalContractExclusions
                                                  select new ExcludedContracts
                                                  {
                                                      Id = e.Id,
                                                      PurchaseContract = e.PurchaseContract.Code,
                                                      SaleContract = e.SupplyContract.Code
                                                  };

            return query.ToList();
        }

        private int? GetPortId(string code)
        {
            int? portId = null;

            Port port = this.PortsList.FirstOrDefault(p => p.Code == code);

            if (port != null)
            {
                portId = port.Id;
            }

            return portId;
        }

        private int? GetPurchaseContractId(string code)
        {
            int? purchaseContractId = null;

            PurchaseContract purchaseContract = this.purchaseContractList.FirstOrDefault(p => p.Code == code);

            if (purchaseContract != null)
            {
                purchaseContractId = purchaseContract.Id;
            }


            return purchaseContractId;
        }

        private int? GetSaleContractId(string code)
        {
            int? saleContractId = null;

            SupplyContract saleContract = this.supplyContractList.FirstOrDefault(p => p.Code == code);

            if (saleContract != null)
            {
                saleContractId = saleContract.Id;
            }


            return saleContractId;
        }

        private int? GetVesselId(string code)
        {
            int? vesselId = null;
            Vessel vessel = VesselsList.FirstOrDefault(v => v.Code == code);

            if (vessel != null)
            {
                vesselId = vessel.Id;

            }

            return vesselId;

        }

        private int? GetCargoTypeId(string code)
        {
            int? cargoType = null;

            CargoType cargo = cargoTypeList.FirstOrDefault(c => c.Name == code);

            if (cargo != null)
            {
                cargoType = cargo.Id;
            }
            return cargoType;

        }

        private int? GetOperationTypeId(string code)
        {
            int? operationType = null;

            OperationType operation = OperationTypeList.FirstOrDefault(c => c.Name == code);

            if (operation != null)
            {
                operationType = operation.Id;
            }
            return operationType;

        }

        private int? GetPurchaseSaleId(string code)
        {
            int? purchaseSale = null;

            PurchaseSale purchasesale = purchasesaleList.FirstOrDefault(ps => ps.Code == code);

            if (purchasesale != null)
            {
                purchaseSale = purchasesale.Id;
            }

            return purchaseSale;
        }

        private int GetCargoId(string code, bool isCurtailed)
        {
            Cargo cargo =null;
            if (isCurtailed)
            {
                // cargo= cargoList.FirstOrDefault(c => c.Code == code && c.CargoStateId == (int)eCargoState.CURTAILED);
                cargo = this._dataContext.Cargoes.FirstOrDefault(c => c.Code == code && c.CargoStateId == (int)eCargoState.CURTAILED);
            }
            else
            {
                //cargo= cargoList.FirstOrDefault(c => c.Code == code && c.CargoStateId != (int)eCargoState.CURTAILED);
                cargo = this._dataContext.Cargoes.FirstOrDefault(c => c.Code == code && c.CargoStateId != (int)eCargoState.CURTAILED);
            }
            if (cargo != null)
                return cargo.Id;
            else
                throw new Exception();
            //return cargoList.FirstOrDefault(c => c.Code == code && isCurtailed ? 
            //                                c.CargoStateId == (int)eCargoState.CURTAILED :
            //                                c.CargoStateId != (int)eCargoState.CURTAILED).Id;
        }

        private bool IsOperationExists(string cargoCode)
        {
            var q = (from e in _dataContext.Operations
                     where e.Cargo != null && e.Cargo.Code == cargoCode
                     select e).ToList();

            return q.Count > 0;
        }

        private bool SignalContractExists(string codeContract)
        {
            var query = (from e in _dataContext.LinkFxContractSignalContracts
                         where (e.PurchaseContractId.HasValue && e.PurchaseContract.Code == codeContract)
                         || (e.SupplyContractId.HasValue && e.SupplyContract.Code == codeContract)
                         select e).ToList();

            return query.Count > 0;
        }

        private bool IsSignalContractExcluded(string codeContract)
        {
            var query = (from e in _dataContext.LinkFxContractSignalContracts
                         where (e.PurchaseContractId.HasValue && e.PurchaseContract.Code == codeContract && !e.Include)
                         || (e.SupplyContractId.HasValue && e.SupplyContract.Code == codeContract && !e.Include)
                         select e).ToList();

            return query.Count > 0;
        }

        private bool IsSignalPurchaseContractIncluded(string codeContract)
        {
            List<LinkFxContractSignalContract> query = (from e in _dataContext.LinkFxContractSignalContracts
                                                        where e.Include && e.PurchaseContractId.HasValue && e.PurchaseContract.Code == codeContract
                                                        select e).ToList();

            return query.Count > 0;
        }

        private bool IsSignalSaleContractIncluded(string codeContract)
        {
            List<LinkFxContractSignalContract> query = (from e in _dataContext.LinkFxContractSignalContracts
                                                        where e.Include && e.SupplyContractId.HasValue && e.SupplyContract.Code == codeContract
                                                        select e).ToList();

            return query.Count > 0;
        }

        private void SetAllLinkFxSignalContractToIsNewToFalse()
        {
            _dataContext.LinkFxContractSignalContracts.Where(l => l.IsNew).ToList().ForEach(l => l.IsNew = false);
            _dataContext.SaveChanges();
        }


        /// <summary>
        /// Removes cargos and operations by date.
        /// </summary>
        /// <param name="startDate">The start date.</param>
        /// <param name="endDate">The end date.</param>
        public void RemoveCargoAndOperationsByDate(DateTime startDate, DateTime endDate)
        {
            var operationsIdInCommo = from c in _dataContext.CommodityHedges
                                      where c.OperationId.HasValue
                                      select c.OperationId;

            var operationsIdInFXHedge = from h in _dataContext.HedgeLegs
                                        where h.OperationId.HasValue
                                        select h.OperationId;

            HashSet<int> OperationCommoHedgeLeg = new HashSet<int>();
            foreach (var item in operationsIdInCommo.ToList())
            {
                OperationCommoHedgeLeg.Add(item.Value);
            }
            foreach (var item in operationsIdInFXHedge.ToList())
            {
                OperationCommoHedgeLeg.Add(item.Value);
            }

            //liste des operations dans notre intervall qui sont Non valide et non commo et non hedgeleg on les supprime
            var operationToDelete = from e in _dataContext.Operations
                                    where (e.IsBOValidated == 0 || e.IsBOValidated ==null ) 
                                    && !OperationCommoHedgeLeg.Contains(e.Id) && e.OperationDate >= startDate && e.OperationDate <= endDate
                                    select e;
            var operationsToDelete = operationToDelete.ToList();

            //Liste des operation cargo valide Hors de notre intervall 
            var allValidOperationCargoIds = from o in _dataContext.Operations
                                            where o.OperationDate > endDate || o.OperationDate < startDate
                                            || o.IsBOValidated == 2 || o.IsBOValidated == 1
                                            || OperationCommoHedgeLeg.Contains(o.Id)
                                            select o.CargoId;

            HashSet<int> operationCargoIds = new HashSet<int>(allValidOperationCargoIds.Distinct());

            var cargoToDelete = from c in _dataContext.Cargoes
                                where !operationCargoIds.Contains(c.Id)
                                select c;

            // Delete operations
            DeleteCollection<Operation>(operationsToDelete);

            // Delete cargo
            DeleteCollection<Cargo>(cargoToDelete.ToList());
        }

        private void DeleteCollection<T>(IEnumerable<Operation> collection)
        {
            try
            {
                this._dataContext.Operations.RemoveRange(collection);
                _dataContext.SaveChanges();
            }
            catch (Exception exp)
            {

                throw;
            }
        
        }

        private void DeleteCollection<T>(IEnumerable<Cargo> collection)
        {
            try
            {
                this._dataContext.Cargoes.RemoveRange(collection);
                _dataContext.SaveChanges();
            }
            catch (Exception exp)
            {

                throw;
            }
           

        }

        public virtual void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!disposed)
            {
                if (disposing)
                {
                    //dispose managed ressources
                }
            }
            //dispose unmanaged ressources
            disposed = true;
        }




        #endregion

        #endregion
    }


    public class ExcludedContracts
    {
        public int Id { get; set; }
        public string PurchaseContract { get; set; }
        public string SaleContract { get; set; }
    }
}
