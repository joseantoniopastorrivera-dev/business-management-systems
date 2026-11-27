// Cap. 3 · Contabilidad analítica: activarla en Facturación → Ajustes (fábrica).
module.exports = async ({ page, shot, BASE, L }) => {
  await L.abrir(page, BASE, 'account.action_account_config', '1');
  const s = await L.ajuste(page, 'Contabilidad analítica');
  const c = s.locator('input[type=checkbox]').first();
  if (!(await c.isChecked())) { await c.check({ force: true }); await L.guardarAjustes(page); }
  const s2 = await L.ajuste(page, 'Contabilidad analítica');
  await shot('analitica-01-activar-ajuste', { zona: s2, foco: s2.locator('input[type=checkbox]').first().locator('xpath=..'), borrador: 'Ajuste Contabilidad analítica activado y guardado' });
};
