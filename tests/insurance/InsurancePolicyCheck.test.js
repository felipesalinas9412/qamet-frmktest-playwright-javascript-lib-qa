const { test } = require('@playwright/test');
const { createAPIClient } = require('@api/client');
const { setTestData } = require('@utils/reportUtils');
const endpoints = require('@api/endpoints');
// Validaciones respuestas API
const { validateCommonApiResponse } = require('@utils/validateResponse');
// Schemas
const companiasSchema = require('@schemas/drp/catalogos/companias.schema.json');

let api;

test.beforeEach(async ({}, testInfo) => {
  // P1 no requiere auth según tu nota; si requiere, pon { auth: true }
  api = await createAPIClient({api: 'p3', auth: true });

  /*const mappings = {
    'Compañías': 'Consultar compañías',
    'Tipos de Línea': 'Consultar tipos de línea',
    'Productores': 'Consultar productores',
    'Canal': 'Consultar canal',
    'Unidad': 'Consultar unidad',
    'Oficina': 'Consultar oficina',
    'Línea de Negocio': 'Consultar línea de negocio',
    'Dias de Antelación' : 'Consultar días de antelación',
    'DRP Status' : 'Consultar el status DRP',
    'Etapa' : 'Consultar etapa',
    'Fuente' : 'Consultar fuente'
  };

  for (const key in mappings) {
    if (testInfo.title.includes(key)) {
      await setTestData({
        suite: 'DRP_Catalogos',
        story: mappings[key],
        severity: 'critical',
        owner: 'Mapfre España',
        description: `Consulta exitosa de ${key}`,
      });
    }
  }*/
});

// -------------------- TESTS  --------------------

test('GET  insurance-policies-photos - Validar respuesta OK', async () => {
  const res = await api.get(endpoints.p3.insurancePoliciesPhotos.getInsurancePolicy);
  await validateCommonApiResponse(res, companiasSchema);
});