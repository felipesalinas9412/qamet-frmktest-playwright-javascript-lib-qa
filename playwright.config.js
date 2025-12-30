// playwright.config.js
const { defineConfig } = require('@playwright/test');
require('dotenv').config();

const P1 = process.env.BASE_URLP1 || 'https://preprod.mapfrepr.com/MPRPACIssuanceIntegrationAPI/api/v1';
const P2 = process.env.BASE_URLP2 || 'https://preprod.mapfrehealth.com/HealthElegibilityRestServices/api/v1';
const P3 = process.env.BASE_URLP3 || 'https://api-str.pre.reef.health.es.mapfre.com/workshop/v1/';

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ],
  use: {
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: { Accept: 'application/json', 'Content-Type': 'application/json' },
  },
  projects: [
    { name: 'p1', testMatch: /tests\/drp\/.*\.test\.js/, use: { baseURL: P1 } },
    { name: 'p2', testMatch: /tests\/eligibility\/.*\.test\.js/, use: { baseURL: P2 } },
    { name: 'p3', testMatch: /tests\/storage\/.*\.test\.js/, use: { baseURL: P3 } },
  ],
  globalSetup: require.resolve('./register-aliases.js'),
});
