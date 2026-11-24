const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  await page.goto(BASE + '/web?debug=1#action=base.action_res_users&model=res.users&id=2&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_form_view .o_notebook'); await L.esperar(page, 2500);
  await shot('usuario-administrador-modo-desarrollador');
  const tab = page.locator('.o_notebook .tab-pane.active');
  log((await tab.innerText()).slice(0, 3000));
};
