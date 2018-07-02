namespace FxWin.ClientApp.Models
{
    public class AppConfig
    {
        public WebApiConfig WebApi {get;set;}
        public AuthConfig OktaConfig {get;set;}
    }

    public class AuthConfig
    {
        public string Url { get; set; }
        public string ClientId { get; set; }
        public string RedirectUri { get; set; }
    }

    public class WebApiConfig
    {
        private string _DbWebApiUrl;//= "http://localhost:60257";
        public string DbWebApiUrl
        {
            get { return _DbWebApiUrl; }
            set { _DbWebApiUrl = value; }
        }
    }
    
}
