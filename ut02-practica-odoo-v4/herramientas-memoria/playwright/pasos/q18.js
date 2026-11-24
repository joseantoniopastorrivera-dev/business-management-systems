const L = require('./lib');
module.exports = async ({ page, log, call, BASE }) => {
  await L.abrir(page, BASE, 'stock_account.stock_valuation_layer_action', '1');
  log('CP=' + await page.locator('.o_control_panel').innerText());
  log('BTNS=' + JSON.stringify(await page.locator('.o_list_view button, .o_control_panel button').allInnerTexts()));
  const a = await call('ir.actions.act_window', 'search_read', [[['res_model', '=', 'stock.valuation.layer.revaluation']]], { fields: ['name', 'xml_id'] }); log(JSON.stringify(a));
  log(JSON.stringify(await call('mrp.unbuild', 'search_read', [[]], { fields: ['name', 'state'] })));
  await page.screenshot({ path: __dirname + '/q18.png' });
};
