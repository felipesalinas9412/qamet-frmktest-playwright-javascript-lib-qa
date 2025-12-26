// tests/ProyectoDashBoardRenewalProcess/cuadreGeneral/GetCuadreGeneral.test.js
const { test } = require('@playwright/test');
const { createAPIClient } = require('@api/client');
const { setTestData } = require('@utils/reportUtils');
const endpoints = require('@api/endpoints');
// Validaciones respuestas API
const { validateCommonApiResponse } = require('@utils/validateResponse');
// Schema
const cuadreGeneralSchema = require('@schemas/drp/cuadreGeneral/cuadregeneral.schema.json');

let api;

test.beforeEach(async ({}, testInfo) => {
  // API P1 (sin auth)
  api = await createAPIClient({ api: 'p1', auth: false });

  if (testInfo.title.includes('Cuadre General')) {
    await setTestData({
      suite: 'DRP_CuadreGeneral',
      story: 'Consultar Cuadre General',
      severity: 'critical',
      owner: 'Mapfre España',
      description: 'Validar respuesta exitosa de Cuadre General',
    });
  }
});

test('GET /DRP_CuadreGeneral/GetAllCuadreGeneral - Validar respuesta Cuadre General', async () => {
  const res = await api.get(endpoints.p1.cuadreGeneral.getAllCuadreGeneral);
  await validateCommonApiResponse(res, cuadreGeneralSchema);
  console.log(await res.json());
});