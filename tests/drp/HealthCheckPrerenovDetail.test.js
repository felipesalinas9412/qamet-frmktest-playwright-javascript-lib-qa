// tests/ProyectoDashBoardRenewalProcess/prerenovDetail/GetPrerenovDetail.test.js
const { test } = require('@playwright/test');
const { createAPIClient } = require('@api/client');
const { setTestData } = require('@utils/reportUtils');
const endpoints = require('@api/endpoints');
const { validateCommonApiResponse } = require('@utils/validateResponse');

// Schema de validación
const prerenovDetailSchema = require('@schemas/drp/prerenovdetail.schema.json');

let api;

test.beforeEach(async ({}, testInfo) => {
  // API P1 (sin auth). Cambia a { auth: true } si lo necesitas.
  api = await createAPIClient({ api: 'p1', auth: false });

  if (testInfo.title.includes('Prerenov Detail')) {
    await setTestData({
      suite: 'DRP_PRERENOV_DETAIL',
      story: 'Consultar Prerenov Detail',
      severity: 'critical',
      owner: 'Mapfre España',
      description: 'Validar respuesta exitosa de Prerenov Detail',
    });
  }
});

test('GET /DRP_PRERENOV_DETAIL - Validar respuesta Prerenov Detail', async () => {
  const res = await api.get(endpoints.p1.prerenovDetail.getPrerenovDetail);
  await validateCommonApiResponse(res, prerenovDetailSchema);
  console.log(await res.json());
});
