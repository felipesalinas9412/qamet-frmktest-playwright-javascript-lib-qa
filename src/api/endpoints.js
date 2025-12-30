// src/api/endpoints.js
require('dotenv').config();

// FALLBACKS seguros si faltan en .env
const P1 = process.env.BASE_URLP1 || 'https://preprod.mapfrepr.com/MPRPACIssuanceIntegrationAPI/api/v1';
const P2 = process.env.BASE_URLP2 || 'https://preprod.mapfrehealth.com/HealthElegibilityRestServices/api/v1';
const P3 = process.env.BASE_URLP3 || 'https://api-str.pre.reef.health.es.mapfre.com/workshop/v1/';

module.exports = {
  p1: {
    baseURL: P1,
    catalogos: {
      getCompanias: 'DRP_Catalogos/GetCompanias',
      getTiposLinea: 'DRP_Catalogos/GetTiposLinea',
      getProductores: 'DRP_Catalogos/GetProductores',
      getCanal: 'DRP_Catalogos/GetCanal',
      getUnidad: 'DRP_Catalogos/GetUnidad',
      getOficina: 'DRP_Catalogos/GetOficina',
      getLineaDeNegocio: 'DRP_Catalogos/GetLineaDeNegocio',
      getDiasAntelacion: 'DRP_Catalogos/DiasAntelacion',
      getDRPStatus: 'DRP_Catalogos/GetDRPStatus',
      getEtapa: 'DRP_Catalogos/GetEtapa',
      getFuente: 'DRP_Catalogos/GetFuente'
    },
    cuadroMando: { getCuadroMando: 'V_DRP_CUADRO_MANDO' },
    cuadreGeneral: { getAllCuadreGeneral: 'DRP_CuadreGeneral/GetAllCuadreGeneral' },
    lobClasif: { getLobClasif: 'DRP_LOB_CLASIF' },
    prerenovDetail: { getPrerenovDetail: 'DRP_PRERENOV_DETAIL' },
    prerenovHeader: { getPrerenovHeader: 'DRP_PRERENOV_HEADER' },
  },

  p2: {
    baseURL: P2,
    groupRegistration: {
      getGroupRegistration: 'GroupRegistration/GetGroupRegistration',
      getAllGroupInfoByDates: 'GroupRegistration/GetAllGroupInfo',
      getEMLOADReport: 'GroupRegistration/GetEMLOADReport',
      getGroupRegistrations: 'GroupRegistration',
      getGroupRegistrationOnlyById: 'GroupRegistration', 
      postSaveGroupRegistration: 'GroupRegistration/SaveGroupRegistration',
      postGroupRegistrations: 'GroupRegistration',
      putDisableGroup: 'GroupRegistration/DisableGroupAsync',
       putGroupRegistrationById:     (id) => `GroupRegistration/${id}`,
       deleteGroupRegistrationById:  (id) => `GroupRegistration/${id}`,
    },
  },
  p3: {
    baseURL: P3,
    insurancePoliciesPhotos: {
      getInsurancePolicy: 'insurance_policies-photos/search?thirdPartyInternalId=330749452011&pageNumber=1&pageSize=10',
      getWithDateInsurancePolicy: 'insurance_policies-photos/search?thirdPartyInternalId=330749452011&date=2025-12-31T00:00:00.000Z&pageNumber=1&pageSize=10',
      koInsurancePolicy: 'insurance_policies-photos/search?policyNumber=prueba&thirdPartyInternalId=330749452011&pageNumber=1&pageSize=10',
      notFoundInsurancePolicy: 'insurance_policies-photos/search?thirdPartyInternalId=3307494520110&pageNumber=1&pageSize=10'
    }
  }
};
