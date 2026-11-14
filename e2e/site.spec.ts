import { mkdir } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test.beforeAll(async () => {
  await mkdir('test-results/screenshots', { recursive: true });
});

test('home, learning path, and responsive field guide render', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1, name: /Learn the quantum side of learning/ })).toBeVisible();
  await expect(page.getByText('source headings')).toBeVisible();
  await page.screenshot({ path: 'test-results/screenshots/home-desktop.png', fullPage: true });

  await page.getByRole('link', { name: /Open the book/ }).click();
  await expect(page).toHaveURL(/learn\.html/);
  await expect(page.getByRole('heading', { level: 1, name: 'Quantum computing for machine learning' })).toBeVisible();
  await page.screenshot({ path: 'test-results/screenshots/book-desktop.png', fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1, name: /Learn the quantum side of learning/ })).toBeVisible();
  await page.screenshot({ path: 'test-results/screenshots/home-mobile.png', fullPage: true });
});

test('book labs respond to controls and state their simulation limits', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('learn.html');
  const theta = page.getByLabel('Polar angle');
  await theta.focus();
  await theta.press('ArrowRight');
  await expect(page.getByText('91°')).toBeVisible();

  await page.getByRole('button', { name: /Run 100 shots/ }).click();
  await expect(page.getByText(/Observed \d+ zeros and \d+ ones/)).toBeVisible();
  await page.getByRole('button', { name: /Run Bell-state shots/ }).click();
  await expect(page.locator('.bell-counts code')).toHaveCount(4);
  await expect(page.locator('.bell-counts code').nth(1)).toContainText('01');
  await expect(page.locator('.bell-counts code').nth(2)).toContainText('10');
  await page.getByRole('button', { name: 'Train one epoch' }).click();
  await expect(page.getByText(/Mean squared error/)).toBeVisible();
  await expect(page.getByText(/not a benchmark or evidence of advantage/)).toBeVisible();
  await page.screenshot({ path: 'test-results/screenshots/labs-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('heading', { name: 'Explore a qubit' })).toBeVisible();
  await page.screenshot({ path: 'test-results/screenshots/book-mobile.png', fullPage: true });
});

test('README topics and references open as in-site reading pages', async ({ page }) => {
  await page.goto('library.html');
  await expect(page.getByRole('heading', { level: 1, name: 'Explore quantum machine learning' })).toBeVisible();
  await expect(page.getByText('contents rows')).toBeVisible();
  await page.getByLabel('Search README chapters, topics, and references').fill('Quantum K-Means');
  const topic = page.getByRole('link', { name: /Quantum K-Means/ }).first();
  await expect(topic).toBeVisible();
  await topic.click();
  await expect(page).toHaveURL(/#topic\//);
  await expect(page.getByRole('heading', { level: 1, name: 'Quantum K-Means' })).toBeVisible();
  await expect(page.locator('.chapter-label')).toHaveText('README HEADING · UNREVIEWED');
  await expect(page.getByText('CURATED NOTE · SOURCE LINKS INCLUDED')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sources for this note' })).toBeVisible();
  await page.screenshot({ path: 'test-results/screenshots/topic-desktop.png', fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('library.html');
  await expect(page.getByRole('heading', { level: 1, name: 'Explore quantum machine learning' })).toBeVisible();
  await page.getByRole('button', { name: 'Open outline' }).click();
  await expect(page.getByRole('button', { name: 'Close outline' })).toBeVisible();
  await page.screenshot({ path: 'test-results/screenshots/library-mobile.png', fullPage: true });
});
