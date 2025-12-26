// tests/ProyectoDashBoardRenewalProcess/vistas/GetCuadroMando.test.js
const { test } = require('@playwright/test');
const { createAPIClient } = require('@api/client');
const { setTestData } = require('@utils/reportUtils');
const endpoints = require('@api/endpoints');
const { validateCommonApiResponse } = require('@utils/validateResponse');

// Schema
const cuadroMandoSchema = require('@schemas/drp/cuadromando.schema.json');

let api;

test.beforeEach(async ({}, testInfo) => {
  // API P1 (sin auth). Cambia a { auth: true } si tu API lo pide
  api = await createAPIClient({ api: 'p1', auth: false });

  if (testInfo.title.includes('Cuadro de Mando')) {
    await setTestData({
      suite: 'Vistas DRP',
      story: 'Consultar datos del cuadro de mando',
      severity: 'critical',
      owner: 'Mapfre España',
      description: 'Consulta exitosa del cuadro de mando',
    });
  }
});

test('GET /V_DRP_CUADRO_MANDO - Validar respuesta Cuadro de Mando', async () => {
  const res = await api.get(endpoints.p1.cuadroMando.getCuadroMando);
  await validateCommonApiResponse(res, cuadroMandoSchema);
  console.log(await res.json());
});