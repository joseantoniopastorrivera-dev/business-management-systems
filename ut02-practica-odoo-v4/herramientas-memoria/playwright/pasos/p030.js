const crear = require('./productos');
const F = 'Cervecería artesana';
const lup = (n, ref, p, slug) => ({ n, ref, cat: 'All / Materias primas / Lúpulos', uom: 'kg', venta: 0, coste: p, compra: 1, empresa: F, prov: ['Lúpulos de León, S. Coop.', p, 5], rutas: ['Comprar'], lote: 1, cad: [730, 60, 30, 90], slug });
const lev = (n, ref, sobre, slug) => ({ n, ref, cat: 'All / Materias primas / Levaduras', uom: 'kg', uompo: 'Sobre de 500 g', venta: 0, coste: sobre * 2, compra: 1, empresa: F, prov: ['Levaduras Ibéricas, S.L.', sobre, 4], rutas: ['Comprar'], lote: 1, cad: [540, 60, 30, 90], slug });
const barril = (n, ref, v, dias, slug) => ({ n, ref, cat: 'All / Cerveza en barril', venta: v, coste: 0, vende: 1, compra: 1, rutas: ['Fabricar'], lote: 1, cad: [dias, 30, 10, 20], slug });
module.exports = async (a) => {
  const S = [
    Object.assign(lup('Lúpulo Cascade (pellets)', 'MP-LUP-CAS', 26, 'lupulo-cascade'), { guardado: 1 }),
    lup('Lúpulo Saaz (pellets)', 'MP-LUP-SAA', 32, 'lupulo-saaz'),
    lup('Lúpulo Fuggle (pellets)', 'MP-LUP-FUG', 24, 'lupulo-fuggle'),
    Object.assign(lev('Levadura US-05 (ale americana)', 'MP-LEV-US05', 58, 'levadura-us-05'), { guardado: 1 }),
    lev('Levadura W-34/70 (lager)', 'MP-LEV-W3470', 75, 'levadura-w-34-70'),
    lev('Levadura WB-06 (trigo)', 'MP-LEV-WB06', 62, 'levadura-wb-06'),
    lev('Levadura S-04 (ale inglesa)', 'MP-LEV-S04', 55, 'levadura-s-04'),
    { n: 'Barril PET 30 L de un solo uso', ref: 'MP-ENV-PET30', cat: 'All / Materias primas / Envases', venta: 0, coste: 11.5, compra: 1, empresa: F, prov: ['Envases Técnicos del Henares, S.L.', 11.5, 2], rutas: ['Comprar'], slug: 'barril-pet-30-l', guardado: 1 },
    { n: 'Bagazo de cebada (pienso)', ref: 'SP-BAGAZO', cat: 'All / Subproductos', uom: 'kg', venta: 0.03, coste: 0, vende: 1, empresa: F, slug: 'bagazo', guardado: 1 },
    Object.assign(barril('Llamarada Moe IPA (barril 30 L)', 'PT-IPA-30', 135, 120, 'barril-llamarada-moe-ipa'), { guardado: 1 }),
    barril('Springfield Lager (barril 30 L)', 'PT-LAG-30', 105, 180, 'barril-springfield-lager'),
    barril('Springfield Stout (barril 30 L)', 'PT-STO-30', 125, 180, 'barril-springfield-stout'),
    barril('Trigo de Shelbyville (barril 30 L)', 'PT-TRI-30', 115, 120, 'barril-trigo-de-shelbyville'),
  ];
  await crear(a, S, 'purchase.product_normal_action_puchased', '1');
  a.log(JSON.stringify(await a.call('product.template', 'search_read', [[]], { fields: ['default_code', 'uom_po_id', 'standard_price', 'list_price', 'tracking', 'expiration_time', 'use_time', 'company_id', 'route_ids'] })));
};
