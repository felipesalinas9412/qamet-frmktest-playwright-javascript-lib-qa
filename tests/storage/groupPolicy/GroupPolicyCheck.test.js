const { test, expect } = require('@playwright/test');
const { createAPIClient } = require('@api/client');
const endpoints = require('@api/endpoints');
// Validaciones respuestas API
const { validateCommonApiJSONResponse, validateNotCommonApiJSONResponse, validateResponseMandatoryFields, expectNonEmptyString } = require('@utils/validateResponse');
// Schemas
const insuranceSchema = require('@schemas/insurance/insurancePolicy.schema.json');

let api;

test.beforeEach(async () => {
  api = await createAPIClient({api: 'p3', auth: true });
});

test('GroupPolicyByPolicyNumber', async () => {

  let res;
    
    await test.step("El código de respuesta es 200", async () => {
        res = await api.get(endpoints.p3.groupPolicy.getGroupPolicy);
        await validateNotCommonApiJSONResponse(res, 200);
      });
    
      await test.step("La respuesta presenta la estructura adecuada", async () => {
        const jsonData = await res.json();
    
        expect(jsonData).toHaveProperty('pageSize');
        expect(jsonData).toHaveProperty('pageNumber');
        expect(jsonData).toHaveProperty('totalPages');
        expect(jsonData).toHaveProperty('totalElements');
        expect(jsonData).toHaveProperty('items');
      });
    
      await test.step("Los valores de paginación son correctos", async () => {
        const jsonData = await res.json();
        
        expect(jsonData.pageSize).toEqual(10);
        expect(jsonData.pageNumber).toEqual(1);
        expect(jsonData.totalPages).toEqual(1);
        expect(jsonData.totalElements).toEqual(0);
      });
});