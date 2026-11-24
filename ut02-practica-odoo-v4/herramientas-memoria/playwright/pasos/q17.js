const L = require('./lib');
module.exports = async ({ page, log, BASE }) => {
  await page.goto(BASE + '/web?r=' + Date.now() + '#model=mrp.production&id=5&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_form_view'); await L.esperar(page, 1500);
  await page.locator('.o_form_statusbar button:visible', { hasText: 'Desmontar' }).first().click(); await page.waitForSelector('.modal'); await page.waitForTimeout(1200);
  log('F=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.modal .o_field_widget[name]')].map(e => e.getAttribute('name') + '=' + (e.querySelector('input') || {}).value))));
  log('BTN=' + await page.locator('.modal-footer').innerText());
  await page.screenshot({ path: __dirname + '/q17.png' });
  await page.locator('.modal-footer button', { hasText: 'Descartar' }).click().catch(() => page.keyboard.press('Escape'));
};
