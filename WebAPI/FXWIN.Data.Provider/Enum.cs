using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FXWIN.Data.Provider
{

    public enum eUnit
    {
        B6 = 1,
        GJ0 = 2,
        GJ1 = 3,
        KW0 = 4,
        KW1 = 5,
        KW2 = 6,
        MB0 = 7,
        MB1 = 8,
        MB2 = 9,
        MB20 = 10,
        MB6 = 11,
        MJ0 = 12,
        MJ1 = 13,
        MJ2 = 14,
        MJ20 = 15,
        MW0 = 16,
        MW1 = 17,
        MW2 = 18,
        TW0 = 19,
        TW1 = 20,
        TW2 = 21,
        th = 22,
        BL = 23
    }

    public enum ePortType
    {
        DEFAULT = 0,
        LOADING = 1,
        UNLOADING = 2
    }

    public enum eCurrency
    {
        DEFAULT = 0,
        EUR = 1,
        USD = 2,
        GBP = 3
    }

    public enum eCountry
    {
        DEFAULT = 0
    }

    public enum eBunkerFuelType
    {
        DEFAULT = 0,
        HFO = 1,
        DO = 2
    }

    public enum eDiversionScenario
    {
        DEFAULT = 0,
        DEEMED = 1,
        ACTUAL = 2,
        NO = 3
    }

    public enum eBaseCaseScenario
    {
        DEFAULT = 0,
        YES = 1,
        NO = 2
    }

    public enum eParcelType
    {
        DEFAULT = 0,
        SALE = 1,
        LOADING = 2,
        UNLOADING = 3,
        NAT_BOG = 4,
        FORCED_BOG = 5,
        FO = 6,
        DO = 7
    }

    public enum eCharterEventType
    {
        SOUS_AFFRETEMENT = 1,
        ARRET_TECHNIQUE = 2,
        ARRET_EXCEPTIONNEL = 3
    }

    public enum eInternalStatus
    {
        UNDEFINED = 0,
        OK = 1,
        EN_ERREUR_CHGT_DATE_OPERATION = 2,
        EN_ERREUR_ABSENCE_OPERATION = 3,
        EN_ERREUR_MONTANT_EXECUTION = 4
    }

    public enum eContractType
    {
        SALE = 1,
        PURCHASE = 2
    }

    public enum eWorkflowState
    {
        BROUILLON = 1,
        EN_COURS = 2,
        A_VERIFIER = 3,
        VALIDE = 4,
        ANNULE = 5
    }

    public enum eHedgeType
    {
        ACHAT = 1,
        VENTE = 2,
        SWAP = 3
    }

    public enum ePurchaseSale
    {
        ACHAT = 1,
        VENTE = 2
    }

    public enum eCargoState
    {
        OK = 0,
        CURTAILED = 1,
        ON_ERROR_MODIFIED_DATE = 2,
        ON_ERROR_MISSING_OPERATION = 3
    }
}
