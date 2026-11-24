const L = require('./lib');
module.exports = async (a) => {
  for (const [b, slug, mod] of [['Inventario', 'inventario', 'stock'], ['Compra', 'compra', 'purchase'], ['Fabricación', 'fabricacion', 'mrp'], ['Ventas', 'ventas', 'sale_management']]) {
    await L.instalar(a, b, b, slug);
    a.log(mod + '=' + await L.ok(a.call, mod));
  }
  await L.ir(a.page, a.BASE, ''); await a.page.waitForTimeout(1500);
  await a.shot('menu-principal-con-modulos-de-la-fabrica');
};
