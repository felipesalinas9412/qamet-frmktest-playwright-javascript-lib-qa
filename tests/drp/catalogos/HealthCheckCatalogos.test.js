const { test } = require('@playwright/test');
const { createAPIClient } = require('@api/client');
const { setTestData } = require('@utils/reportUtils');
const endpoints = require('@api/endpoints');
// Validaciones respuestas API
const { validateCommonApiResponse } = require('@utils/validateResponse');
// Schemas
const companiasSchema      = require('@schemas/drp/catalogos/companias.schema.json');
const tiposLineaSchema     = require('@schemas/drp/catalogos/tiposlinea.schema.json');
const productoresSchema    = require('@schemas/drp/catalogos/productores.schema.json');
const canalSchema          = require('@schemas/drp/catalogos/canal.schema.json');
const unidadSchema         = require('@schemas/drp/catalogos/unidad.schema.json');
const oficinaSchema        = require('@schemas/drp/catalogos/oficina.schema.json');
const lineaNegocioSchema   = require('@schemas/drp/catalogos/lineanegocio.schema.json');
const diasantelacionSchema = require('@schemas/drp/catalogos/diasantelacion.schema.json');
const drpstatusSchema      = require('@schemas/drp/catalogos/drpstatus.schema.json');
const etapaSchema          = require('@schemas/drp/catalogos/etapa.schema.json');
const fuenteSchema         = require('@schemas/drp/catalogos/fuente.schema.json');

let api;

test.beforeEach(async ({}, testInfo) => {
  // P1 no requiere auth según tu nota; si requiere, pon { auth: true }
  api = await createAPIClient({ auth: false });

  const mappings = {
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
  }
});

// -------------------- TESTS  --------------------

test('GET /DRP_Catalogos/GetCompanias - Validar respuesta Compañías', async () => {
  const res = await api.get(endpoints.p1.catalogos.getCompanias);
  await validateCommonApiResponse(res, companiasSchema);
});

test('GET /DRP_Catalogos/GetTiposLinea - Validar respuesta Tipos de Línea', async () => {
  const res = await api.get(endpoints.p1.catalogos.getTiposLinea);
  await validateCommonApiResponse(res, tiposLineaSchema);
});

test('GET /DRP_Catalogos/GetProductores - Validar respuesta Productores', async () => {
  const res = await api.get(endpoints.p1.catalogos.getProductores);
  await validateCommonApiResponse(res, productoresSchema);
});

test('GET /DRP_Catalogos/GetCanal - Validar respuesta Canal', async () => {
  const res = await api.get(endpoints.p1.catalogos.getCanal);
  await validateCommonApiResponse(res, canalSchema);
});

test('GET /DRP_Catalogos/GetUnidad - Validar respuesta Unidad', async () => {
  const res = await api.get(endpoints.p1.catalogos.getUnidad);
  await validateCommonApiResponse(res, unidadSchema);
});

test('GET /DRP_Catalogos/GetOficina - Validar respuesta Oficina', async () => {
  const res = await api.get(endpoints.p1.catalogos.getOficina);
  await validateCommonApiResponse(res, oficinaSchema);
});

test('GET /DRP_Catalogos/GetLineaDeNegocio - Validar respuesta Línea de Negocio', async () => {
  const res = await api.get(endpoints.p1.catalogos.getLineaDeNegocio);
  await validateCommonApiResponse(res, lineaNegocioSchema);
});

test('GET /DRP_Catalogos/GetDiasAntelacion - Validar respuesta Días Antelación', async () => {
  const res = await api.get(endpoints.p1.catalogos.getDiasAntelacion);
  await validateCommonApiResponse(res, diasantelacionSchema);
});

test('GET /DRP_Catalogos/GetDRPStatus - Validar respuesta DRP Status', async () => {
  const res = await api.get(endpoints.p1.catalogos.getDRPStatus);
  await validateCommonApiResponse(res, drpstatusSchema);
});

test('GET /DRP_Catalogos/GetEtapa - Validar respuesta Etapa', async () => {
  const res = await api.get(endpoints.p1.catalogos.getEtapa);
  await validateCommonApiResponse(res, etapaSchema);
});

test('GET /DRP_Catalogos/GetFuente - Validar respuesta Fuente', async () => {
  const res = await api.get(endpoints.p1.catalogos.getFuente);
  await validateCommonApiResponse(res, fuenteSchema);
});