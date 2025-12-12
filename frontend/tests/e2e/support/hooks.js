const { Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');

setDefaultTimeout(60000);

Before(async function () {
  this.browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  this.context = await this.browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  this.page = await this.context.newPage();
  this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  this.apiUrl = process.env.API_URL || 'http://localhost:8080';
});

After(async function () {
  if (this.page) {
    await this.page.close();
  }
  if (this.context) {
    await this.context.close();
  }
  if (this.browser) {
    await this.browser.close();
  }
});

