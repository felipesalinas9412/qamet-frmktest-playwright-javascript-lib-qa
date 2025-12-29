
import { test, expect } from '@playwright/test';

test('Insured policy cod_int KO', async ({ request }) => {
  const requestUrl = '/workshop/v1/insurance_policies-photos/search?policyNumber=prueba&thirdPartyInternalId=330749452011&pageNumber=1&pageSize=10';
  const headers = {
  "Accept-Language": "es-ES",
  "Content-Type": "application/json"
};

  const t0 = Date.now();
  const response = await request.get(`/workshop/v1/insurance_policies-photos/search?policyNumber=prueba&thirdPartyInternalId=330749452011&pageNumber=1&pageSize=10`, { headers });
  const elapsedMs = Date.now() - t0;

  // Cabeceras en minúsculas para acceso uniforme
  const hdr = {};
  for (const [k, val] of Object.entries(response.headers())) hdr[k.toLowerCase()] = val;

  const vars = {
  "endpoint": "",
  "ACCESS_TOKEN": ""
};

  
// Verificar que el status code sea 500
await test.step("Status code is 500", async () => {
    expect(response.status()).toBe(500);
});

// Comprobar que el Content-Type sea JSON
/*await test.step("Content-Type is application/json", async () => {
    response.to.have.header("Content-Type", /application\/json/);
});*/

// Parsear el body como JSON
let jsonData = await response.json();

// Validar estructura esperada
await test.step("Error response has correct structure", async () => {
    expect(jsonData).to.have.property('statusCode');
    expect(jsonData).to.have.property('errorCode');
    expect(jsonData).to.have.property('errorMessage');
    expect(jsonData).to.have.property('errorData');
    expect(jsonData).to.have.property('timestamp');
    expect(jsonData).to.have.property('path');
    expect(jsonData).to.have.property('requestId');
});

// Validar valores esperados
await test.step("Error values are correct", async () => {
    expect(jsonData.statusCode).to.eql(500);
    expect(jsonData.errorCode).to.eql("PLAT:STORAGE:UNKNOWN_CODE");
    expect(jsonData.errorMessage).to.eql("Internal Server Error");
});

// Validar tipos de datos
await test.step("Data types are correct", async () => {
    expect(jsonData.statusCode).to.be.a('number');
    expect(jsonData.errorCode).to.be.a('string');
    expect(jsonData.errorMessage).to.be.a('string');
    expect(jsonData.errorData).to.be.an('array');
    expect(jsonData.timestamp).to.be.a('string');
    expect(jsonData.path).to.be.a('string');
    expect(jsonData.requestId).to.be.a('string');
});

// Validar que errorData esté vacío
await test.step("'errorData' is an empty array", async () => {
    expect(jsonData.errorData).to.be.an('array').that.is.empty;
});

});
