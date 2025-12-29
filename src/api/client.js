// src/api/client.js
const { request } = require('@playwright/test');
require('dotenv').config();
const endpoints = require('./endpoints');

function resolveBaseURL(api, override) {
  if (override) return override;

  // 1) intenta desde endpoints
  const fromEndpoints = endpoints?.[api]?.baseURL;
  if (fromEndpoints) return fromEndpoints;

  // 2) respaldo desde .env por api
  const map = { p1: process.env.BASE_URLP1, p2: process.env.BASE_URLP2, p3: process.env.BASE_URLP3 };
  if (map[api]) return map[api];

  return undefined;
}

async function createAPIClient({ api, baseURL, auth} = {}) {
  const resolved = resolveBaseURL(api, baseURL);
  if (!resolved) {
    throw new Error(`baseURL no definido para api=${api}`);
  }

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Accept-Language': 'es-ES',
  };
  // si necesitas auth por cookie/token, agrégalo aquí

  if (auth === true){

    const  token = process.env.API_TOKEN;
    if(!token){
      throw new Error(`API_TOKEN no está definido en el archivo .env`);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  return await request.newContext({
    baseURL: resolved.endsWith('/') ? resolved : `${resolved}/`,
    extraHTTPHeaders: headers,
  });
}

module.exports = { createAPIClient };
