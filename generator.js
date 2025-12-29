
// generator.js (versión corregida)
const fs = require('fs');
const path = require('path');

const collectionPath = process.argv[2] || './Workshop Regresion.postman_collection.json';
const varsPath = process.argv[3]; // opcional: ./env.json
const vars = varsPath ? JSON.parse(fs.readFileSync(varsPath, 'utf8')) : {
  endpoint: process.env.ENDPOINT || '',
  ACCESS_TOKEN: process.env.ACCESS_TOKEN || process.env.TOKEN || ''
};

const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

function sanitizeName(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function resolveTemplate(str, v = {}) {
  if (!str) return str;
  return String(str).replace(/{{([^}]+)}}/g, (_, k) => (v[k] ?? ''));
}

function resolveHeaders(hdrs = [], v = {}) {
  const obj = {};
  for (const h of hdrs) {
    obj[resolveTemplate(h.key, v)] = resolveTemplate(h.value, v);
  }
  // Si tenemos ACCESS_TOKEN, añadimos Authorization
  if (v.ACCESS_TOKEN && !Object.keys(obj).some(k => k.toLowerCase() === 'authorization')) {
    obj['Authorization'] = `Bearer ${v.ACCESS_TOKEN}`;
  }
  return obj;
}

// Convierte script Postman a asserts de Playwright dentro del mismo test (test.step)
function convertPmTestsToPlaywright(scriptLines, ctx) {
  let s = scriptLines.join('\n');

  
// Caso especial: "Response body is valid JSON" con expect(...).to.not.throw()
  s = s.replace(
    /pm\.expect\s*\(\s*function\s*\(\)\s*\{\s*pm\.response\.json\(\)\s*;\s*\}\s*\)\s*\.to\s*\.not\s*\.throw\s*\(\s*\)\s*;/g,
  `
  await test.step("Response body is valid JSON", async () => {
    const body = await response.text();
    expect(() => JSON.parse(body)).not.toThrow();
  });
` );

  // Variables de Postman -> vars diccionario
  s = s.replace(/pm\.variables\.get\("([^"]+)"\)/g, (_, k) => `vars["${k}"]`);

  // pm.test("name", function () { ... }) -> await test.step("name", async () => { ... })
  s = s.replace(/pm\.test\("([^"]+)"\s*,\s*function\s*\(\)\s*\{/g,
    'await test.step("$1", async () => {');

  // pm.expect(...) -> expect(...)
  s = s.replace(/pm\.expect/g, 'expect');

  // pm.response.status() / code / status -> mapeos
  s = s.replace(/pm\.response\.to\.have\.status\((\d+)\)/g, 'expect(response.status()).toBe($1)');
  s = s.replace(/pm\.response\.code/g, 'response.status()');

  // "Response status is OK" (texto) -> ok()
  s = s.replace(/pm\.response\.status/g, '(response.ok() ? "OK" : String(response.status()))');

  // JSON y texto
  s = s.replace(/pm\.response\.to\.be\.json/g,
    'expect((response.headers()["content-type"] || response.headers()["Content-Type"] || "").toLowerCase()).toContain("application/json")');
  s = s.replace(/pm\.response\.json\(\)/g, 'await response.json()');
  s = s.replace(/pm\.response\.text\(\)/g, 'await response.text()');

  // Cabeceras
  s = s.replace(/pm\.response\.headers\.get\('([^']+)'\)/g,
    (_, k) => `response.headers()["${k.toLowerCase()}"] || response.headers()["${k}"]`);

  s = s.replace(/pm\.response\.to\.have\.header\("([^"]+)"\)/g,
    (_, k) => `expect(Boolean(response.headers()["${k.toLowerCase()}"] || response.headers()["${k}"])).toBeTruthy()`);

  // Tiempos de respuesta
  s = s.replace(/pm\.response\.responseTime/g, 'elapsedMs');

  // URL query (si se usa en tests)
  s = s.replace(/pm\.request\.url/g, 'requestUrl');

  // Elimina cualquier "pm." remanente por seguridad
  s = s.replace(/pm\./g, '');

  return s;
}

function generateTest(item, v) {
  const name = sanitizeName(item.name);
  const request = item.request;
  const method = (request.method || 'GET').toLowerCase();

  const rawUrl = request.url?.raw || '';
  const url = resolveTemplate(rawUrl, v);
  const headers = resolveHeaders(request.header || [], v);

  const testEvent = (item.event || []).find(e => e.listen === 'test');
  const playwrightScript = testEvent ? convertPmTestsToPlaywright(testEvent.script.exec, { url, vars: v }) : '';

  const code = `
import { test, expect } from '@playwright/test';

test('${item.name}', async ({ request }) => {
  const requestUrl = '${url}';
  const headers = ${JSON.stringify(headers, null, 2)};

  const t0 = Date.now();
  const response = await request.${method}(\`${url}\`, { headers });
  const elapsedMs = Date.now() - t0;

  // Cabeceras en minúsculas para acceso uniforme
  const hdr = {};
  for (const [k, val] of Object.entries(response.headers())) hdr[k.toLowerCase()] = val;

  const vars = ${JSON.stringify(v, null, 2)};

  ${playwrightScript}
});
`;
  return code;
}

function processItems(items, folder = 'tests', v = {}) {
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  for (const it of items || []) {
    if (it.item) {
      const subfolder = path.join(folder, sanitizeName(it.name));
      processItems(it.item, subfolder, v);
    } else if (it.request) {
      const fileName = sanitizeName(it.name) + '.spec.js';
      const filePath = path.join(folder, fileName);
      fs.writeFileSync(filePath, generateTest(it, v));
      console.log('✅ Generado:', filePath);
    }
  }
}

processItems(collection.item, 'tests', vars);
console.log('📦 Colección:', collection.info?.name || 'sin nombre');
console.log('🔗 Schema:', collection.info?.schema || '(desconocido)');
