const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

When('I click the create note button', async function () {
  await this.page.click('button:has-text("New Note"), button:has-text("Add Note"), button:has-text("Create")');
});

When('I enter note title {string}', async function (title) {
  await this.page.fill('input[placeholder*="title" i], input[name="title"]', title);
});

When('I enter note content {string}', async function (content) {
  await this.page.fill('textarea[placeholder*="content" i], textarea[name="content"]', content);
});

When('I save the note', async function () {
  await this.page.click('button:has-text("Save"), button:has-text("Create")');
  await this.page.waitForTimeout(1000); // Wait for save operation
});

When('I click the pin button for the note', async function () {
  await this.page.click('[data-testid="pin-button"], button:has-text("Pin")').first();
});

When('I click the delete button for the note', async function () {
  await this.page.click('[data-testid="delete-button"], button:has-text("Delete")').first();
});

Then('I should see the note {string}', async function (title) {
  await expect(this.page.locator(`text="${title}"`)).toBeVisible({ timeout: 5000 });
});

Then('the note should be pinned', async function () {
  await expect(this.page.locator('[data-pinned="true"], .pinned')).toBeVisible({ timeout: 5000 });
});

Then('the note should be deleted', async function () {
  // Wait for the note to disappear
  await this.page.waitForTimeout(1000);
  const noteCount = await this.page.locator('[data-testid="note-item"], .note-item').count();
  // After deletion, there should be fewer notes or none
  expect(noteCount).toBeLessThanOrEqual(0);
});

