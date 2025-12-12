const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

When('I click the generate button', async function () {
  await this.page.click('button:has-text("Generate")');
});

When('I select to generate {int} UUIDs', async function (count) {
  await this.page.selectOption('select', count.toString());
});

Then('I should see {int} UUID', async function (count) {
  await this.page.waitForTimeout(500);
  const output = await this.page.locator('textarea, pre, code, .uuid-output').last().textContent();
  const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
  const matches = output.match(uuidPattern);
  expect(matches).toBeTruthy();
  expect(matches.length).toBe(count);
});

Then('I should see generated UUIDs', async function () {
  await this.page.waitForTimeout(500);
  const output = await this.page.locator('textarea, pre, code, .uuid-output').last().textContent();
  const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  expect(output).toMatch(uuidPattern);
});

