// Cap. 5 · Ajustes del TPV «Barra de la taberna»: precios con impuestos incluidos (el cliente de un bar ve el PVP).
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  await L.abrir(page, BASE, 'point_of_sale.action_pos_configuration', '2');
  const s = await L.ajuste(page, 'Precios del producto');
  log('opciones', (await s.locator('label').allInnerTexts()).join('|'));
  const inc = s.locator('label', { hasText: /incluid/i }).first();
  const radio = page.locator('#' + (await inc.getAttribute('for')));
  await shot('tpv-14-ajuste-precios-con-iva', { zona: s, foco: inc, borrador: 'Precios con impuestos incluidos (ya venía así)' });
  if (!(await radio.isChecked())) { await radio.check({ force: true }); await L.esperar(page, 300); await shot('tpv-14-ajuste-precios-con-iva', { zona: s, foco: inc, borrador: 'Precios con impuestos incluidos' }); await L.guardarAjustes(page); }
  const mp = await L.ajuste(page, 'Métodos de pago');
  await shot('tpv-15-metodos-de-pago', { zona: mp, borrador: 'Métodos de pago de la barra' });
  log(JSON.stringify(await call('pos.config', 'search_read', [[['id', '=', 2]]], { fields: ['iface_tax_included', 'payment_method_ids'], context: { allowed_company_ids: [2] } })));
};
