
const { test } = require('@playwright/test');

/**
 * Aplica metadatos (labels/annotations) entendidos por allure-playwright.
 * Llamar SIEMPRE dentro de un test / hook (beforeEach/afterEach).
 */
async function setTestData({ suite, story, severity, owner, description = '' }) {
  await test.step('Set metadata', async () => {
    const info = test.info();

    if (suite)       info.annotations.push({ type: 'suite',        description: suite });
    if (story)       info.annotations.push({ type: 'story',        description: story });
    if (severity)    info.annotations.push({ type: 'severity',     description: severity });
    if (owner)       info.annotations.push({ type: 'owner',        description: owner });
    if (description) info.annotations.push({ type: 'description',  description });
  });
}

/**
 * Adjunta datos al reporte (procesados por allure-playwright).
 * Llamar SIEMPRE dentro de un test / hook.
 */
async function attachLogs(logName, logData, contentType = 'application/json') {
  await test.step(`Adjuntar: ${logName}`, async () => {
    const body =
      contentType === 'application/json'
        ? JSON.stringify(logData, null, 2)
        : (typeof logData === 'string' ? logData : String(logData));

    await test.info().attach(logName, {
      contentType,
      body
    });
  });
}

module.exports = { setTestData, attachLogs };
