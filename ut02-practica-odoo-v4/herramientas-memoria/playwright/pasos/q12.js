module.exports = async ({ page, log }) => {
  await page.locator('.o_field_widget[name=move_ids_without_package] .o_data_row').first().locator('button[name="Open Move"]').click();
  await page.waitForSelector('.modal'); await page.waitForTimeout(1500);
  log('MCOLS=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.modal thead th')].map(e => (e.getAttribute('data-name') || '') + ':' + e.innerText))));
  log('ROWS=' + await page.locator('.modal .o_data_row').count());
  log('BTN=' + await page.locator('.modal-footer').innerText());
  await page.screenshot({ path: __dirname + '/q12.png' });
};
