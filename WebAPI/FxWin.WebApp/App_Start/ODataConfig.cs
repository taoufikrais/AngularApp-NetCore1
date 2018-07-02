using System.Web.Http;
using Microsoft.OData.Edm;
using System.Web.OData.Builder;
using System.Web.OData.Extensions;
using System.Web.OData.Routing;
using System.Web.OData.Routing.Conventions;
using FxWin.WebApp.Models;
using FXWIN.Data.Provider;
using System.Threading.Tasks;


//using IEdmModel = Microsoft.Data.Edm.IEdmModel;
//using System.Web.OData.Routing.Conventions;

namespace FxWin.WebApp
{
    public static class ODataConfig
    {
        public static void Register(HttpConfiguration config)
        {
            //DateTimeKind of UTC are serialised correctly with the Z suffix
            config.SetTimeZoneInfo(System.TimeZoneInfo.Utc);

            // Web API routes
            //This has to be called before the following OData mapping, so also before WebApi mapping
            //AND Support inheritance of Route attributes for generic web api  
            config.MapHttpAttributeRoutes(new CustomDirectRouteProvider());


            //Enabling OData Query Options
            config.Select().Expand().Filter().OrderBy().MaxTop(null).Count();

            // Create the default collection of built-in conventions.
            var conventions = ODataRoutingConventions.CreateDefault();
            // Insert the custom convention at the start of the collection.
            conventions.Insert(0, new NavigationIndexRoutingConvention());

            //config.MapODataServiceRoute("ODataRoute", "odata",GetEdmModel(),new DefaultODataPathHandler(),conventions, new DefaultODataBatchHandler(GlobalConfiguration.DefaultServer));

            var odatarouteConf = config.MapODataServiceRoute("odata", "api", GetEdmModel());

            // INSERT CUSTOM FORMATTERS
            //var odataFormatters = ODataMediaTypeFormatters.Create(new CustomODataSerializerProvider(),new CustomODataDeSerializerProvider());
            //config.Formatters.InsertRange(0, odataFormatters);
            config.EnsureInitialized();
            GlobalConfiguration.Configuration.EnableDependencyInjection();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        public static IEdmModel GetEdmModel()
        {
            ODataModelBuilder builder = new ODataConventionModelBuilder();

            var entitySetConfCargos = builder.EntitySet<Cargo>("Cargos");
            var entityTypeConfCargo = builder.EntityType<Cargo>();
            entityTypeConfCargo.Property(c => c.LoadingDate).AsDate();
            entityTypeConfCargo.Property(c => c.CreationDate).AsDate();
            entityTypeConfCargo.Property(c => c.ModificationDate).AsDate();
            //add custom http function hors des methode http de base(get, post, delete )
            var getMissingCargos = entitySetConfCargos.EntityType.Collection.Function("GetMissingCargos").Returns<Cargo>();
            // getMissingCargos.ReturnsCollectionFromEntitySet<Cargo>("Cargos");
            entitySetConfCargos.EntityType.Collection.Function("GetListVW_CargoView").Returns<VW_CargoView>();
            entitySetConfCargos.EntityType.Collection.Function("ImportSignal").Returns<Task<IHttpActionResult>>();
            //var functionImportSignal = entitySetConfCargos.EntityType.Collection.Function("ImportSignal");
            //functionImportSignal.Parameter<string>("programCode");
            //functionImportSignal.Parameter<Date>("startDate");
            //functionImportSignal.Parameter<DateTimeKindAttribute>("endDate");
            //functionImportSignal.Parameter<string>("operationsInternes");
            //functionImportSignal.Returns<Task<IHttpActionResult>>();

            builder.EntitySet<CargoState>("CargoStates");

            var operations = builder.EntitySet<Operation>("Operations");
            var getOperationSynthesises = operations.EntityType.Collection.Function("GetOperationSynthesises").ReturnsCollectionFromEntitySet<OperationSynthesis>("OperationSynthesises");
            builder.EntitySet<OperationType>("OperationTypes");

            builder.EntitySet<TimeSerie>("TimeSeries");
            builder.EntitySet<TimeSerieValue>("TimeSerieValues");

            var entitySetConfHedges = builder.EntitySet<FXHedge>("Hedges");
            entitySetConfHedges.EntityType.Collection.Function("GetHedgeViews").Returns<VW_FXHedgeSynthesis>();

            entitySetConfHedges.EntityType.Collection.Function("GetFxWinHedgeTrade").Returns<ExportPomax>();

            var functionGetHedgeCodeOccurence = entitySetConfHedges.EntityType.Collection.Function("GetHedgeCodeOccurence");
            //functionGetHedgeCodeOccurence.Parameter<string>("code");
            //functionGetHedgeCodeOccurence.Parameter<int>("maxlength");
            functionGetHedgeCodeOccurence.Returns<Task<IHttpActionResult>>();

            var functionGetInitialFxHedgeCA = entitySetConfHedges.EntityType.Collection.Function("GetInitialFxHedgeCA");
            functionGetInitialFxHedgeCA.Parameter<int>("operationId");
            functionGetInitialFxHedgeCA.ReturnsCollectionFromEntitySet<FXHedge>("Hedges");

            var functionGetInitialFxHedgeRB = entitySetConfHedges.EntityType.Collection.Function("GetInitialFxHedgeRB");
            functionGetInitialFxHedgeRB.Parameter<int>("operationId");
            functionGetInitialFxHedgeRB.ReturnsCollectionFromEntitySet<FXHedge>("Hedges");

            entitySetConfHedges.EntityType.Collection.Function("ImportKtp").Returns<Task<IHttpActionResult>>();
            entitySetConfHedges.EntityType.Collection.Function("LongRunningProcess").Returns<Task<IHttpActionResult>>();
            builder.EntitySet<HedgeLeg>("HedgeLegs");
            builder.EntitySet<CommodityHedge>("CommodityHedges");

            //Referentiel 
            builder.EntitySet<Currency>("Currencies");
            builder.EntitySet<ManagementIntent>("ManagementIntents");
            builder.EntitySet<InternalState>("InternalStates");
            builder.EntitySet<Qualification>("Qualifications");
            builder.EntitySet<WorkflowState>("WorkflowStates");
            builder.EntitySet<Unit>("Units");
            builder.EntitySet<ContractType>("ContractTypes");
            builder.EntitySet<SubjacentType>("SubjacentTypes");
            builder.EntitySet<Incoterm>("Incoterms");
            builder.EntitySet<Book>("Books");
            builder.EntitySet<FXHedge>("HedgeTypes");

            builder.EntitySet<FxContract>("Contracts");

            var entitySetConfcontract = builder.EntitySet<FxContract>("Contracts");
            entitySetConfcontract.EntityType.Collection.Function("GetAssociatedSignalContracts").Returns<VW_LinkFxContractSignalContract>();

            var functionAssociatedFxContractByOperationId = entitySetConfCargos.EntityType.Collection.Function("GetAssociatedFxContractByOperationId");
            functionAssociatedFxContractByOperationId.Parameter<int>("id");
            functionAssociatedFxContractByOperationId.ReturnsCollectionFromEntitySet<FxContract>("Contracts");



            builder.EntitySet<LinkFxContractSignalContract>("LinkFxContractSignalContracts");
            var functionLinkFxContractSignalContractPurchase = builder.Function("GetLinkFxContractSignalContractPurchase");
            functionLinkFxContractSignalContractPurchase.ReturnsCollectionFromEntitySet<LinkFxContractSignalContract>("LinkFxContractSignalContractPurchase");

            var functionLinkFxContractSignalContractSale = builder.Function("GetLinkFxContractSignalContractSale");
            functionLinkFxContractSignalContractSale.ReturnsCollectionFromEntitySet<LinkFxContractSignalContract>("LinkFxContractSignalContractSale");

            var Underlyingsentity = builder.EntitySet<UnderlyingTerm>("UnderlyingTerms");
            Underlyingsentity.EntityType.Collection.Function("GetUnderlyingSynthesises").Returns<SubjacentSynthesis>();
            Underlyingsentity.EntityType.Collection.Function("GetUnderlyingSynthesisByMaturity").Returns<SubjacentSynthesis>();
            

            builder.EntitySet<ExecutionFX>("ExecutionFXes");

            var Subjacententity = builder.EntitySet<Subjacent>("Subjacents");
            Subjacententity.EntityType.Collection.Function("GetSubjacentViews").Returns<SubjacentView>();

            builder.EntitySet<PurchaseContract>("PurchaseContracts");
            builder.EntitySet<SupplyContract>("SupplyContracts");
            builder.EntitySet<SignalContractExclusion>("SignalContractExclusions");

            //in web config add This line 
            //<add name="ExtensionlessUrlHandler-Integrated-4.0Custom" path="/api*" verb ="*" type="System.Web.Handlers.TransferRequestHandler" preCondition="integratedMode,runtimeVersionv4.0" />
            return builder.GetEdmModel();
        }
    }

    //public class CustomControllerRoutingConvention : IODataRoutingConvention
    //{
    //    public string SelectAction(ODataPath odataPath, HttpControllerContext controllerContext, ILookup<string, HttpActionDescriptor> actionMap)
    //    {
    //        return null;
    //    }

    //    public string SelectController(ODataPath odataPath, HttpRequestMessage request)
    //    {
    //        return "SomeFixedContrllerNameWithoutTheControllerSuffix";
    //    }
    //}

    /*
      public class CustomODataSerializerProvider : ODataSerializerProvider
    {
          public override ODataEdmTypeSerializer GetEdmTypeSerializer(Microsoft.Data.Edm.IEdmTypeReference edmType)
          {
              throw new NotImplementedException();
          }

          public override ODataSerializer GetODataPayloadSerializer(Microsoft.Data.Edm.IEdmModel model, Type type, HttpRequestMessage request)
          {
              throw new NotImplementedException();
          }
    }

    public class CustomODataDeSerializerProvider : ODataDeserializerProvider
    {
        public override ODataEdmTypeDeserializer GetEdmTypeDeserializer(IEdmTypeReference edmType)
        {
            throw new NotImplementedException();
        }

        public override ODataDeserializer GetODataDeserializer(Type type, HttpRequestMessage request)
        {
            throw new NotImplementedException();
        }
    }*/


}