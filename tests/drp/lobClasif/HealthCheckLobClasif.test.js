// tests/ProyectoDashBoardRenewalProcess/drpLobClasif/GetLobClasif.test.js
const { test } = require('@playwright/test');
const { createAPIClient } = require('@api/client');
const { setTestData } = require('@utils/reportUtils');
const endpoints = require('@api/endpoints');

// Validaciones respuestas API
const { validateCommonApiResponse } = require('@utils/validateResponse');

// Schema de validación
const lobClasifSchema = require('@schemas/drp/lobClasif/lobclasif.schema.json');

let api;

test.beforeEach(async ({}, testInfo) => {
  // API P1 (sin auth). Cambia a { auth: true } si tu P1 lo exige
  api = await createAPIClient({ api: 'p1', auth: false });

  if (testInfo.title.includes('LOB Clasif')) {
    await setTestData({
      suite: 'DRP_LOB_CLASIF',
      story: 'Consultar LOB Clasif',
      severity: 'critical',
      owner: 'Mapfre España',
      description: 'Validar respuesta exitosa de LOB Clasif',
    });
  }
});

test('GET /DRP_LOB_CLASIF - Validar respuesta LOB Clasif', async () => {
  console.log('Endpoint relativo:', endpoints.p1.lobClasif.getLobClasif);

  const response = await api.get(endpoints.p1.lobClasif.getLobClasif);

  console.log('Full Request URL:', response.url());
  console.log('Status:', response.status());

  await validateCommonApiResponse(response, lobClasifSchema);

  const responseBody = await response.json();
  console.log('Response Body:', responseBody);
});