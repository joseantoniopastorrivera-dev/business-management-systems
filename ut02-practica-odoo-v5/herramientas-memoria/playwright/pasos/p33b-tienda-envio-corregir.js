// Cap. 6 · Completar la furgoneta refrigerada: 12 € (el campo monetario se había quedado en 1,00 al escribir «12,00»),
// gratis desde 300 €, solo para la fábrica, solo España → provincia de Madrid, y publicada en la tienda.
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const C = { context: { allowed_company_ids: [1] } };
  const [f] = await call('delivery.carrier', 'search_read', [[['name', 'ilike', 'Furgoneta refrigerada']]], { fields: ['id'], ...C });
  await L.ir(page, BASE, `model=delivery.carrier&id=${f.id}&view_type=form&cids=1`);
  const precio = L.widget(page, 'fixed_price').locator('input').first();
  await precio.click(); await precio.press('Control+a'); await precio.pressSequentially('12', { delay: 40 }); await precio.press('Tab'); await L.esperar(page, 300);
  await L.check(page, 'free_over', true);
  const lim = L.widget(page, 'amount').locator('input').first();
  await lim.click(); await lim.press('Control+a'); await lim.pressSequentially('300', { delay: 40 }); await lim.press('Tab'); await L.esperar(page, 300);
  await L.m2o(page, 'company_id', 'Cervecería artesana');
  const pais = L.widget(page, 'country_ids').locator('input').first();
  await pais.click(); await pais.pressSequentially('España', { delay: 30 }); await page.locator('.o-autocomplete--dropdown-item', { hasText: 'España' }).first().click(); await L.esperar(page, 400);
  const prov = L.widget(page, 'state_ids').locator('input').first();
  await prov.click(); await prov.pressSequentially('Madrid', { delay: 30 }); await page.locator('.o-autocomplete--dropdown-item', { hasText: 'Madrid' }).first().click(); await L.esperar(page, 400);
  await L.guardar(page);
  const pub = page.locator('.o_form_view button', { hasText: /No publicado/ }).first();
  if (await pub.count()) { await pub.click(); await L.esperar(page, 800); }
  await shot('tienda-08-envio-furgoneta', { zona: ['.o_form_sheet', '.o_control_panel'], foco: [L.widget(page, 'fixed_price'), L.widget(page, 'state_ids')], borrador: 'Furgoneta refrigerada 12 €, gratis desde 300 €, solo Madrid' });
  log(JSON.stringify(await call('delivery.carrier', 'search_read', [[]], { fields: ['name', 'fixed_price', 'free_over', 'amount', 'country_ids', 'state_ids', 'is_published', 'company_id'], ...C })));
};
