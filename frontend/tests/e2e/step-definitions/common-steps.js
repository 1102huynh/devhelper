const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Given('I am on the home page', async function () {
  await this.page.goto(this.baseUrl);
  await this.page.waitForLoadState('networkidle');
});

Given('I am on the {string} page', async function (pageName) {
  const pageMap = {
    'JSON Formatter': '/json-formatter',
    'UUID Generator': '/uuid-generator',
    'Notes': '/notes',
    'Regex Tester': '/regex-tester',
    'Diff Checker': '/diff-checker',
    'Base64 Encoder': '/base64',
    'Hash Generator': '/hash-generator',
    'Timestamp Converter': '/timestamp',
    'URL Encoder': '/url-encoder',
    'Color Converter': '/color-converter',
    'QR Generator': '/qr-generator',
    'Lorem Ipsum': '/lorem-ipsum',
    'JWT Decoder': '/jwt-decoder',
    'Cron Parser': '/cron-parser',
    'Test Data Generator': '/test-data-generator',
    'API Tester': '/api-tester',
    'SSH Commands': '/ssh-commands',
    'HTTP Status': '/http-status'
  };

  const path = pageMap[pageName];
  if (!path) {
    throw new Error(`Unknown page: ${pageName}`);
  }

  await this.page.goto(this.baseUrl + path);
  await this.page.waitForLoadState('networkidle');
});

When('I click on {string}', async function (text) {
  await this.page.click(`text=${text}`);
});

When('I click the {string} button', async function (buttonText) {
  await this.page.click(`button:has-text("${buttonText}")`);
});

When('I enter {string} in the {string} field', async function (value, fieldName) {
  const field = this.page.locator(`textarea, input`).filter({ hasText: fieldName }).first();
  await field.fill(value);
});

When('I fill the input with {string}', async function (value) {
  await this.page.fill('textarea, input[type="text"]', value);
});

When('I fill the textarea with {string}', async function (value) {
  await this.page.fill('textarea', value);
});

Then('I should see {string}', async function (text) {
  await expect(this.page.locator(`text=${text}`)).toBeVisible({ timeout: 10000 });
});

Then('I should see the text {string}', async function (text) {
  const content = await this.page.textContent('body');
  expect(content).toContain(text);
});

Then('the page title should be {string}', async function (title) {
  await expect(this.page).toHaveTitle(new RegExp(title, 'i'));
});

Then('I should be on the {string} page', async function (pageName) {
  const url = this.page.url();
  expect(url).toContain(pageName.toLowerCase().replace(/\s+/g, '-'));
});

Then('the URL should contain {string}', async function (urlPart) {
  const url = this.page.url();
  expect(url).toContain(urlPart);
});

