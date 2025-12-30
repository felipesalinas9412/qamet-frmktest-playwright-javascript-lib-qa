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

/**
 *  Valida (status === 200 y el body es JSON y no está vacío)
 *  Compara todo el body contra el JSON Schema.
 */
async function validateCommonApiJSONResponse(res, schema) {
  expect(res.status(), 'Status HTTP no es 200').toBe(200);
  
  const contentType = res.headers()['content-type'];
  expect(contentType, 'La respuesta no es JSON').toContain('application/json');


  const body = await res.json();
  expect(body).toBeDefined();
  expect(typeof body).toBe('object');  
  expect(Array.isArray(body.items)).toBe(true);
  expect(body.items.length).toBeGreaterThan(0);
  expect(validateSchema(body, schema), 'No cumple con el esquema JSON').toBe(true);

  await attachLogs('Respuesta completa', body);
}

/**
 *  Valida (status <> 200 y el body es JSON y no está vacío)
 *  Valida que la estructura de error corresponda a la esperada. 
 */
async function validateNotCommonApiJSONResponse(res, code) {
  expect(res.status(), `Status HTTP es diferente de ${code}`).toBe(code);
  
  const contentType = res.headers()['content-type'];
  expect(contentType, 'La respuesta no es JSON').toContain('application/json');

  const jsonData = await res.json();

  if(code === 200){
    expect(Array.isArray(jsonData.items),'Items debe ser un Array').toBe(true);
    expect(jsonData.items.length,'Items debe estar vacío').toBe(0);
  }

  if(code === 500){
    expect(jsonData.statusCode).toEqual(500);
    expect(jsonData.errorCode).toEqual("PLAT:STORAGE:UNKNOWN_CODE");
    expect(jsonData.errorMessage).toEqual("Internal Server Error");
    expect(Array.isArray(jsonData.errorData),'errorData debe ser un Array').toBe(true);
    expect(jsonData.errorData.length,'errorData debe estar vacío').toBe(0);
  } 
}

async function validateResponseMandatoryFields(res, mandatoryFields){
  const jsonData = await res.json();
  jsonData.items.forEach(function (item, index) {
        mandatoryFields.forEach(function (field) {
            expect(item, `Item ${index} missing field: ${field}`).toHaveProperty(field);
        });
    });
}

async function expectNonEmptyString(value, message) {
  expect(typeof value, message).toBe('string');
  expect(value.trim().length, message).toBeGreaterThan(0);
}

module.exports = {
  validateCommonApiResponse,
  validateCommonApiObjectResponse,
  validateCommonApiJSONResponse,
  validateNotCommonApiJSONResponse,
  validateResponseMandatoryFields,  
  expectNonEmptyString,
};
