using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using FXWIN.Common.Helpers;
using FXWIN.Common.Extensions;
using FXWIN.Data.Provider;

namespace FxWin.WebApp.Services
{
    [FileHelpers.DelimitedRecord(";")]
    [FileHelpers.IgnoreEmptyLines()]
    public class ExecutionKTP : Source<ExecutionFX>
    {
        //[Libelle erreur] [#SIAM] – [N° Order] – [Montant])
        private const string MESSAGE_FORMAT = "[{0}] [{1}] – [{2}] – [{3}]";

        [FileHelpers.FieldNullValue("")]
        public string FxCode;
        [FileHelpers.FieldNullValue("")]
        public string SiamNumber;
        [FileHelpers.FieldNullValue("")]
        public string PurchaseSale;
        [FileHelpers.FieldNullValue("")]
        public string Nature;
        [FileHelpers.FieldNullValue("")]
        public string Amount;
        [FileHelpers.FieldNullValue("")]
        public string Currency;
        [FileHelpers.FieldNullValue("")]
        public string SpotRate;
        [FileHelpers.FieldNullValue("")]
        public string FwdPoint;
        [FileHelpers.FieldNullValue("")]
        public string AllIn;
        [FileHelpers.FieldNullValue("")]
        public string IgnoredField1;
        //[FileHelpers.FieldNullValue("01/01/0001")]
        //[FileHelpers.FieldConverter(FileHelpers.ConverterKind.Date, "dd/MM/yyyy")]
        public string Maturity;
        [FileHelpers.FieldNullValue("")]
        public string IgnoredField2;
        [FileHelpers.FieldNullValue("")]
        public string ExchValue;
        [FileHelpers.FieldNullValue("")]
        public string ExchCurrency;
        [FileHelpers.FieldNullValue("")]
        [FileHelpers.FieldOptional()]
        public string ConfirmationNumber;
        [FileHelpers.FieldNullValue("")]
        [FileHelpers.FieldOptional()]
        public string ExtraFields;

        public override ITransformedResult<ExecutionFX> GetTransformed()
        {
            ExecutionFX returnObject = new ExecutionFX();
            IErrorMessage errorMessage = null;
            try
            {
                if (string.IsNullOrEmpty(this.SiamNumber))
                {
                    string message = string.Format(MESSAGE_FORMAT, "Missing field in file : \"SIAM #\""
                                                                 , string.Empty
                                                                 , string.IsNullOrEmpty(this.FxCode) ? string.Empty : this.FxCode
                                                                 , string.IsNullOrEmpty(this.Amount) ? string.Empty : this.Amount);

                    errorMessage = new ErrorMessage(ErrorMessageType.BusinessMessage, message);
                    // l'objet est setté à Null pour qu'il ne soit pas retourné dans le résultat
                    returnObject = null;
                }
                if (returnObject.IsNotNull() && string.IsNullOrEmpty(this.PurchaseSale))
                {
                    string message = string.Format(MESSAGE_FORMAT, "Missing field in file : \"Type\""
                                                                 , string.IsNullOrEmpty(this.SiamNumber) ? string.Empty : this.SiamNumber
                                                                 , string.IsNullOrEmpty(this.FxCode) ? string.Empty : this.FxCode
                                                                 , string.IsNullOrEmpty(this.Amount) ? string.Empty : this.Amount);

                    errorMessage = new ErrorMessage(ErrorMessageType.BusinessMessage, message);
                    // l'objet est setté à Null pour qu'il ne soit pas retourné dans le résultat
                    returnObject = null;
                }
                if (returnObject.IsNotNull() && string.IsNullOrEmpty(this.Amount))
                {
                    string message = string.Format(MESSAGE_FORMAT, "Missing field in file : \"Amount\""
                                                                 , string.IsNullOrEmpty(this.SiamNumber) ? string.Empty : this.SiamNumber
                                                                 , string.IsNullOrEmpty(this.FxCode) ? string.Empty : this.FxCode
                                                                 , string.Empty);

                    errorMessage = new ErrorMessage(ErrorMessageType.BusinessMessage, message);
                    // l'objet est setté à Null pour qu'il ne soit pas retourné dans le résultat
                    returnObject = null;
                }
                if (returnObject.IsNotNull() && string.IsNullOrEmpty(this.Currency))
                {
                    string message = string.Format(MESSAGE_FORMAT, "Missing field in file : \"Currency\""
                                                                 , string.IsNullOrEmpty(this.SiamNumber) ? string.Empty : this.SiamNumber
                                                                 , string.IsNullOrEmpty(this.FxCode) ? string.Empty : this.FxCode
                                                                 , string.IsNullOrEmpty(this.Amount) ? string.Empty : this.Amount);

                    errorMessage = new ErrorMessage(ErrorMessageType.BusinessMessage, message);
                    // l'objet est setté à Null pour qu'il ne soit pas retourné dans le résultat
                    returnObject = null;
                }
                if (returnObject.IsNotNull() && string.IsNullOrEmpty(this.SpotRate))
                {
                    string message = string.Format(MESSAGE_FORMAT, "Missing field in file : \"Spot rate\""
                                                                 , string.IsNullOrEmpty(this.SiamNumber) ? string.Empty : this.SiamNumber
                                                                 , string.IsNullOrEmpty(this.FxCode) ? string.Empty : this.FxCode
                                                                 , string.IsNullOrEmpty(this.Amount) ? string.Empty : this.Amount);

                    errorMessage = new ErrorMessage(ErrorMessageType.BusinessMessage, message);
                    // l'objet est setté à Null pour qu'il ne soit pas retourné dans le résultat
                    returnObject = null;
                }
                if (returnObject.IsNotNull() && string.IsNullOrEmpty(this.Maturity))
                {
                    string message = string.Format(MESSAGE_FORMAT, "Missing field in file : \"Maturity\""
                                                                 , string.IsNullOrEmpty(this.SiamNumber) ? string.Empty : this.SiamNumber
                                                                 , string.IsNullOrEmpty(this.FxCode) ? string.Empty : this.FxCode
                                                                 , string.IsNullOrEmpty(this.Amount) ? string.Empty : this.Amount);

                    errorMessage = new ErrorMessage(ErrorMessageType.BusinessMessage, message);
                    // l'objet est setté à Null pour qu'il ne soit pas retourné dans le résultat
                    returnObject = null;
                }

                if (returnObject.IsNotNull())
                {
                    returnObject.AllIn = string.IsNullOrEmpty(this.AllIn) ? decimal.Zero : Convert.ToDecimal(this.AllIn);
                    returnObject.Amount = string.IsNullOrEmpty(this.Amount) ? decimal.Zero : Convert.ToDecimal(this.Amount);

                    int confirmationNumber;

                    if (int.TryParse(this.ConfirmationNumber, out confirmationNumber))
                    {
                        returnObject.ConfirmationNumber = confirmationNumber;
                    }

                    if (String.Equals(this.Currency, "EUR"))
                        returnObject.AmountCurrencyId = (int)eCurrency.EUR;
                    else if (String.Equals(this.Currency, "USD"))
                        returnObject.AmountCurrencyId = (int) eCurrency.USD;
                    else if (String.Equals(this.Currency, "GBP"))
                        returnObject.AmountCurrencyId = (int)eCurrency.GBP;

                    if (String.Equals(this.ExchCurrency, "EUR") || String.Equals(this.ExchCurrency, "EU"))
                        returnObject.ExchCurrencyId = (int)eCurrency.EUR;
                    else if (String.Equals(this.ExchCurrency, "USD") || String.Equals(this.ExchCurrency, "US"))
                        returnObject.ExchCurrencyId = (int)eCurrency.USD;
                    else if (String.Equals(this.ExchCurrency, "GBP") || String.Equals(this.ExchCurrency, "GB"))
                        returnObject.ExchCurrencyId = (int)eCurrency.GBP;

                    if (string.IsNullOrEmpty(this.FwdPoint))
                    {
                        if (string.IsNullOrEmpty(this.AllIn))
                            returnObject.FwdPoint = decimal.Zero;
                        else
                            returnObject.FwdPoint = Convert.ToDecimal(this.AllIn) - Convert.ToDecimal(this.SpotRate);
                    }
                    if (string.IsNullOrEmpty(this.AllIn))
                        returnObject.AllIn = Convert.ToDecimal(this.SpotRate) + Convert.ToDecimal(returnObject.FwdPoint);

                    returnObject.ExchValue = string.IsNullOrEmpty(this.ExchValue) ? decimal.Zero : Convert.ToDecimal(this.ExchValue);
                    returnObject.FXHedge = new FXHedge { Code = this.FxCode };
                    returnObject.Maturity = Convert.ToDateTime(this.Maturity);
                    returnObject.Nature = this.Nature;
                    if (String.Equals(this.PurchaseSale, "A"))
                        returnObject.PurchaseSaleId = (int)ePurchaseSale.ACHAT;
                    if (String.Equals(this.PurchaseSale, "V"))
                        returnObject.PurchaseSaleId = (int)ePurchaseSale.VENTE;

                    returnObject.FwdPoint = string.IsNullOrEmpty(this.FwdPoint) ? decimal.Zero : Convert.ToDecimal(this.FwdPoint);
                    returnObject.ExecutionCode = this.SiamNumber;
                    returnObject.SpotRate = string.IsNullOrEmpty(this.SpotRate) ? decimal.Zero : Convert.ToDecimal(this.SpotRate);

                    if (returnObject.ExchCurrencyId != (int)eCurrency.EUR)
                    {
                        string message = string.Format(MESSAGE_FORMAT, "\"Exch value currency\" in file is not EUR"
                                                                 , string.IsNullOrEmpty(this.SiamNumber) ? string.Empty : this.SiamNumber
                                                                 , string.IsNullOrEmpty(this.FxCode) ? string.Empty : this.FxCode
                                                                 , string.IsNullOrEmpty(this.Amount) ? string.Empty : this.Amount);

                        errorMessage = new ErrorMessage(ErrorMessageType.BusinessMessage, message);
                        // l'objet est setté à Null pour qu'il ne soit pas retourné dans le résultat
                        returnObject = null;
                    }

                    if (returnObject.IsNotNull() && !string.IsNullOrEmpty(this.AllIn)
                        && Convert.ToDecimal(this.SpotRate) + Convert.ToDecimal(returnObject.FwdPoint) != Convert.ToDecimal(this.AllIn))
                    {
                        string message = string.Format(MESSAGE_FORMAT, "The result of difference between \"All in\" and \"Fwd pts\" in file is not equal to \"Spot rate\""
                                                                 , string.IsNullOrEmpty(this.SiamNumber) ? string.Empty : this.SiamNumber
                                                                 , string.IsNullOrEmpty(this.FxCode) ? string.Empty : this.FxCode
                                                                 , string.IsNullOrEmpty(this.Amount) ? string.Empty : this.Amount);

                        errorMessage = new ErrorMessage(ErrorMessageType.BusinessMessage, message);
                        // l'objet est setté à Null pour qu'il ne soit pas retourné dans le résultat
                        returnObject = null;
                    }
                }
            }
            catch (Exception ex)
            {
                string message = ex.InnerException.IsNotNull() ? ex.InnerException.Message : ex.Message;
                errorMessage = new ErrorMessage(ErrorMessageType.TechnicalMessage, message);
            }

            return new TransformedResult<ExecutionFX>(errorMessage, returnObject);
        }
    }
}
