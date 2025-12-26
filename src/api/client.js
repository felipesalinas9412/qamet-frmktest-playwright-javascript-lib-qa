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
  const map = { p1: process.env.BASE_URLP1, p2: process.env.BASE_URLP2 };
  if (map[api]) return map[api];

  return undefined;
}

async function createAPIClient({ api = 'p1', baseURL, auth = false } = {}) {
  const resolved = resolveBaseURL(api, baseURL);
  if (!resolved) {
    throw new Error(`baseURL no definido para api=${api}`);
  }

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  // si necesitas auth por cookie/token, agrégalo aquí

  return await request.newContext({
    baseURL: resolved.endsWith('/') ? resolved : `${resolved}/`,
    extraHTTPHeaders: headers,
  });
}

module.exports = { createAPIClient };
