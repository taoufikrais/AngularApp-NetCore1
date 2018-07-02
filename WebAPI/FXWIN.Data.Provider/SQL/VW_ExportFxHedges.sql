CREATE VIEW dbo.VW_ExportFxHedges 
AS SELECT DISTINCT
	 EXC.Id																	AS Id
    ,EXC.ExecutionCode                     AS SIAM
    , CASE WHEN  ISNUMERIC(REPLACE(REPLACE(EXC.ExecutionCode,'A',''),'V',''))  = 1
      THEN REPLACE(REPLACE(EXC.ExecutionCode,'A',''),'V','') 
      ELSE ABS(CHECKSUM(NEWID())) % 5 + 1
      END  AS IdSIAM
	  ,FXH.Code																	AS Code
	  ,CUR.Code																	AS Currency
	  ,EXC.Amount																AS Amount
	  ,CASE WHEN
         PSA.Id = 1 THEN 
             'ACHAT' ELSE 
             'VENTE' END						          AS PurchaseSale
	  ,EXC.AllIn																AS FwdPoint
	  ,HLE.Maturity																AS Maturity
	  ,HLE.UnderlyingMonth														AS UnderlyingMonth
	  ,FXH.ExecutionDate														AS ExecutionDate
	  ,CASE WHEN BKC.Code IS NOT NULL THEN BKC.Code WHEN BKU.Code IS NOT NULL THEN BKU.Code ELSE 'FX-WIN Currency Hedge' END AS Book
	  ,EXC.SpotRate as SpotRate
    ,EXC.FwdPoint as ForwardPoints
    ,EXC.AllIn as FxRate
    ,FxUser.Name + ' ' + FxUser.Surname  as FxCreationUser
    ,WFS.Code as  Status
     , FXH.WorkflowStateId as  StatusId
    ,FXH.ModificationDate as ModificationDate
FROM dbo.ExecutionFX			AS EXC
INNER JOIN dbo.FXHedge			AS FXH WITH (NOLOCK) ON FXH.Id = EXC.FXHedgeId
INNER JOIN dbo.Currency			AS CUR WITH (NOLOCK) ON EXC.AmountCurrencyId = CUR.Id
INNER JOIN dbo.PurchaseSale		AS PSA WITH (NOLOCK) ON PSA.Id = EXC.PurchaseSaleId 
INNER JOIN dbo.FxUser As FxUser WITH(NOLOCK) on FxUser.UserGaia = FXH.CreationUser
INNER JOIN dbo.WorkflowState As WFS WITH(NOLOCK) on WFS.Id = FXH.WorkflowStateId
LEFT  JOIN dbo.HedgeLeg			AS HLE WITH (NOLOCK) ON HLE.FXHedgeId = FXH.Id
														AND ( FXH.HedgeTypeId IN (1,2)
																OR
																( FXH.HedgeTypeId = 3 AND EXC.PurchaseSaleId = HLE.PurchaseSaleId )
															)
LEFT JOIN dbo.FxContract		AS FXC WITH (NOLOCK) ON HLE.FxContractId = FXC.Id
LEFT JOIN dbo.Book				AS BKC  WITH (NOLOCK) ON FXC.BookId = BKC.Id
LEFT JOIN dbo.UnderlyingTerm	AS UND WITH (NOLOCK) ON HLE.UnderlyingTermId = UND.Id
LEFT JOIN dbo.Subjacent			AS SUB WITH (NOLOCK) ON UND.UnderlyingId = SUB.ID
LEFT JOIN dbo.Book				AS BKU  WITH (NOLOCK) ON SUB.BookId = BKU.Id
WHERE FXH.WorkflowStateId IN (3,4)
GO