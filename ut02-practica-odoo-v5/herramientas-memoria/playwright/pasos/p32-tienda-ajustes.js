// Cap. 6 · Ajustes del sitio web: nombre de la tienda, precios con IVA incluido (venta a particulares) y costes de envío
// (el módulo delivery ya viene con website_sale). La compra sin registrarse se deja como está: el cliente puede comprar como invitado.
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  await L.abrir(page, BASE, 'website.action_website_configuration', '1', '.o_setting_container');
  await L.campo(page, 'website_name', 'Tienda online de la Cervecería Springfield');
  const nombre = await L.ajuste(page, 'Nombre del sitio web');
  await shot('tienda-03-nombre-del-sitio', { zona: nombre, foco: [L.widget(page, 'website_name')], borrador: 'Nombre del sitio web' });
  // Precios con IVA incluido: el cliente final (particular) ve lo que paga.
  const precios = await L.ajuste(page, 'Mostrar precios de productos');
  const radio = precios.locator('input[type=radio]').nth(1);
  const etiquetas = await precios.locator('label').allInnerTexts(); log('precios', etiquetas.join('|'));
  await precios.locator('label', { hasText: 'Impuestos incluidos' }).first().click(); await L.esperar(page, 300);
  await shot('tienda-04-precios-con-iva', { zona: precios, borrador: 'Precios con IVA incluido' });
  // En Odoo 17 la tienda ya depende del módulo delivery: «Costes de envío» no tiene casilla, solo el enlace a los métodos.
  const envio = page.locator('.o_setting_box', { hasText: 'Calcule los gastos de envío en pedidos' }).first();
  await envio.scrollIntoViewIfNeeded();
  await shot('tienda-05-costes-de-envio', { zona: envio, foco: [envio.locator('button', { hasText: 'Métodos de envío' })], borrador: 'Costes de envío' });
  await L.guardarAjustes(page);
  log('delivery', await L.ok(call, 'delivery'));
  log(JSON.stringify(await call('website', 'search_read', [[]], { fields: ['name', 'show_line_subtotals_tax_selection'] })));
};
