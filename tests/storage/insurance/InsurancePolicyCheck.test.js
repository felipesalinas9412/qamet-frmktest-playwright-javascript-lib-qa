const { test, expect } = require('@playwright/test');
const { createAPIClient } = require('@api/client');
const { setTestData } = require('@utils/reportUtils');
const endpoints = require('@api/endpoints');
// Validaciones respuestas API
const { validateCommonApiJSONResponse, validateNotCommonApiJSONResponse, validateResponseMandatoryFields, expectNonEmptyString } = require('@utils/validateResponse');
// Schemas
const insuranceSchema = require('@schemas/insurance/insurancePolicy.schema.json');

let api;

test.beforeEach(async () => {
  api = await createAPIClient({api: 'p3', auth: true });
});

// -------------------- TESTS  --------------------

test('Obtener pólizas correctamente', async () => {

  let res;

  await test.step("La respuesta devuelve 200 (OK) y se comprueba la estructura", async () => {
    res = await api.get(endpoints.p3.insurancePoliciesPhotos.getInsurancePolicy);
    await validateCommonApiJSONResponse(res, insuranceSchema);
  });

  await test.step("Cada item tiene campos mandatorios", async () => {
    const mandatoryFields = [
        'portfolioId', 'policyNumber', 'policyInceptionDate', 
        'policyStartDate', 'policyEndDate', 'thirdPartyInternalId',
        'systemCode', 'commercialModeCodes', 'serviceModeCodes'
    ];
    await validateResponseMandatoryFields(res,mandatoryFields)
  });

  await test.step("Cada item tiene campos válidos", async () => {
      const jsonData = await res.json();
      
      jsonData.items.forEach(function (item, index) {
          expect(typeof item.portfolioId, `Item ${index} portfolioId type`).toBe('string');
          expect(typeof item.policyNumber, `Item ${index} policyNumber type`).toBe('string');
          expect(typeof item.policyInceptionDate, `Item ${index} policyInceptionDate type`).toBe('string');
          expect(typeof item.policyStartDate, `Item ${index} policyStartDate type`).toBe('string');
          expect(typeof item.policyEndDate, `Item ${index} policyEndDate type`).toBe('string');
          expect(typeof item.thirdPartyInternalId, `Item ${index} thirdPartyInternalId type`).toBe('string');
          expect(typeof item.systemCode, `Item ${index} systemCode type`).toBe('string');
          expect(typeof item.commercialModeCodes, `Item ${index} commercialModeCodes type`).toBe('object');
          expect(typeof item.serviceModeCodes, `Item ${index} serviceModeCodes type`).toBe('object');
      });
  });
  
  await test.step("Cada item tiene estructuras anidadas válidas", async () => {
      const jsonData = await res.json();
      
      jsonData.items.forEach(function (item, index) {
          if (item.policyStatus) {
              expect(typeof item.policyStatus, `Item ${index} policyStatus type`).toBe('object');
              expect(item.policyStatus).toHaveProperty('statusCode');
          }
          
          if (item.guarantees) {
              expect(typeof item.guarantees, `Item ${index} guarantees type`).toBe('object');
          }
          
          if (item.insuranceCards) {
              expect(typeof item.insuranceCards, `Item ${index} insuranceCards type`).toBe('object');
          }
          
          if (item.clauses) {
              expect(typeof item.clauses, `Item ${index} clauses type`).toBe('object');
          }
          
          if (item.address) {
              expect(typeof item.address, `Item ${index} address type`).toBe('object');
          }
      });
  });

  await test.step("Los campos de fecha tiene el formato ISO 8601", async () => {
      const jsonData = await res.json();
      const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
      
      jsonData.items.forEach(function (item, index) {
          if (item.policyInceptionDate) {
              expect(item.policyInceptionDate, `Item ${index} policyInceptionDate format`).toMatch(iso8601Regex);
          }
          if (item.policyStartDate) {
              expect(item.policyStartDate, `Item ${index} policyStartDate format`).toMatch(iso8601Regex);
          }
          if (item.policyEndDate) {
              expect(item.policyEndDate, `Item ${index} policyEndDate format`).toMatch(iso8601Regex);
          }
      });
  });
  
  await test.step("Las fecha de las pólizas están ordenadas lógicamente", async () => {
      const jsonData = await res.json();

      jsonData.items.forEach((item, index) => {
        const inception = new Date(item.policyInceptionDate);
        const start = new Date(item.policyStartDate);
        const end = new Date(item.policyEndDate);

        expect(
          inception.getTime(),
          `Item ${index} inception <= start`
        ).toBeLessThanOrEqual(start.getTime());

        expect(
          start.getTime(),
          `Item ${index} start <= end`
        ).toBeLessThanOrEqual(end.getTime());
      });
});

  await test.step("Los números de póliza no están vacíos", async () => {
      const jsonData = await res.json();
      
      jsonData.items.forEach(function (item, index) {
          expectNonEmptyString(item.policyNumber, `Item ${index} policyNumber`);
      });
  });
  
  await test.step("Los códigos de modo comercial y de servicio no son arreglos vacíos", async () => {
      const jsonData = await res.json();

      jsonData.items.forEach((item, index) => {
        expect(
          Array.isArray(item.commercialModeCodes),
          `Item ${index} commercialModeCodes should be an array`
        ).toBe(true);

        expect(
          item.commercialModeCodes.length,
          `Item ${index} commercialModeCodes not empty`
        ).toBeGreaterThan(0);

        expect(
          Array.isArray(item.serviceModeCodes),
          `Item ${index} serviceModeCodes should be an array`
        ).toBe(true);

        expect(
          item.serviceModeCodes.length,
          `Item ${index} serviceModeCodes not empty`
        ).toBeGreaterThan(0);
      });
});
  
  await test.step("Las garantías tienen campos obligatorios cuando están presentes", async () => {
      const jsonData = await res.json();
      
      jsonData.items.forEach(function (item, index) {
          if (item.guarantees && item.guarantees.length > 0) {
              item.guarantees.forEach(function (guarantee, gIndex) {
                  expect(guarantee, `Item ${index} guarantee ${gIndex} has guaranteeId`).toHaveProperty('guaranteeId');
                  expect(guarantee, `Item ${index} guarantee ${gIndex} has description`).toHaveProperty('description');
                  expect(guarantee, `Item ${index} guarantee ${gIndex} has registerDate`).toHaveProperty('registerDate');
                  expect(guarantee, `Item ${index} guarantee ${gIndex} has effectiveDate`).toHaveProperty('effectiveDate');
              });
          }
      });
  });
  
  await test.step("Las tarjetas de seguro tienen códigos de estado válidos cuando están presentes", async () => {
      const jsonData = await res.json();
      
      jsonData.items.forEach(function (item, index) {
          if (item.insuranceCards && item.insuranceCards.length > 0) {
              item.insuranceCards.forEach(function (card, cIndex) {
                  expect(card, `Item ${index} card ${cIndex} has statusCode`).toHaveProperty('statusCode');
              });
          }
      });
  });
});

test('Obtener pólizas en un rango de fechas correctamente', async () => {

  let res;

  await test.step("La respuesta devuelve 200 (OK) y se comprueba la estructura", async () => {
    res = await api.get(endpoints.p3.insurancePoliciesPhotos.getWithDateInsurancePolicy);
    await validateCommonApiJSONResponse(res, insuranceSchema);
  });

  await test.step("Cada item tiene campos mandatorios", async () => {
    const mandatoryFields = [
        'portfolioId', 'policyNumber', 'policyInceptionDate', 
        'policyStartDate', 'policyEndDate', 'thirdPartyInternalId',
        'systemCode', 'commercialModeCodes', 'serviceModeCodes'
    ];
    await validateResponseMandatoryFields(res,mandatoryFields)
  });

  await test.step("Cada item tiene campos válidos", async () => {
      const jsonData = await res.json();
      
      jsonData.items.forEach(function (item, index) {
          expect(typeof item.portfolioId, `Item ${index} portfolioId type`).toBe('string');
          expect(typeof item.policyNumber, `Item ${index} policyNumber type`).toBe('string');
          expect(typeof item.policyInceptionDate, `Item ${index} policyInceptionDate type`).toBe('string');
          expect(typeof item.policyStartDate, `Item ${index} policyStartDate type`).toBe('string');
          expect(typeof item.policyEndDate, `Item ${index} policyEndDate type`).toBe('string');
          expect(typeof item.thirdPartyInternalId, `Item ${index} thirdPartyInternalId type`).toBe('string');
          expect(typeof item.systemCode, `Item ${index} systemCode type`).toBe('string');
          expect(typeof item.commercialModeCodes, `Item ${index} commercialModeCodes type`).toBe('object');
          expect(typeof item.serviceModeCodes, `Item ${index} serviceModeCodes type`).toBe('object');
      });
  });
  
  await test.step("Cada item tiene estructuras anidadas válidas", async () => {
      const jsonData = await res.json();
      
      jsonData.items.forEach(function (item, index) {
          if (item.policyStatus) {
              expect(typeof item.policyStatus, `Item ${index} policyStatus type`).toBe('object');
              expect(item.policyStatus).toHaveProperty('statusCode');
          }
          
          if (item.guarantees) {
              expect(typeof item.guarantees, `Item ${index} guarantees type`).toBe('object');
          }
          
          if (item.insuranceCards) {
              expect(typeof item.insuranceCards, `Item ${index} insuranceCards type`).toBe('object');
          }
          
          if (item.clauses) {
              expect(typeof item.clauses, `Item ${index} clauses type`).toBe('object');
          }
          
          if (item.address) {
              expect(typeof item.address, `Item ${index} address type`).toBe('object');
          }
      });
  });

  await test.step("Los campos de fecha tiene el formato ISO 8601", async () => {
      const jsonData = await res.json();
      const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
      
      jsonData.items.forEach(function (item, index) {
          if (item.policyInceptionDate) {
              expect(item.policyInceptionDate, `Item ${index} policyInceptionDate format`).toMatch(iso8601Regex);
          }
          if (item.policyStartDate) {
              expect(item.policyStartDate, `Item ${index} policyStartDate format`).toMatch(iso8601Regex);
          }
          if (item.policyEndDate) {
              expect(item.policyEndDate, `Item ${index} policyEndDate format`).toMatch(iso8601Regex);
          }
      });
  });
  
  await test.step("Las fecha de las pólizas están ordenadas lógicamente", async () => {
      const jsonData = await res.json();

      jsonData.items.forEach((item, index) => {
        const inception = new Date(item.policyInceptionDate);
        const start = new Date(item.policyStartDate);
        const end = new Date(item.policyEndDate);

        expect(
          inception.getTime(),
          `Item ${index} inception <= start`
        ).toBeLessThanOrEqual(start.getTime());

        expect(
          start.getTime(),
          `Item ${index} start <= end`
        ).toBeLessThanOrEqual(end.getTime());
      });
});

  await test.step("Los números de póliza no están vacíos", async () => {
      const jsonData = await res.json();
      
      jsonData.items.forEach(function (item, index) {
          expectNonEmptyString(item.policyNumber, `Item ${index} policyNumber`);
      });
  });
  
  await test.step("Los códigos de modo comercial y de servicio no son arreglos vacíos", async () => {
      const jsonData = await res.json();

      jsonData.items.forEach((item, index) => {
        expect(
          Array.isArray(item.commercialModeCodes),
          `Item ${index} commercialModeCodes should be an array`
        ).toBe(true);

        expect(
          item.commercialModeCodes.length,
          `Item ${index} commercialModeCodes not empty`
        ).toBeGreaterThan(0);

        expect(
          Array.isArray(item.serviceModeCodes),
          `Item ${index} serviceModeCodes should be an array`
        ).toBe(true);

        expect(
          item.serviceModeCodes.length,
          `Item ${index} serviceModeCodes not empty`
        ).toBeGreaterThan(0);
      });
});
  
  await test.step("Las garantías tienen campos obligatorios cuando están presentes", async () => {
      const jsonData = await res.json();
      
      jsonData.items.forEach(function (item, index) {
          if (item.guarantees && item.guarantees.length > 0) {
              item.guarantees.forEach(function (guarantee, gIndex) {
                  expect(guarantee, `Item ${index} guarantee ${gIndex} has guaranteeId`).toHaveProperty('guaranteeId');
                  expect(guarantee, `Item ${index} guarantee ${gIndex} has description`).toHaveProperty('description');
                  expect(guarantee, `Item ${index} guarantee ${gIndex} has registerDate`).toHaveProperty('registerDate');
                  expect(guarantee, `Item ${index} guarantee ${gIndex} has effectiveDate`).toHaveProperty('effectiveDate');
              });
          }
      });
  });
  
  await test.step("Las tarjetas de seguro tienen códigos de estado válidos cuando están presentes", async () => {
      const jsonData = await res.json();
      
      jsonData.items.forEach(function (item, index) {
          if (item.insuranceCards && item.insuranceCards.length > 0) {
              item.insuranceCards.forEach(function (card, cIndex) {
                  expect(card, `Item ${index} card ${cIndex} has statusCode`).toHaveProperty('statusCode');
              });
          }
      });
  });
});

test('La consulta de póliza retorna un código de fallo', async () => {
  let res;

  await test.step("El código de respuesta es 500 (Error interno del servidor)", async () => {
    res = await api.get(endpoints.p3.insurancePoliciesPhotos.koInsurancePolicy);
    await validateNotCommonApiJSONResponse(res, 500);
  });

  await test.step("La respuesta de error cumple con la estructura esperada", async () => {
    const jsonData = await res.json();

    expect(jsonData).toHaveProperty('statusCode');
    expect(jsonData).toHaveProperty('errorCode');
    expect(jsonData).toHaveProperty('errorMessage');
    expect(jsonData).toHaveProperty('errorData');
    expect(jsonData).toHaveProperty('timestamp');
    expect(jsonData).toHaveProperty('path');
    expect(jsonData).toHaveProperty('requestId');
  });

  await test.step("Los tipos de datos son válidos", async () => {
    const jsonData = await res.json();

    expect(typeof jsonData.statusCode).toBe('number');
    expect(typeof jsonData.errorCode).toBe('string');
    expect(typeof jsonData.errorMessage).toBe('string');
    expect(typeof jsonData.errorData).toBe('object');
    expect(typeof jsonData.timestamp).toBe('string');
    expect(typeof jsonData.path).toBe('string');
    expect(typeof jsonData.requestId).toBe('string');
  });
});

test('La consulta de póliza no retorna resultados', async () => {
  let res;

  await test.step("El código de respuesta es 200", async () => {
    res = await api.get(endpoints.p3.insurancePoliciesPhotos.notFoundInsurancePolicy);
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