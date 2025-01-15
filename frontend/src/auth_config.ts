type Config = {
  domain: string;
  clientId: string;
  audience: string;
  webserviceUrl: string;
};

const configJson: { [key: string]: Config} = {
  "development": {
    "domain": "christephanie.us.auth0.com",
    "clientId": "sAJY1fIiPwOLa0z1SUzXZzD3Hp1vjuV5",
    "audience": "https://api.christephanie.com",
    "webserviceUrl": "https://fpo6t7lub7.execute-api.us-east-1.amazonaws.com/proto/api"
  },
  "production": {
    "domain": "prod-abc789.us.auth0.com",
    "clientId": "PROD_CLIENT_ID",
    "audience": "https://api.example.com",
    "webserviceUrl": "https://api.example.com"
  }
}

export function getConfig() {
  return configJson[import.meta.env.MODE]
}
