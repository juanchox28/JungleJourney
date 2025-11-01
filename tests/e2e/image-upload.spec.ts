import { test, expect } from '@playwright/test';

test('should allow an admin to upload an image to a tour', async ({ page }) => {
  await page.goto('/admin');

  // Login
  await page.getByLabel('Password').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();

  // Wait for the page to load and tours to be visible
  await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
  await expect(page.getByText('Rainforest Expedition')).toBeVisible();

  // Open the tour editing dialog
  await page.locator('tr:has-text("Rainforest Expedition")').getByRole('button').first().click();

  // Wait for dialog to appear
  await expect(page.getByRole('heading', { name: 'Edit Tour' })).toBeVisible();

  // Upload an image
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.locator('div.border-dashed').click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles('client/public/assets/generated_images/amazon_river_sunset_hero_2bf325a5.png');

  // Wait for the upload to complete and the image to be visible
  await expect(page.getByAltText(/Upload \d+/)).toBeVisible({ timeout: 15000 });
});
