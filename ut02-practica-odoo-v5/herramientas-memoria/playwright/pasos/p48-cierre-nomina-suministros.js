// Cap. 8 · V-4 Cierre de noviembre en la fábrica: nómina y suministros, con el coste de producción repartido por cerveza.
// Community no tiene Nóminas (Payroll es de Enterprise): la nómina del mes se contabiliza con un asiento manual a partir
// de los contratos de la v4 (12.900 € brutos). Tipos aproximados: SS empresa 31,4 %, SS trabajador 6,47 %, IRPF 15 %.
// Reparto analítico (plan «Cervezas») de lo que es coste de producción — sueldos del maestro cervecero y la operaria,
// y luz y agua de la fábrica — según los barriles fabricados en noviembre: 10 de cada cerveza (v4) y 7 Barriles de
// Navidad (v5) = 47 barriles → 21,28 % / 21,28 % / 21,28 % / 21,27 % / 14,89 %.
const REPARTO = { 1: 21.28, 2: 21.28, 3: 21.28, 4: 21.27, 5: 14.89 };   // IPA, LAG, STO, TRI, Barril de Navidad
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const C = { context: { allowed_company_ids: [1] } };
  const cta = async (c) => (await call('account.account', 'search_read', [[['company_id', '=', 1], ['code', '=', c]]], { fields: ['id'], ...C }))[0].id;
  const ir = async (h) => { await page.goto(BASE + '/web?r=' + Date.now() + '#' + h + '&cids=1'); await page.waitForSelector('.o_form_view', { timeout: 120000 }); await L.esperar(page, 1200); };
  // 1. Nómina
  let [nom] = await call('account.move', 'search_read', [[['ref', '=', 'Nómina de noviembre de 2026']]], { fields: ['id', 'state'], ...C });
  if (!nom) {
    const prod = 2600 + 1650, estr = 12900 - prod;
    const r2 = (x) => Math.round(x * 100) / 100;
    const ssEmpP = r2(prod * 0.314), ssEmpE = r2(estr * 0.314), ssTrab = r2(12900 * 0.0647), irpf = 1935;
    const neto = r2(12900 - ssTrab - irpf);
    const L_ = (a, n, d, h, an) => [0, 0, { account_id: a, name: n, debit: d, credit: h, ...(an ? { analytic_distribution: an } : {}) }];
    const id = await call('account.move', 'create', [{ move_type: 'entry', journal_id: 3, date: '2026-11-30', ref: 'Nómina de noviembre de 2026', line_ids: [
      L_(await cta('640000'), 'Sueldos de producción (maestro cervecero y operaria)', prod, 0, REPARTO),
      L_(await cta('640000'), 'Sueldos de estructura (gerencia, logística, administración, comercial)', estr, 0),
      L_(await cta('642000'), 'Seguridad Social a cargo de la empresa · producción (31,4 %)', ssEmpP, 0, REPARTO),
      L_(await cta('642000'), 'Seguridad Social a cargo de la empresa · estructura (31,4 %)', ssEmpE, 0),
      L_(await cta('476000'), 'Seguridad Social: cuota empresa + cuota trabajador (6,47 %)', 0, r2(ssEmpP + ssEmpE + ssTrab)),
      L_(await cta('475100'), 'Retenciones de IRPF de noviembre (15 %)', 0, irpf),
      L_(await cta('465000'), 'Nóminas de noviembre pendientes de pago (neto)', 0, neto),
    ] }], C);
    nom = { id, state: 'draft' };
  }
  await ir(`model=account.move&id=${nom.id}&view_type=form`);
  if (nom.state === 'draft') {
    await shot('cierre-10-nomina-borrador', { zona: ['.o_form_sheet', '.o_control_panel'], borrador: 'Asiento de nómina en borrador con el reparto analítico' });
    await page.locator('.o_form_statusbar button[name=action_post]:visible').first().click(); await L.esperar(page, 2000);
  }
  await shot('cierre-11-nomina-publicada', { zona: ['.o_form_sheet', '.o_control_panel'], borrador: 'Asiento de nómina publicado' });
  // 2. Suministros: acreedor de servicios con la 410 en su ficha
  let [ele] = await call('res.partner', 'search_read', [[['name', '=', 'Eléctrica del Henares, S.A.']]], { fields: ['id'], ...C });
  if (!ele) ele = { id: await call('res.partner', 'create', [{ name: 'Eléctrica del Henares, S.A.', is_company: true, street: 'Avenida de Madrid, 3', city: 'Alcalá de Henares', zip: '28802', country_id: 68, supplier_rank: 1 }], C) };
  await call('res.partner', 'write', [[ele.id], { property_account_payable_id: await cta('410000') }], C);
  let [fac] = await call('account.move', 'search_read', [[['partner_id', '=', ele.id], ['move_type', '=', 'in_invoice']]], { fields: ['id', 'state'], ...C });
  if (!fac) {
    const id = await call('account.move', 'create', [{ move_type: 'in_invoice', partner_id: ele.id, invoice_date: '2026-11-30', ref: 'EH-2026-11-0457', invoice_line_ids: [
      [0, 0, { name: 'Electricidad de noviembre (cocción, fermentadores y cámara fría): 6.890 kWh', account_id: await cta('628000'), quantity: 1, price_unit: 1240, tax_ids: [[6, 0, [3]]], analytic_distribution: REPARTO }],
      [0, 0, { name: 'Agua de noviembre (elaboración y limpieza CIP): 152 m³', account_id: await cta('628000'), quantity: 1, price_unit: 180, tax_ids: [[6, 0, [59]]], analytic_distribution: REPARTO }],
    ] }], C);
    fac = { id, state: 'draft' };
  }
  await ir(`model=account.move&id=${fac.id}&view_type=form`);
  if (fac.state === 'draft') { await page.locator('.o_form_statusbar button[name=action_post]:visible').first().click(); await L.esperar(page, 2000); }
  await shot('cierre-12-factura-suministros', { zona: ['.o_form_sheet', '.o_control_panel'], borrador: 'Factura de luz y agua con reparto analítico, acreedor en la 410' });
  await page.locator('.o_notebook .nav-link', { hasText: 'Apuntes contables' }).first().click(); await L.esperar(page, 600);
  await shot('cierre-13-apuntes-suministros', { zona: '.o_notebook', borrador: 'Apuntes: 628, 472 y 410' });
  log(JSON.stringify(await call('account.move', 'read', [[nom.id, fac.id], ['name', 'state', 'amount_total']], C)));
};
