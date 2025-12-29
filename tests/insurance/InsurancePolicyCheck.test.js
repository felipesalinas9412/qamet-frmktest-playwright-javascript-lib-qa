const { test, expect } = require('@playwright/test');
const { createAPIClient } = require('@api/client');
const { setTestData } = require('@utils/reportUtils');
const endpoints = require('@api/endpoints');
// Validaciones respuestas API
const { validateCommonApiJSONResponse, validateResponseMandatoryFields, expectNonEmptyString } = require('@utils/validateResponse');
// Schemas
const insuranceSchema = require('@schemas/insurance/insurancePolicy.schema.json');

let api;

test.beforeEach(async () => {
  api = await createAPIClient({api: 'p3', auth: true });
});

// -------------------- TESTS  --------------------

test('GET  insurance-policies-photos', async () => {

  let res;

  await test.step("Status response is 200 (OK) and validate structure", async () => {
    res = await api.get(endpoints.p3.insurancePoliciesPhotos.getInsurancePolicy);
    await validateCommonApiJSONResponse(res, insuranceSchema);
  });

  await test.step("Each item has all mandatory fields", async () => {
    const mandatoryFields = [
        'portfolioId', 'policyNumber', 'policyInceptionDate', 
        'policyStartDate', 'policyEndDate', 'thirdPartyInternalId',
        'systemCode', 'commercialModeCodes', 'serviceModeCodes'
    ];
    await validateResponseMandatoryFields(res,mandatoryFields)
  });

  await test.step("Each item has valid field types", async () => {
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
  
  await test.step("Each item has valid nested structures", async () => {
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

  await test.step("Date fields have valid ISO 8601 format", async () => {
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
  
  await test.step("Policy dates are in logical order (inception <= start <= end)", async () => {
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

  await test.step("Policy numbers are not empty", async () => {
      const jsonData = await res.json();
      
      jsonData.items.forEach(function (item, index) {
          expectNonEmptyString(item.policyNumber, `Item ${index} policyNumber`);
      });
  });
  
  await test.step("Commercial and service mode codes are not empty arrays", async () => {
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
  
  await test.step("Guarantees have required fields when present", async () => {
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
  
  await test.step("Insurance cards have valid status codes when present", async () => {
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