// Cap. 6 · Antes de abrir la tienda: logo de la cervecería en la web, imagen de cada barril publicado y archivado del
// duplicado del Barril de Navidad (id 38, sin LdM) que dejó un intento fallido del paso p34.
const fs = require('fs'), path = require('path');
module.exports = async ({ call, log }) => {
  const C = { context: { allowed_company_ids: [1] } };
  const raiz = path.resolve(__dirname, '..', '..', '..');
  const b64 = (f) => fs.readFileSync(f).toString('base64');
  await call('website', 'write', [[1], { logo: b64(path.join(raiz, 'logo-cerveceria-springfield.png')) }], C);
  for (const cod of ['PT-IPA-30', 'PT-LAG-30', 'PT-TRI-30', 'PT-NAV-30']) {
    const ids = await call('product.template', 'search', [[['default_code', '=', cod], ['id', '!=', 38]]], C);
    await call('product.template', 'write', [ids, { image_1920: b64(path.join(raiz, 'herramientas-memoria', 'imagenes-productos', cod + '.png')) }], C);
  }
  const ventas = await call('sale.order.line', 'search_count', [[['product_id.product_tmpl_id', '=', 38]]], C);
  log('ventas del duplicado', ventas);
  if (!ventas) await call('product.template', 'write', [[38], { active: false, is_published: false, default_code: 'PT-NAV-30-DUP' }], C);
  log(JSON.stringify(await call('product.template', 'search_read', [[['name', 'ilike', 'Navidad 2026']]], { fields: ['id', 'default_code', 'active'], ...C })));
};
