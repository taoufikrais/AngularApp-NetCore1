using log4net;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Configuration;
 

namespace FXWIN.Common
{
    public static class logger
    {
       // private static readonly ILog currentLogger = LogManager.GetLogger("FxWinWeb");
     
        public static void Debug(this ILog log, string message, params object[] args)
        {
            log.DebugFormat(log.Logger.Name + ":" + message, args);
        }

        public static void Info(this ILog log, string message, params object[] args)
        {
            log.InfoFormat(log.Logger.Name + ":" + message, args);
        }

        public static void Warn(this ILog log, string message, string stackTrace = "")
        {
            log.Warn(log.Logger.Name + ":" + message + stackTrace);
        }

        public static void Error(this ILog log, string message, string stackTrace = "")
        {
            log.Error(log.Logger.Name + ":" + message + stackTrace);
        }

        public static void Log(this ILog log, string message, Category category, Priority priority)
        {
            switch (category)
            {
                case Category.Debug:
                    log.Debug(message);
                    break;

                case Category.Warn:
                    log.Warn(message);
                    break;

                case Category.Exception:
                    log.Error(message);
                    break;

                case Category.Info:
                    log.Info(message);
                    break;
            }
        }

        public static void MailSend(string body, string subject)
        {
            var mailSender = new MailSender();
            mailSender.MailSend(body, subject, ConfigurationSettings.AppSettings["Sender"], new List<string> { ConfigurationSettings.AppSettings["receiver"] });
        }
    }

    public enum Priority
    {
        None = 0,
        High = 1,
        Medium = 2,
        Low = 3
    }

    public enum Category
    {
        Debug = 0,
        Exception = 1,
        Info = 2,
        Warn = 3
    }

    public class LogArgs : EventArgs
    {
        public string Message;
        public Category Category;
        public Priority Priority;

        public LogArgs(string message, Category category, Priority priority)
        {
            this.Message = message;
            this.Category = category;
            this.Priority = priority;
        }
    }
}
