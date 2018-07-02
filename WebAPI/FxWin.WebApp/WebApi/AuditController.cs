using System;
using System.Collections.Generic;
using System.Linq;
using System.Data.Entity;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using FXWIN.Data.Provider;

namespace FxWin.WebApp.WebApi
{
    [RoutePrefix("api/Audit")]
    public class AuditController : ApiController
    {
        private FXWinV2Entities _db = new FXWinV2Entities();

        [ResponseType(typeof(AuditTrail))]
        [HttpGet]
        [AllowAnonymous]
        [Route("GetCommodityHedgeAuditTrail")]
        public async Task<IHttpActionResult> GetCommodityHedgeAuditTrail()
        {
            var query = (from a in (from hc in _db.HedgeCommoMaturity_AuditTrail
                                    join u in _db.FxUsers on hc.ModifyBy equals u.UserGaia
                                    select new { obj1 = hc, obj3 = u }).ToList()
                         select new AuditTrail()
                         {
                             Code = a.obj1.Code,
                             Field = a.obj1.PropertyChangedName == "MOValidated" ? "BO Status" : a.obj1.PropertyChangedName,
                             OldValue = a.obj1.PropertyChangedName == "MOValidated" && a.obj1.OldValue == "0" ? "Not Validated" :
                                        a.obj1.PropertyChangedName == "MOValidated" && a.obj1.OldValue == "1" ? "Validated" : a.obj1.OldValue,
                             NewValue = a.obj1.PropertyChangedName == "MOValidated" && a.obj1.NewValue == "0" ? "Not Validated" :
                                        a.obj1.PropertyChangedName == "MOValidated" && a.obj1.NewValue == "1" ? "Validated" : a.obj1.NewValue,
                             UserModified = a.obj3.Surname + " " + a.obj3.Name,
                             ModificationDate = a.obj1.ModificationDate,
                             OperationType = a.obj1.OperationType,
                             Object = a.obj1.Object != null ? DateTime.Parse(a.obj1.Object).ToString("Y") : null
                         }
                       ).Union
                       (
                           from ca in _db.CommodityHedge_AuditTrail
                           join u in _db.FxUsers on ca.ModifyBy equals u.UserGaia
                           select new AuditTrail()
                           {
                               Code = ca.Code,
                               Field = ca.PropertyChangedName,
                               OldValue = ca.OldValue,
                               NewValue = ca.NewValue,
                               UserModified = u.Surname + " " + u.Name,
                               ModificationDate = ca.ModificationDate,
                               OperationType = ca.OperationType,
                               Object = null
                           }
                       );
            var res = query.OrderByDescending(a => a.ModificationDate).ToList();
            return Ok(res);
        }

        [ResponseType(typeof(AuditTrail))]
        [HttpGet]
        [AllowAnonymous]
        [Route("GetFXHedgeAuditTrail")]
        public async Task<IHttpActionResult> GetFXHedgeAuditTrail()
        {
               var query = (from a in
                             (from h in _db.HedgeLeg_AuditTrail
                              join u in _db.FxUsers on h.ModifyBy equals u.UserGaia
                              select new { obj0 = h, obj1 = u }).ToList()
                         select new AuditTrail()
                         {
                             Code = a.obj0.Code,
                             Field = a.obj0.Object != null && a.obj0.Object.Equals("Buy Leg") && a.obj0.PropertyChangedName == "Amount" ? "BL Amount" :
                                     a.obj0.Object != null && a.obj0.Object.Equals("Sale Leg") && a.obj0.PropertyChangedName == "Amount" ? "SL Amount" :
                                     a.obj0.Object != null && a.obj0.Object.Equals("Buy Leg") && a.obj0.PropertyChangedName == "Maturity" ? "BL Maturity" :
                                     a.obj0.Object != null && a.obj0.Object.Equals("Sale Leg") && a.obj0.PropertyChangedName == "Maturity" ? "SL Maturity" :
                                     a.obj0.Object != null && a.obj0.Object.Equals("Buy Leg") && a.obj0.PropertyChangedName == "UnderlyingMonth" ? "BL UnderlyingMonth" :
                                     a.obj0.Object != null && a.obj0.Object.Equals("Sale Leg") && a.obj0.PropertyChangedName == "UnderlyingMonth" ? "SL UnderlyingMonth" :
                                     a.obj0.Object != null && a.obj0.Object.Equals("Buy Leg") && a.obj0.PropertyChangedName == "FxContractId" ? "BL Contract" :
                                     a.obj0.Object != null && a.obj0.Object.Equals("Sale Leg") && a.obj0.PropertyChangedName == "FxContractId" ? "SL Contract" :
                                     a.obj0.Object != null && a.obj0.Object.Equals("Buy Leg") && a.obj0.PropertyChangedName == "OperationId" ? "BL Cargo" :
                                     a.obj0.Object != null && a.obj0.Object.Equals("Sale Leg") && a.obj0.PropertyChangedName == "OperationId" ? "SL Cargo" :
                                     a.obj0.Object != null && a.obj0.Object.Equals("Buy Leg") && a.obj0.PropertyChangedName == "MultipleCargoes" ? "BL MultipleCargo" :
                                     a.obj0.Object != null && a.obj0.Object.Equals("Sale Leg") && a.obj0.PropertyChangedName == "MultipleCargoes" ? "SL MultipleCargo" :
                                     a.obj0.Object != null && a.obj0.Object.Equals("Buy Leg") && a.obj0.PropertyChangedName == "UnderlyingTermId" ? "BL Other Underlying" :
                                     a.obj0.Object != null && a.obj0.Object.Equals("Sale Leg") && a.obj0.PropertyChangedName == "UnderlyingTermId" ? "SL Other Underlying" : a.obj0.PropertyChangedName,
                             OldValue = a.obj0.PropertyChangedName == "MultipleCargoes" && a.obj0.OldValue == "0" ? "False" :
                                        a.obj0.PropertyChangedName == "MultipleCargoes" && a.obj0.OldValue == "1" ? "True" :
                                        a.obj0.PropertyChangedName == "UnderlyingMonth" ? DateTime.Parse(a.obj0.OldValue).ToString("y") : a.obj0.OldValue,
                             NewValue = a.obj0.PropertyChangedName == "MultipleCargoes" && a.obj0.NewValue == "0" ? "False" :
                                        a.obj0.PropertyChangedName == "MultipleCargoes" && a.obj0.NewValue == "1" ? "True" :
                                        a.obj0.PropertyChangedName == "UnderlyingMonth" ? DateTime.Parse(a.obj0.NewValue).ToString("y") : a.obj0.NewValue,
                             UserModified = a.obj1.Surname + " " + a.obj1.Name,
                             ModificationDate = a.obj0.ModificationDate,
                             OperationType = a.obj0.OperationType,
                             Object = a.obj0.Object
                         }).Union(
                              (from a in
                                   (from fa in _db.FxHedge_AuditTrail
                                    join u in _db.FxUsers on fa.ModifyBy equals u.UserGaia
                                    select new { obj0 = fa, obj1 = u }).ToList()
                               select new AuditTrail()
                               {
                                   Code = a.obj0.Code,
                                   Field = a.obj0.PropertyChangedName,
                                   OldValue = a.obj0.PropertyChangedName == "CurrencyId" && (a.obj0.OldValue != null && a.obj0.OldValue != string.Empty) ? _db.Currencies.ToList().FirstOrDefault(mi => mi.Id == int.Parse(a.obj0.OldValue)).Code :
                                              a.obj0.OldValue,
                                   NewValue = a.obj0.PropertyChangedName == "CurrencyId" && (a.obj0.OldValue != null && a.obj0.NewValue != string.Empty) ? _db.Currencies.ToList().FirstOrDefault(mi => mi.Id == int.Parse(a.obj0.NewValue)).Code :
                                              a.obj0.NewValue,
                                   UserModified = a.obj1.Surname + " " + a.obj1.Name,
                                   ModificationDate = a.obj0.ModificationDate,
                                   OperationType = a.obj0.OperationType,
                                   Object = string.Empty
                               }).Union(
                                    from ex in _db.ExecutionFX_AuditTrail
                                    join u in _db.FxUsers on ex.ModifyBy equals u.UserGaia
                                    select new AuditTrail()
                                    {
                                        Code = ex.Code,
                                        Field = ex.PropertyChangedName,
                                        OldValue = ex.OldValue,
                                        NewValue = ex.NewValue,
                                        UserModified = u.Surname + " " + u.Name,
                                        ModificationDate = ex.ModificationDate,
                                        OperationType = ex.OperationType,
                                        Object = ex.Object
                                    }
                              )
                              //.Union(
                              //      from la in _db.LinkLegHedgeCommoHedge_AuditTrail
                              //      join u in _db.FxUsers on la.ModifyBy equals u.UserGaia
                              //      select new AuditTrail()
                              //      {
                              //          Code = la.Code,
                              //          Field = la.PropertyChangedName,
                              //          OldValue = la.OldValue,
                              //          NewValue = la.NewValue,
                              //          UserModified = u.Surname + " " + u.Name,
                              //          ModificationDate = la.ModificationDate,
                              //          OperationType = la.OperationType,
                              //          Object = la.Object
                              //      }
                              //)
                        );
            var res = query.OrderByDescending(a => a.ModificationDate);
            return Ok(res != null ? res : null);
        }


        [ResponseType(typeof(AuditTrail))]
        [HttpGet]
        [AllowAnonymous]
        [Route("GetOtherUnderlyingAuditTrail")]
        public async Task<IHttpActionResult> GetOtherUnderlyingAuditTrail()
        {
            var query = (from a in (from una in _db.UnderlyingTerm_AuditTrail
                                    join un in _db.UnderlyingTerms on una.EntityId equals un.Id
                                    join s in _db.Subjacents on un.UnderlyingId equals s.Id
                                    join u in _db.FxUsers on una.ModifyBy equals u.UserGaia
                                    select new { obj0 = una, obj1 = u }).AsEnumerable()
                         select new AuditTrail()
                         {
                             Code = a.obj0.Code,
                             Field = a.obj0.PropertyChangedName,
                             OldValue = a.obj0.PropertyChangedName == "BO Status" && a.obj0.OldValue == "0" ? "Not Validated" :
                                         a.obj0.PropertyChangedName == "BO Status" && a.obj0.OldValue == "1" ? "Estimated by BO" :
                                         a.obj0.PropertyChangedName == "BO Status" && a.obj0.OldValue == "2" ? "Validated by BO" : a.obj0.OldValue,
                             NewValue = a.obj0.PropertyChangedName == "BO Status" && a.obj0.NewValue == "0" ? "Not Validated" :
                                         a.obj0.PropertyChangedName == "BO Status" && a.obj0.NewValue == "1" ? "Estimated by BO" :
                                         a.obj0.PropertyChangedName == "BO Status" && a.obj0.NewValue == "2" ? "Validated by BO" : a.obj0.NewValue,
                             UserModified = a.obj1.Surname + " " + a.obj1.Name,
                             ModificationDate = a.obj0.ModificationDate,
                             OperationType = a.obj0.OperationType,
                             Object = a.obj0.Object
                         }
                        ).Union
                        (
                            from sa in _db.Subjacent_AuditTrail
                            join u in _db.FxUsers on sa.ModifyBy equals u.UserGaia
                            select new AuditTrail()
                            {
                                Code = sa.Code,
                                Field = sa.PropertyChangedName == "IsBEEMarginSharing" ? "BEEMarginSharing" : sa.PropertyChangedName,
                                OldValue = sa.PropertyChangedName == "IsBEEMarginSharing" && sa.OldValue == "0" ? "False" :
                                           sa.PropertyChangedName == "IsBEEMarginSharing" && sa.OldValue == "1" ? "True" :
                                           sa.OldValue,
                                NewValue = sa.PropertyChangedName == "IsBEEMarginSharing" && sa.NewValue == "0" ? "False" :
                                           sa.PropertyChangedName == "IsBEEMarginSharing" && sa.NewValue == "1" ? "True" :
                                           sa.NewValue,
                                UserModified = u.Surname + " " + u.Name,
                                ModificationDate = sa.ModificationDate,
                                OperationType = sa.OperationType,
                                Object = null
                            }
                        );

            var res = query.OrderByDescending(a => a.ModificationDate).ToList();
            return Ok(res);
        }

        [ResponseType(typeof(AuditTrail))]
        [HttpGet]
        [AllowAnonymous]
        [Route("GetCargoAuditTrail")]
        public async Task<IHttpActionResult> GetCargoAuditTrail()
        {
            var query = (from a in
                            (from oa in _db.Operation_AuditTrail
                             join u in _db.FxUsers on oa.ModifyBy equals u.UserGaia
                             select new { obj0 = oa, obj1 = u }).AsEnumerable()
                         select new AuditTrail()
                         {
                             Code = a.obj0.Code,
                             Field = a.obj0.PropertyChangedName == "IsBOValidated" ? "BO Status" : a.obj0.PropertyChangedName,
                             OldValue = a.obj0.PropertyChangedName == "IsBOValidated" && a.obj0.OldValue == "0" ? "Not Validated" :
                                         a.obj0.PropertyChangedName == "IsBOValidated" && a.obj0.OldValue == "1" ? "Estimated by BO" :
                                         a.obj0.PropertyChangedName == "IsBOValidated" && a.obj0.OldValue == "2" ? "Validated by BO" :
                                         a.obj0.OldValue,
                             NewValue = a.obj0.PropertyChangedName == "IsBOValidated" && a.obj0.NewValue == "0" ? "Not Validated" :
                                         a.obj0.PropertyChangedName == "IsBOValidated" && a.obj0.NewValue == "1" ? "Estimated by BO" :
                                         a.obj0.PropertyChangedName == "IsBOValidated" && a.obj0.NewValue == "2" ? "Validated by BO" :
                                         a.obj0.NewValue,
                             UserModified = a.obj1.Surname + " " + a.obj1.Name,
                             ModificationDate = a.obj0.ModificationDate,
                             OperationType = a.obj0.OperationType,
                             Object = a.obj0.Object
                         }).Union(from x in (from ca in _db.Cargo_AuditTrail
                                             join u in _db.FxUsers on ca.ModifyBy equals u.UserGaia
                                             select new { obj0 = ca, obj1 = u }).AsEnumerable()
                                  select new AuditTrail()
                                  {
                                      Code = x.obj0.Code,
                                      Field = x.obj0.PropertyChangedName == "CargoStateId" ? "Status" : x.obj0.PropertyChangedName,
                                      OldValue = x.obj0.PropertyChangedName == "CargoStateId" && (x.obj0.OldValue != null && x.obj0.OldValue != string.Empty) ? _db.CargoStates.AsEnumerable().Where(cs => cs.Id == int.Parse(x.obj0.OldValue)).FirstOrDefault().Code : x.obj0.OldValue,
                                      NewValue = x.obj0.PropertyChangedName == "CargoStateId" && (x.obj0.NewValue != null && x.obj0.NewValue != string.Empty) ? _db.CargoStates.AsEnumerable().Where(cs => cs.Id == int.Parse(x.obj0.NewValue)).FirstOrDefault().Code : x.obj0.NewValue,
                                      UserModified = x.obj1.Surname + " " + x.obj1.Name,
                                      ModificationDate = x.obj0.ModificationDate,
                                      OperationType = x.obj0.OperationType,
                                      Object = string.Empty
                                  });

            var res= query.OrderByDescending(a => a.ModificationDate).ToList();
            return Ok(res);
        }
    }
}
