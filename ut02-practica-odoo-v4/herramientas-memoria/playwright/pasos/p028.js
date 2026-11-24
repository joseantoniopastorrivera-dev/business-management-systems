const crear = require('./productos');
const F = 'Cervecería artesana';
const malta = (n, ref, kg, slug) => ({ n, ref, cat: 'All / Materias primas / Maltas', uom: 'kg', uompo: 'Saco de 25 kg', venta: 0, coste: kg, compra: 1, empresa: F, prov: ['Maltas del Duero, S.L.', (kg * 25).toFixed(2), 3], rutas: ['Comprar'], lote: 1, cad: [365, 300, 350, 330], slug });
module.exports = async (a) => {
  const S = [
    Object.assign(malta('Malta Pilsen', 'MP-MAL-PIL', 0.95, 'malta-pilsen'), { guardado: 1 }),
    malta('Malta Pale Ale', 'MP-MAL-PAL', 1.05, 'malta-pale-ale'),
    malta('Malta Caramelo', 'MP-MAL-CAR', 1.40, 'malta-caramelo'),
    malta('Malta de trigo', 'MP-MAL-TRI', 1.10, 'malta-de-trigo'),
    malta('Malta tostada (chocolate)', 'MP-MAL-TOS', 1.60, 'malta-tostada'),
  ];
  await crear(a, S, 'purchase.product_normal_action_puchased', '1');
  a.log(JSON.stringify(await a.call('product.template', 'search_read', [[['default_code', 'like', 'MP-']]], { fields: ['name', 'uom_id', 'uom_po_id', 'standard_price', 'tracking', 'use_expiration_date', 'expiration_time', 'company_id', 'seller_ids'] })));
};
