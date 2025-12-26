const fs = require('fs/promises');
const fsx = require('fs');
const path = require('path');
const { test , expect } = require('@playwright/test');
const { createAPIClient } = require('@api/client');
const { setTestData } = require('@utils/reportUtils');
const endpoints = require('@api/endpoints');
//Validaciones respuesta (status 200 + JSON Schema)
const { validateCommonApiResponse } = require('@utils/validateResponse');
//Parámetros usados por los tests
const { healthParams } = require('@utils/testParams');
// Schemas
const groupRegistrationSchema         = require('@schemas/eligibility/group-registration/groupRegistration.schema.json');
const allGroupInfoSchema              = require('@schemas/eligibility/group-registration/allGroupInfo.schema.json');
const emloadReportSchema              = require('@schemas/eligibility/group-registration/emloadReport.schema.json');
const groupRegistrationsSchema        = require('@schemas/eligibility/group-registration/groupRegistrations.schema.json');
const groupRegistrationOnlyByIdSchema = require('@schemas/eligibility/group-registration/groupRegistrationOnlyById.schema.json');
const saveGroupRegistrationSchema     = require('@schemas/eligibility/group-registration/saveGroupRegistration.schema.json');
const postGroupRegistrationSchema     = require('@schemas/eligibility/group-registration/postGroupRegistrationSchema.schema.json');
const putGroupRegistrationSchema     = require('@schemas/eligibility/group-registration/putGroupRegistrationSchema.schema.json');

let api;
let params;

test.beforeAll(async () => {
  params = healthParams(); 
});

test.beforeEach(async ({}, testInfo) => {
  api = await createAPIClient({ api: 'p2', auth: false });

  if (testInfo.title.includes('HealthCheck-Group Registration')) {
    await setTestData({
      suite: 'Group Registration',
      story: 'Consultar validaciones de respuesta correcta',
      severity: 'normal',
      owner: 'Mapfre Health',
      description: 'Valida que el endpoint devuelve status === 200 y compara todo el body contra el JSON Schema.',
    });
  }
});

// 1) GET /GroupRegistration/GetAllGroupInfo-por rango de fecha
test('GET /HealthCheck-GroupRegistration/GetAllGroupInfo - Validar respuesta All Group Info', async () => {
  const endpoint = `${endpoints.p2.groupRegistration.getAllGroupInfoByDates}?fromDate=${params.fromDate}&thruDate=${params.thruDate}`;
  const response = await api.get(endpoint);
  await validateCommonApiResponse(response, allGroupInfoSchema);
  console.log('URL:', response.url(), '\nBody:', await response.json());
});


// 2) GET /GroupRegistration/GetGroupRegistration-por groupRegistrationId
test('GET /HealthCheck-GroupRegistration/GetGroupRegistration - Validar respuesta Group Registration', async () => {
  const endpoint = `${endpoints.p2.groupRegistration.getGroupRegistration}?groupRegistrationId=${params.groupRegistrationId}`;
  const response = await api.get(endpoint);
  await validateCommonApiResponse(response, groupRegistrationSchema);
  console.log('URL:', response.url(), '\nBody:', await response.json());
});

// 3) POST /SaveGroupRegistration
test('POST /HealthCheck-GroupRegistration/SaveGroupRegistration -  Validar respuesta SaveGroupRegistration', async () => {
  const updatedBy = params.updatedBy || 'jcolonc';
  const url = `${endpoints.p2.groupRegistration.postSaveGroupRegistration}?updatedBy=${encodeURIComponent(updatedBy)}`;

  const PostRaw = await fs.readFile('data/eligibility/group-registration/post-saveGroupRegistration.json', 'utf-8');
  const PostData = JSON.parse(PostRaw);

  const response = await api.post(url, {
    data: PostData,
    headers: { 'Content-Type': 'application/json' },
  });

  await validateCommonApiObjectResponse(response, saveGroupRegistrationSchema);
  console.log('URL:', response.url(), '\nBody:', await response.json());
});

// 4) GET /GroupRegistration/GetEMLOADReport
test('GET /HealthCheck-GroupRegistration/GetEMLOADReport - Validar respuesta EMLOAD Report', async () => {
  const endpoint = `${endpoints.p2.groupRegistration.getEMLOADReport}?groupRegistrationId=${params.groupRegistrationId}`;
  const response = await api.get(endpoint);
  await validateCommonApiResponse(response, emloadReportSchema);
  console.log('URL:', response.url(), '\nBody:', await response.json());
});

// 5) PUT /DisableGroupAsync
//pendiente agregar cuando tengamos permisos


// 6) GET /GroupRegistration
test('GET /HealthCheck-GroupRegistration - Validar respuesta lista de Group Registrations', async () => {
  const response = await api.get(endpoints.p2.groupRegistration.getGroupRegistrations);
  await validateCommonApiResponse(response, groupRegistrationsSchema);
  console.log('URL:', response.url(), '\nBody:', await response.json());
});

// 7) POST /GroupRegistration
test('POST /HealthCheck-GroupRegistration/GroupRegistration -  Validar respuesta Post GroupRegistration', async () => {
  
  const url = `${endpoints.p2.groupRegistration.postGroupRegistrations}`;

  const PostRaw1 = await fs.readFile('data/eligibility/group-registration/post-GroupRegistration.json', 'utf-8');
  const PostData1 = JSON.parse(PostRaw1);

  const response = await api.post(url, {
    data: PostData1,
    headers: { 'Content-Type': 'application/json' },
  });

  await validateCommonApiObjectResponse(response, postGroupRegistrationSchema);
  console.log('URL:', response.url(), '\nBody:', await response.json());
});

// 8) GET /GroupRegistrationID
test('GET /HealthCheck-GroupRegistration/ID - Validar respuesta Group Registration Only By Id', async () => {
  const endpoint = `${endpoints.p2.groupRegistration.getGroupRegistrationOnlyById}?groupRegistrationId=${params.groupRegistrationId}`;
  const response = await api.get(endpoint);
  await validateCommonApiResponse(response, groupRegistrationOnlyByIdSchema);
  console.log('URL:', response.url(), '\nBody:', await response.json());
});


// 9) PUT GroupRegistration/ID
test('PUT /HealthCheck-GroupRegistration/ID - Actualizar y validar persistencia', async () => {
  const id = Number(process.env.GROUP_REGISTRATION_ID || 6); 
  const putUrl = endpoints.p2.groupRegistration.putGroupRegistrationById(id);
  const raw = await fs.readFile('data/eligibility/group-registration/put-GroupRegistrationById.json', 'utf-8');
  const putBody = JSON.parse(raw);
  expect(putBody.GroupRegistrationId, 'El body no tiene el Id esperado').toBe(id);

  const putRes = await api.put(putUrl, {
    data: putBody,
    headers: { 'Content-Type': 'application/json' },
  });
  await validateCommonApiObjectResponse(putRes, putGroupRegistrationSchema);
  console.log('URL:', putRes.url(), '\nBody:', await putRes.json());
  

});


// 10) DELETE GroupRegistration/ID
//pendiente agregar cuando tengamos permisos

