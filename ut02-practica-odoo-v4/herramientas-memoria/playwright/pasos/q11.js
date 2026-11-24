const L = require('./lib');
module.exports = async ({ page, log, BASE }) => {
  await page.goto(BASE + '/web?r=' + Date.now() + '#model=stock.picking&id=1&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_form_view'); await L.esperar(page, 2000);
  log('COLS=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.o_field_widget[name=move_ids_without_package] thead th')].map(e => (e.getAttribute('data-name') || '') + ':' + e.innerText))));
  log('ROW1=' + (await page.locator('.o_field_widget[name=move_ids_without_package] .o_data_row').first().innerHTML()).slice(0, 2500));
  await page.screenshot({ path: __dirname + '/q11.png' });
};
