// Cap. 5 · Solución de la I-07: las secuencias del TPV siguen con el nombre «Tienda». Modo desarrollador →
// Ajustes → Técnico → Secuencias: prefijo «BARRA/» y nombre nuevo en las dos (pedido y línea de pedido).
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const C = { context: { allowed_company_ids: [2] } };
  for (const [i, id] of [50, 51].entries()) {
    const [s] = await call('ir.sequence', 'search_read', [[['id', '=', id]]], { fields: ['prefix', 'name'], ...C });
    if (s.prefix === 'BARRA/') continue;
    await page.goto(BASE + '/web?debug=1&r=' + Date.now() + '#model=ir.sequence&id=' + id + '&view_type=form&cids=2', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.o_form_view'); await L.esperar(page);
    if (i === 0) await shot('tpv-29-secuencia-tienda', { zona: '.o_form_sheet', foco: '.o_field_widget[name=prefix]', borrador: 'Secuencia con prefijo Tienda/' });
    await L.campo(page, 'name', s.name.replace('Tienda', 'Barra de la taberna'));
    await L.campo(page, 'prefix', 'BARRA/');
    await L.guardar(page);
    if (i === 0) await shot('tpv-30-secuencia-barra', { zona: '.o_form_sheet', foco: '.o_field_widget[name=prefix]', borrador: 'Prefijo BARRA/' });
  }
  log(JSON.stringify(await call('ir.sequence', 'search_read', [[['id', 'in', [50, 51]]]], { fields: ['name', 'prefix', 'number_next_actual'], ...C })));
  await page.goto(BASE + '/web?debug=0', { waitUntil: 'domcontentloaded' });
};
