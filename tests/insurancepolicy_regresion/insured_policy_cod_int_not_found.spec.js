
import { test, expect } from '@playwright/test';

test('Insured policy cod_int Not Found', async ({ request }) => {
  const requestUrl = '/workshop/v1/insurance_policies-photos/search?thirdPartyInternalId=3307494520110&pageNumber=1&pageSize=10';
  const headers = {
  "Accept-Language": "es-ES",
  "Content-Type": "application/json"
};

  const t0 = Date.now();
  const response = await request.get(`/workshop/v1/insurance_policies-photos/search?thirdPartyInternalId=3307494520110&pageNumber=1&pageSize=10`, { headers });
  const elapsedMs = Date.now() - t0;

  // Cabeceras en minúsculas para acceso uniforme
  const hdr = {};
  for (const [k, val] of Object.entries(response.headers())) hdr[k.toLowerCase()] = val;

  const vars = {
  "endpoint": "",
  "ACCESS_TOKEN": ""
};

  
// Verificar que el status code sea 200
await test.step("Status code is 200", async () => {
    expect(response.status()).toBe(200);
});

// Validar que el tiempo de respuesta sea menor a 2 segundos
await test.step("Response time is less than 2000ms", async () => {
    expect(elapsedMs).to.be.below(2000);
});

// Parsear el body como JSON
let jsonData = await response.json();

// Validar estructura principal
await test.step("Response has correct structure", async () => {
    expect(jsonData).to.have.property('pageSize');
    expect(jsonData).to.have.property('pageNumber');
    expect(jsonData).to.have.property('totalPages');
    expect(jsonData).to.have.property('totalElements');
    expect(jsonData).to.have.property('items');
});

// Validar valores esperados
await test.step("Pagination values are correct", async () => {
    expect(jsonData.pageSize).to.eql(10);
    expect(jsonData.pageNumber).to.eql(1);
    expect(jsonData.totalPages).to.eql(1);
    expect(jsonData.totalElements).to.eql(0);
});

// Validar que items es un array vacío
await test.step("'items' is an empty array", async () => {
    expect(jsonData.items).to.be.an('array').that.is.empty;
});

});
