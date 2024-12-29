import configJson from "./auth_config.json";

const env = import.meta.env.MODE

export function getConfig() {
  return configJson[env]
}
