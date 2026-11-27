// Cap. 6 · Datos de contacto reales en la cabecera y el pie de la web (sustituyen a los de ejemplo de Odoo).
// Primer intento: escribir con website_id = 1 para que Odoo creara una copia solo para esta web (copy-on-write).
// La copia se creó, pero la tienda seguía pintando la plantilla genérica, así que (hay una sola web) se modifica la
// plantilla genérica en los dos idiomas y se borran las copias. Se escribe el campo «arch» y no «arch_db»: «arch»
// marca la vista como modificada (arch_updated) y Odoo deja de leerla del fichero XML del módulo, que es lo que
// hace este servidor (modo desarrollador «xml»).
const CAMBIOS = [
  ['+1 555-555-5556', '+34 918 000 742'],
  ['tel:+1 555-555-5556', 'tel:+34918000742'],
  ['mailto:info@yourcompany.example.com', 'mailto:pedidos@cerveceriaspringfield.es'],
  ['info@sucompañía.example.com', 'pedidos@cerveceriaspringfield.es'],
  ['Somos un equipo de personas apasionadas cuyo objetivo es mejorar la vida de todos a través de productos disruptivos. Construimos grandes productos para resolver sus problemas de negocio.',
   'Cervecería artesana de Alcalá de Henares. Elaboramos en pequeños lotes IPA, Lager, cerveza de trigo y, en diciembre, nuestro Barril de Navidad.'],
  ['Nuestros productos están diseñados para pequeñas y medianas empresas dispuestas a optimizar su rendimiento.',
   'Barriles de 30 L para bares y particulares: recogida gratis en la fábrica o furgoneta refrigerada en la Comunidad de Madrid.'],
  ['Devoluciones y envío estándar gratis', 'Envío refrigerado gratis desde 300 € en la Comunidad de Madrid'],
];
module.exports = async ({ call, log }) => {
  // Se parte SIEMPRE de la vista genérica leída en español y se escribe la copia de la web en los dos idiomas
  // (es_ES y en_US): si solo se escribe en español, el texto original queda en inglés y la web lo muestra al perder
  // la traducción (pasó en la primera versión de este paso: el pie salió en inglés).
  for (const key of ['website.footer_custom', 'website.header_text_element']) {
    const cows = await call('ir.ui.view', 'search', [[['key', '=', key], ['website_id', '!=', false]]]);
    if (cows.length) log('borro copias', key, cows, await call('ir.ui.view', 'unlink', [cows]));
    const [g] = await call('ir.ui.view', 'search_read', [[['key', '=', key], ['website_id', '=', false]]], { fields: ['id', 'arch_db'], context: { lang: 'es_ES' } });
    let a = g.arch_db; for (const [x, y] of CAMBIOS) a = a.split(x).join(y);
    for (const lang of ['en_US', 'es_ES']) log(key, lang, JSON.stringify(await call('ir.ui.view', 'write', [[g.id], { arch: a }], { context: { lang } })));
  }
  // Nombre de la recogida: el campo es traducible, así que se escribe también en español.
  for (const lang of ['en_US', 'es_ES']) await call('delivery.carrier', 'write', [[1], { name: 'Recogida en la fábrica (Alcalá de Henares)' }], { context: { lang } });
  for (const lang of ['en_US', 'es_ES']) await call('product.product', 'write', [[34], { name: 'Recogida en la fábrica' }], { context: { lang } });
  log(JSON.stringify(await call('ir.ui.view', 'search_read', [[['key', 'in', ['website.footer_custom', 'website.header_text_element']]]], { fields: ['id', 'key', 'website_id'] })));
};
