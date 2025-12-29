
import { test, expect } from '@playwright/test';

test('Insured policy cod_int OK', async ({ request }) => {
  const requestUrl = '/workshop/v1/insurance_policies-photos/search?thirdPartyInternalId=330749452011&pageNumber=1&pageSize=10';
  const headers = {
  "Accept-Language": "es-ES",
  "Content-Type": "application/json"
};

  const t0 = Date.now();
  const response = await request.get(`/workshop/v1/insurance_policies-photos/search?thirdPartyInternalId=330749452011&pageNumber=1&pageSize=10`, { headers });
  const elapsedMs = Date.now() - t0;

  // Cabeceras en minúsculas para acceso uniforme
  const hdr = {};
  for (const [k, val] of Object.entries(response.headers())) hdr[k.toLowerCase()] = val;

  const vars = {
  "endpoint": "",
  "ACCESS_TOKEN": ""
};

  // ===================================
// 1. RESPONSE STRUCTURE AND STATUS
// ===================================
await test.step("Status code is 200 (OK)", async () => {
    expect(response.status()).toBe(200);
});

await test.step("Response has valid JSON body", async () => {
    expect((response.headers()["content-type"] || response.headers()["Content-Type"] || "").toLowerCase()).toContain("application/json");
});

await test.step("Response has required root-level fields", async () => {
    const jsonData = await response.json();
    expect(jsonData).to.have.property('pageSize');
    expect(jsonData).to.have.property('pageNumber');
    expect(jsonData).to.have.property('totalPages');
    expect(jsonData).to.have.property('totalElements');
    expect(jsonData).to.have.property('items');
});

await test.step("Response Content-Type header is application/json", async () => {
    expect(response.headers()["content-type"] || response.headers()["Content-Type"]).to.include('application/json');
});

// ===================================
// 2. PAGINATION DETAILS
// ===================================
await test.step("Pagination fields have correct data types", async () => {
    const jsonData = await response.json();
    expect(jsonData.pageSize).to.be.a('number');
    expect(jsonData.pageNumber).to.be.a('number');
    expect(jsonData.totalPages).to.be.a('number');
    expect(jsonData.totalElements).to.be.a('number');
});

await test.step("Pagination values are valid", async () => {
    const jsonData = await response.json();
    expect(jsonData.pageSize).to.be.at.least(0);
    expect(jsonData.pageNumber).to.be.at.least(1);
    expect(jsonData.totalPages).to.be.at.least(0);
    expect(jsonData.totalElements).to.be.at.least(0);
});

await test.step("Items array length does not exceed pageSize", async () => {
    const jsonData = await response.json();
    expect(jsonData.items.length).to.be.at.most(jsonData.pageSize);
});

await test.step("Total pages calculation is correct", async () => {
    const jsonData = await response.json();
    const expectedTotalPages = jsonData.pageSize > 0 ? Math.ceil(jsonData.totalElements / jsonData.pageSize) : 0;
    expect(jsonData.totalPages).to.equal(expectedTotalPages);
});

// ===================================
// 3. ITEM DETAILS AND MANDATORY FIELDS
// ===================================
await test.step("Items is an array", async () => {
    const jsonData = await response.json();
    expect(jsonData.items).to.be.an('array');
});

await test.step("Each item has all mandatory fields", async () => {
    const jsonData = await response.json();
    const mandatoryFields = [
        'portfolioId', 'policyNumber', 'policyInceptionDate', 
        'policyStartDate', 'policyEndDate', 'thirdPartyInternalId',
        'systemCode', 'commercialModeCodes', 'serviceModeCodes'
    ];
    
    jsonData.items.forEach(function (item, index) {
        mandatoryFields.forEach(function (field) {
            expect(item, `Item ${index} missing field: ${field}`).to.have.property(field);
        });
    });
});

await test.step("Each item has valid field types", async () => {
    const jsonData = await response.json();
    
    jsonData.items.forEach(function (item, index) {
        expect(item.portfolioId, `Item ${index} portfolioId type`).to.be.a('string');
        expect(item.policyNumber, `Item ${index} policyNumber type`).to.be.a('string');
        expect(item.policyInceptionDate, `Item ${index} policyInceptionDate type`).to.be.a('string');
        expect(item.policyStartDate, `Item ${index} policyStartDate type`).to.be.a('string');
        expect(item.policyEndDate, `Item ${index} policyEndDate type`).to.be.a('string');
        expect(item.thirdPartyInternalId, `Item ${index} thirdPartyInternalId type`).to.be.a('string');
        expect(item.systemCode, `Item ${index} systemCode type`).to.be.a('string');
        expect(item.commercialModeCodes, `Item ${index} commercialModeCodes type`).to.be.an('array');
        expect(item.serviceModeCodes, `Item ${index} serviceModeCodes type`).to.be.an('array');
    });
});

await test.step("Each item has valid nested structures", async () => {
    const jsonData = await response.json();
    
    jsonData.items.forEach(function (item, index) {
        if (item.policyStatus) {
            expect(item.policyStatus, `Item ${index} policyStatus type`).to.be.an('object');
            expect(item.policyStatus).to.have.property('statusCode');
        }
        
        if (item.guarantees) {
            expect(item.guarantees, `Item ${index} guarantees type`).to.be.an('array');
        }
        
        if (item.insuranceCards) {
            expect(item.insuranceCards, `Item ${index} insuranceCards type`).to.be.an('array');
        }
        
        if (item.clauses) {
            expect(item.clauses, `Item ${index} clauses type`).to.be.an('array');
        }
        
        if (item.address) {
            expect(item.address, `Item ${index} address type`).to.be.an('object');
        }
    });
});

// ===================================
// 4. DATA INTEGRITY AND BUSINESS RULES
// ===================================
await test.step("Date fields have valid ISO 8601 format", async () => {
    const jsonData = await response.json();
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
    
    jsonData.items.forEach(function (item, index) {
        if (item.policyInceptionDate) {
            expect(item.policyInceptionDate, `Item ${index} policyInceptionDate format`).to.match(iso8601Regex);
        }
        if (item.policyStartDate) {
            expect(item.policyStartDate, `Item ${index} policyStartDate format`).to.match(iso8601Regex);
        }
        if (item.policyEndDate) {
            expect(item.policyEndDate, `Item ${index} policyEndDate format`).to.match(iso8601Regex);
        }
    });
});

await test.step("Policy dates are in logical order (inception <= start <= end)", async () => {
    const jsonData = await response.json();
    
    jsonData.items.forEach(function (item, index) {
        const inception = new Date(item.policyInceptionDate);
        const start = new Date(item.policyStartDate);
        const end = new Date(item.policyEndDate);
        
        expect(inception.getTime(), `Item ${index} inception before or equal to start`).to.be.at.most(start.getTime());
        expect(start.getTime(), `Item ${index} start before or equal to end`).to.be.at.most(end.getTime());
    });
});

await test.step("ThirdPartyInternalId matches query parameter", async () => {
    const jsonData = await response.json();
    const queryThirdPartyId = requestUrl.query.get('thirdPartyInternalId');
    
    if (queryThirdPartyId) {
        jsonData.items.forEach(function (item, index) {
            expect(item.thirdPartyInternalId, `Item ${index} thirdPartyInternalId matches query`).to.equal(queryThirdPartyId);
        });
    }
});

await test.step("Policy numbers are not empty", async () => {
    const jsonData = await response.json();
    
    jsonData.items.forEach(function (item, index) {
        expect(item.policyNumber, `Item ${index} policyNumber not empty`).to.not.be.empty;
    });
});

await test.step("Commercial and service mode codes are not empty arrays", async () => {
    const jsonData = await response.json();
    
    jsonData.items.forEach(function (item, index) {
        expect(item.commercialModeCodes.length, `Item ${index} commercialModeCodes not empty`).to.be.at.least(1);
        expect(item.serviceModeCodes.length, `Item ${index} serviceModeCodes not empty`).to.be.at.least(1);
    });
});

await test.step("Guarantees have required fields when present", async () => {
    const jsonData = await response.json();
    
    jsonData.items.forEach(function (item, index) {
        if (item.guarantees && item.guarantees.length > 0) {
            item.guarantees.forEach(function (guarantee, gIndex) {
                expect(guarantee, `Item ${index} guarantee ${gIndex} has guaranteeId`).to.have.property('guaranteeId');
                expect(guarantee, `Item ${index} guarantee ${gIndex} has description`).to.have.property('description');
                expect(guarantee, `Item ${index} guarantee ${gIndex} has registerDate`).to.have.property('registerDate');
                expect(guarantee, `Item ${index} guarantee ${gIndex} has effectiveDate`).to.have.property('effectiveDate');
            });
        }
    });
});

await test.step("Insurance cards have valid status codes when present", async () => {
    const jsonData = await response.json();
    
    jsonData.items.forEach(function (item, index) {
        if (item.insuranceCards && item.insuranceCards.length > 0) {
            item.insuranceCards.forEach(function (card, cIndex) {
                expect(card, `Item ${index} card ${cIndex} has statusCode`).to.have.property('statusCode');
                expect(card.statusCode, `Item ${index} card ${cIndex} statusCode not empty`).to.not.be.empty;
            });
        }
    });
});

// ===================================
// 5. PERFORMANCE AND RESPONSE TIME
// ===================================
await test.step("Response time is less than 500ms", async () => {
    expect(elapsedMs).to.be.below(500);
});

await test.step("Response time is less than 500ms (acceptable threshold)", async () => {
    expect(elapsedMs).to.be.below(500);
});

await test.step("Response size is reasonable (less than 5MB)", async () => {
    const responseSize = response.responseSize;
    expect(responseSize).to.be.below(5 * 1024 * 1024);
});

// ===================================
// 6. ERROR HANDLING SCENARIOS
// ===================================
await test.step("No server errors (5xx status codes)", async () => {
    expect(response.status()).to.be.below(500);
});

await test.step("Response body is not empty", async () => {
    expect(await response.text()).to.not.be.empty;
});

await test.step("No null values in critical fields", async () => {
    const jsonData = await response.json();
    
    jsonData.items.forEach(function (item, index) {
        expect(item.policyNumber, `Item ${index} policyNumber not null`).to.not.be.null;
        expect(item.thirdPartyInternalId, `Item ${index} thirdPartyInternalId not null`).to.not.be.null;
        expect(item.systemCode, `Item ${index} systemCode not null`).to.not.be.null;
    });
});

// Store results for reporting
collectionVariables.set('lastTestTimestamp', new Date().toISOString());
collectionVariables.set('lastResponseTime', elapsedMs);
collectionVariables.set('lastItemCount', await response.json().items.length);
});
