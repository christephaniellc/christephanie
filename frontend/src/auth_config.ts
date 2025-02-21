type Config = {
      domain: string;
      clientId: string;
      audience: string;
      webserviceUrl: string;
      returnTo: string;
    };

    const configJson: { [key: string]: Config } = {
      "localDev": {
        "domain": "christephanie.us.auth0.com",
        "clientId": "sAJY1fIiPwOLa0z1SUzXZzD3Hp1vjuV5",
        "audience": "https://fianceapi.dev.wedding.christephanie.com",
        "webserviceUrl": "https://fianceapi.dev.wedding.christephanie.com",
        "returnTo": "http://localhost:5173"
      },
      "development": {
        "domain": "christephanie.us.auth0.com",
        "clientId": "sAJY1fIiPwOLa0z1SUzXZzD3Hp1vjuV5",
        "audience": "https://fianceapi.dev.wedding.christephanie.com",
        "webserviceUrl": "https://fianceapi.dev.wedding.christephanie.com",
        "returnTo": "https://www.dev.wedding.christephanie.com"
      },
      "production": {
        "domain": "christephanie.us.auth0.com",
        "clientId": "wWcIuy2ILD0fvUucUzJlicIPUEHSa2f6",
        "audience": "https://fianceapi.wedding.christephanie.com",
        "webserviceUrl": "https://fianceapi.wedding.christephanie.com",
        "returnTo": "https://www.wedding.christephanie.com"
      }
    };

    export function getConfig() {
      return configJson[import.meta.env.VITE_ENV || 'development'];
    }