
import { test, expect } from '@playwright/test';

test('GroupPolicyByPolicyNumber', async ({ request }) => {
  const requestUrl = '/workshop/v1/group_policies-photos/search?policyNumber=9474230&pageNumber=1&pageSize=10';
  const headers = {
  "Accept-Language": "es-ES",
  "Content-Type": "application/json"
};

  const t0 = Date.now();
  const response = await request.get(`/workshop/v1/group_policies-photos/search?policyNumber=9474230&pageNumber=1&pageSize=10`, { headers });
  const elapsedMs = Date.now() - t0;

  // Cabeceras en minúsculas para acceso uniforme
  const hdr = {};
  for (const [k, val] of Object.entries(response.headers())) hdr[k.toLowerCase()] = val;

  const vars = {
  "endpoint": "",
  "ACCESS_TOKEN": ""
};

  await test.step("Status code is 200", async () => {
    expect(response.status()).toBe(200);
});

await test.step("Response time is less than 200ms", async () => {
    expect(elapsedMs).to.be.below(200);
});

await test.step("Response body has the correct pageSize", async () => {
    expect(await response.json().pageSize).to.equal(2);
});

await test.step("Response body has the correct pageNumber", async () => {
    expect(await response.json().pageNumber).to.equal(1);
});

await test.step("Response body has the correct totalElements", async () => {
    expect(await response.json().totalElements).to.equal(2);
});

await test.step("Response body has the items array", async () => {
    expect(await response.json().items).to.be.an('array');
});

await test.step("Each item in the items array has the required fields", async () => {
    await response.json().items.forEach(function (item) {
        //expect(item).to.have.property('id');
        //expect(item).to.have.property('systemCode');
        expect(item).to.have.property('guaranteeCode');
        //expect(item).to.have.property('lineOfBusinessCode');
        expect(item).to.have.property('registerDate');
        expect(item).to.have.property('status');
        //expect(item).to.have.property('accountingBranchCode');
        //expect(item).to.have.property('coverageCodes');
        expect(item).to.have.property('commercialModeCodes');
        expect(item).to.have.property('serviceModeCodes');
        //expect(item).to.have.property('currencyCode');
        //expect(item).to.have.property('metadata');
    });
});

await test.step("Each item in de items array has status field not equals than COMPLETED", async () => {
    await response.json().items.forEach(function (item) {
        expect(item.status).to.not.equal("COMPLETED");
    })
})

});
