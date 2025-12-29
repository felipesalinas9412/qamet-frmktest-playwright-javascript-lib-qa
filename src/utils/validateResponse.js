const { expect } = require('@playwright/test');
const { validateSchema } = require('@utils/schema-validator');
const { attachLogs } = require('./reportUtils');

/**
 * Valida (status === 200 y el body es array y no está vacío)
 * Compara todo el body contra el JSON Schema.
 */
async function validateCommonApiResponse(res, schema) {
  expect(res.status(), 'Status HTTP no es 200').toBe(200);
  const body = await res.json();

  console.log(body);
  expect(Array.isArray(body), 'La respuesta no es un arreglo').toBe(true);
  expect(body.length, 'El array está vacío').toBeGreaterThan(0);
  expect(validateSchema(body, schema), 'No cumple con el esquema JSON').toBe(true);

  await attachLogs('Respuesta completa', body);
}

/**
 * Valida (status === 200 y el body es un objeto 
 * Compara todo el body contra el JSON Schema. 
 */
async function validateCommonApiObjectResponse(res, schema) {
  expect(res.status(), 'Status HTTP no es 200').toBe(200);
  const body = await res.json();

  expect(body && typeof body === 'object' && !Array.isArray(body), 'La respuesta no es un objeto').toBe(true);
  expect(validateSchema(body, schema), 'No cumple con el esquema JSON').toBe(true);

  await attachLogs('Respuesta completa (objeto)', body);
}

module.exports = {
  validateCommonApiResponse,
  validateCommonApiObjectResponse,
};
