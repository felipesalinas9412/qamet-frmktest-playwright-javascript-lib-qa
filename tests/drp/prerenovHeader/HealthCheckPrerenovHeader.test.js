// tests/ProyectoDashBoardRenewalProcess/prerenovHeader/GetPrerenovHeader.test.js
const { test } = require('@playwright/test');
const { createAPIClient } = require('@api/client');
const { setTestData } = require('@utils/reportUtils');
const endpoints = require('@api/endpoints');
// Validaciones respuestas API
const { validateCommonApiResponse } = require('@utils/validateResponse');

// Schema de validación
const prerenovHeaderSchema = require('@schemas/drp/prerenovHeader/prerenovheader.schema.json');

let api;

test.beforeEach(async ({}, testInfo) => {
  // API P1 (sin auth). Si requiere token, usa { auth: true }
  api = await createAPIClient({ api: 'p1', auth: false });

  if (testInfo.title.includes('Prerenov Header')) {
    await setTestData({
      suite: 'DRP_PRERENOV_HEADER',
      story: 'Consultar Prerenov Header',
      severity: 'critical',
      owner: 'Mapfre España',
      description: 'Validar respuesta exitosa de Prerenov Header',
    });
  }
});

test('GET /DRP_PRERENOV_HEADER - Validar respuesta Prerenov Header', async () => {
  const res = await api.get(endpoints.p1.prerenovHeader.getPrerenovHeader);
  await validateCommonApiResponse(res, prerenovHeaderSchema);
  console.log(await res.json());
});