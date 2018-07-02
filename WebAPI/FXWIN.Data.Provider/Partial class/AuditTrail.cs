using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FXWIN.Data.Provider
{
    public class AuditTrail
    {
        public string Code { get; set; }
        public string Object { get; set; }
        public string Field { get; set; }

        private string oldValue;
        public string OldValue
        {
            get
            {
                decimal currentOldValue = 0;
                bool isConverted = Decimal.TryParse(oldValue, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture.NumberFormat, out currentOldValue);

                if (isConverted)
                {
                    return currentOldValue.ToString("n2");
                }
                else
                {
                    return oldValue;
                }
            }
            set
            {
                oldValue = value;
            }
        }
        private string newValue;
        public string NewValue
        {
            get
            {
                decimal currentOldValue = 0;
                bool isConverted = Decimal.TryParse(newValue, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture.NumberFormat, out currentOldValue);

                if (isConverted)
                {
                    return currentOldValue.ToString("n2");
                }
                else
                {
                    return newValue;
                }
            }
            set
            {
                newValue = value;
            }
        }
        public string UserModified { get; set; }
        public string OperationType { get; set; }
        private DateTime? modificationDate;
        public DateTime? ModificationDate
        {
            get
            {
                return modificationDate.HasValue ? (DateTime?)modificationDate.Value : null;
            }
            set
            {
                modificationDate = value;
            }
        }
    }
}
