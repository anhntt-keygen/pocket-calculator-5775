const { test, expect } = require('@playwright/test');

test.describe('Pocket Calculator Test Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    // Load app index file path safely
    await page.goto('file://' + require('path').resolve(__dirname, '../index.html'));
  });

  test('[SC-01] Basic Calculations (Addition, Subtraction, Multiplication, Division)', async ({ page }) => {
    // Perform standard equation: 12 + 25 = 37
    await page.click('button[data-val="1"]');
    await page.click('button[data-val="2"]');
    await page.click('button[data-val="+"]');
    await page.click('button[data-val="2"]');
    await page.click('button[data-val="5"]');
    await page.click('button[data-key="equals"]');
    
    // Verify Display Result
    await expect(page.locator('#display-current')).toHaveText('37');

    // Multiply by 3 = 111
    await page.click('button[data-val="*"]');
    await page.click('button[data-val="3"]');
    await page.click('button[data-key="equals"]');
    await expect(page.locator('#display-current')).toHaveText('111');
  });

  test('[SC-02] Division by Zero handling', async ({ page }) => {
    // 9 / 0 = Error: Division by zero
    await page.click('button[data-val="9"]');
    await page.click('button[data-val="/"]');
    await page.click('button[data-val="0"]');
    await page.click('button[data-key="equals"]');
    
    await expect(page.locator('#display-current')).toHaveText('Error: Division by zero');
  });

  test('[SC-02] Single decimal point restriction', async ({ page }) => {
    // Attempting to type "1..5" should resolve safely as "1.5"
    await page.click('button[data-val="1"]');
    await page.click('button[data-key="decimal"]');
    await page.click('button[data-key="decimal"]');
    await page.click('button[data-val="5"]');
    
    await expect(page.locator('#display-current')).toHaveText('1,5');
  });

  test('[SC-03] Memory / History storage retrieval', async ({ page }) => {
    // Execute: 5 * 6 = 30
    await page.click('button[data-val="5"]');
    await page.click('button[data-val="*"]');
    await page.click('button[data-val="6"]');
    await page.click('button[data-key="equals"]');
    
    // Open History sidebar
    await page.click('#btn-toggle-history');
    await expect(page.locator('#history-panel')).not.toHaveClass(/translate-x-full/);
    
    // Verify stored calculation item in history box
    const historyItem = page.locator('#history-list >> text== 30');
    await expect(historyItem).toBeVisible();

    // Clear Screen, click historical item to restore value
    await page.click('#btn-close-history');
    await page.click('button[data-key="clear"]');
    await expect(page.locator('#display-current')).toHaveText('0');

    await page.click('#btn-toggle-history');
    await historyItem.click(); // Restores "30" on click
    await expect(page.locator('#display-current')).toHaveText('30');
  });

  test('[SC-04] Hardware Keyboard Input Integration', async ({ page }) => {
    // Focus page and fire keyboard events for formula: 7 - 4 = 3
    await page.keyboard.press('7');
    await page.keyboard.press('-');
    await page.keyboard.press('4');
    await page.keyboard.press('Enter');

    await expect(page.locator('#display-current')).toHaveText('3');
  });
});