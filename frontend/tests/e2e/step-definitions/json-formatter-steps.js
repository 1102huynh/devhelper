const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

When('I enter JSON {string}', async function (json) {
  await this.page.fill('textarea', json);
});

When('I click the format button', async function () {
  await this.page.click('button:has-text("Format")');
});

When('I click the validate button', async function () {
  await this.page.click('button:has-text("Validate")');
});

When('I click the minify button', async function () {
  await this.page.click('button:has-text("Minify")');
});

Then('I should see formatted JSON output', async function () {
  const output = await this.page.locator('textarea, pre, code').last().textContent();
  expect(output).toBeTruthy();
  expect(output.length).toBeGreaterThan(0);
});

Then('I should see a validation success message', async function () {
  await expect(this.page.locator('text=/valid|success/i')).toBeVisible({ timeout: 5000 });
});

Then('I should see a validation error message', async function () {
  await expect(this.page.locator('text=/invalid|error/i')).toBeVisible({ timeout: 5000 });
});

Then('I should see minified JSON', async function () {
  const output = await this.page.locator('textarea, pre, code').last().textContent();
  expect(output).toBeTruthy();
  // Minified JSON should not have extra whitespace
  expect(output).not.toMatch(/\n\s+/);
});

