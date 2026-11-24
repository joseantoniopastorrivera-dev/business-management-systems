const L = require('./lib');
module.exports = async (a) => {
  await L.abrir(a.page, a.BASE, 'base.open_module_tree', '1', '.o_kanban_view');
  for (const [b, card, slug, mod] of [['Empleados', 'Empleados', 'empleados', 'hr'], ['Contratos', 'Contratos de los empleados', 'contratos', 'hr_contract'], ['Asistencias', 'Asistencias', 'asistencias', 'hr_attendance'], ['Ausencias', 'Ausencias', 'ausencias', 'hr_holidays'], ['Reclutamiento', 'Reclutamiento', 'reclutamiento', 'hr_recruitment']]) {
    if (await L.ok(a.call, mod) === 'installed') { a.log(mod + ' ya instalado'); continue; }
    await L.instalar(a, b, card, slug);
    a.log(mod + '=' + await L.ok(a.call, mod));
  }
  await L.ir(a.page, a.BASE, ''); await L.menuApps(a.page); await a.shot('menu-de-aplicaciones-con-recursos-humanos');
};
