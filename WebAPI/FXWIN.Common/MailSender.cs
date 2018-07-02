using log4net;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using System.Configuration;

namespace FXWIN.Common
{
    public class MailAttributs
    {
        public string From { get; set; }

        public List<string> To { get; set; }

        public string Subject { get; set; }

        public string Body { get; set; }
    }

    public class ServerSenderInformation
    {
        public string SmtpServerName { get; set; }

        public int SmtpServerPort { get; set; }
    }


    public class MailSender
    {
        private static readonly ILog Logger = LogManager.GetLogger(typeof(MailSender).Name);
        public MailStatus MailSend(ServerSenderInformation serverSenderInformations, MailAttributs mailAttributs)
        {
            using (MailMessage mailMessage = new MailMessage())
            {
                mailMessage.From = new MailAddress(mailAttributs.From);
                foreach (string mailAdresse in mailAttributs.To)
                {
                    mailMessage.To.Add(mailAdresse);
                }
                mailMessage.Body = mailAttributs.Body;
                mailMessage.IsBodyHtml = false;
                mailMessage.Subject = mailAttributs.Subject;

                using (SmtpClient client = new SmtpClient(serverSenderInformations.SmtpServerName,
                        serverSenderInformations.SmtpServerPort))
                {
                    try
                    {
                        client.Send(mailMessage);
                        return MailStatus.Success;

                    }
                    catch (ArgumentOutOfRangeException ex)
                    {
                        Logger.Error($"{"Failed send email"}{ex.Message}");
                        return MailStatus.Failure;
                    }
                }

            }
        }

        public MailStatus MailSend(string body, string subject, string sender, List<String> receivers)
        {
            using (MailMessage mailMessage = new MailMessage())
            {
                mailMessage.From = new MailAddress(sender);
                foreach (string receiver in receivers)
                {
                    mailMessage.To.Add(receiver);
                }
                mailMessage.Body = body;
                mailMessage.IsBodyHtml = false;
                mailMessage.Subject = subject;

                string smtpServerName = ConfigurationSettings.AppSettings["SmtpServerName"];
                int smtpServerPort = Convert.ToInt16(ConfigurationSettings.AppSettings["SmtpServerPort"]);

                using (SmtpClient client = new SmtpClient(smtpServerName, smtpServerPort))
                {
                    try
                    {
                        client.Send(mailMessage);
                        return MailStatus.Success;
                    }
                    catch (ArgumentOutOfRangeException ex)
                    {
                        Logger.Error($"{"Failed send email"}{ex.Message}");
                        return MailStatus.Failure;
                    }
                }
            }
        }

        public MailStatus MailSend(MailMessage mailmessage)
        {
            string smtpServerName = ConfigurationSettings.AppSettings["SmtpServerName"];
            int smtpServerPort = Convert.ToInt16(ConfigurationSettings.AppSettings["SmtpServerPort"]);

            using (SmtpClient client = new SmtpClient(smtpServerName, smtpServerPort))
            {
                try
                {
                    client.Send(mailmessage);
                    return MailStatus.Success;
                }
                catch (ArgumentOutOfRangeException ex)
                {
                    Logger.Error($"{"Failed send email"}{ex.Message}");
                    return MailStatus.Failure;
                }
            }
        }
    }

    public enum MailStatus { Success = 1, Failure = 2 }
}
