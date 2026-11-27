// Cap. 4 · Ubicación «Cuarentena» (fuera de FAB/Stock, así no se reserva para ventas) y marcada como ubicación de devolución.
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  let [u] = await call('stock.location', 'search_read', [[['name', '=', 'Cuarentena'], ['company_id', '=', 1]]], { fields: ['id', 'complete_name'] });
  if (!u) {
    await L.abrir(page, BASE, 'stock.action_location_form', '1');
    await L.nuevo(page);
    await L.campo(page, 'name', 'Cuarentena');
    await L.m2o(page, 'location_id', 'FAB', null, 'FAB');
    await L.check(page, 'return_location', true);
    await L.campo(page, 'comment', 'Barriles bloqueados por una incidencia de calidad o una retirada de lote. Está fuera de FAB/Stock: lo que hay aquí no se reserva para ninguna entrega.').catch(() => {});
    await L.guardar(page);
  } else {
    await page.goto(BASE + '/web?r=' + Date.now() + '#model=stock.location&id=' + u.id + '&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.o_form_view'); await L.esperar(page);
  }
  await shot('retirada-03-ubicacion-cuarentena', { zona: '.o_form_sheet', foco: ['.o_field_widget[name=location_id]', '.o_field_widget[name=return_location]'], borrador: 'Ubicación FAB/Cuarentena, de devolución, fuera de Stock' });
  log(JSON.stringify(await call('stock.location', 'search_read', [[['name', '=', 'Cuarentena']]], { fields: ['complete_name', 'usage', 'return_location', 'company_id'] })));
};
