// Cap. 5 · Incidencia de redondeo: 4,55 € + 10 % = 5,005 → 5,01 € en el TPV. PVP redondo: 4,50 + 10 % = 4,95 €.
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const C = { context: { allowed_company_ids: [2] } };
  const [p] = await call('product.template', 'search_read', [[['default_code', '=', 'BAR-PIN-LAG']]], { fields: ['id', 'list_price'], ...C });
  await page.goto(BASE + '/web?r=' + Date.now() + '#model=product.template&id=' + p.id + '&view_type=form&cids=2', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_form_view'); await L.esperar(page);
  if (p.list_price !== 4.5) {
    await shot('tpv-16-incidencia-redondeo-lager', { zona: L.widget(page, 'list_price').locator('xpath=ancestor::div[contains(@class,"o_wrap_field") or contains(@class,"o_row")][1]/..'), foco: L.widget(page, 'list_price'), borrador: '4,55 → 5,01 € con IVA' });
    await L.campo(page, 'list_price', '4,50'); await L.esperar(page, 300);
    await L.guardar(page);
  }
  await shot('tpv-17-precio-lager-corregido', { zona: L.widget(page, 'list_price').locator('xpath=ancestor::div[contains(@class,"o_wrap_field") or contains(@class,"o_row")][1]/..'), foco: L.widget(page, 'list_price'), borrador: '4,50 → 4,95 €' });
  log(JSON.stringify(await call('product.template', 'search_read', [[['id', '=', p.id]]], { fields: ['list_price'], ...C })));
};
