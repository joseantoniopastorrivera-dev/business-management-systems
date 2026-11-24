module.exports = async ({ page, ctx, shot, log, call }) => {
  // URL del quiosco: Asistencias → Configuración → «Url del quiosco de asistencia» (no se guarda en el repo)
  const url = process.env.URL_QUIOSCO;
  const k = await ctx.newPage(); await k.setViewportSize({ width: 1440, height: 900 });
  await k.goto(url, { waitUntil: 'domcontentloaded' }); await k.waitForTimeout(5000);
  await shot('quiosco-de-asistencias-pantalla-inicial', { page: k });
  log('K0=' + (await k.locator('body').innerText()).slice(0, 300));
  const b = k.locator('button', { hasText: /manual/i }).first(); if (await b.count()) { await b.click(); await k.waitForTimeout(2500); }
  await shot('quiosco-lista-de-empleados', { page: k });
  log('K1=' + (await k.locator('body').innerText()).slice(0, 400));
  await k.getByText('Daniel Ortega Ruiz', { exact: true }).first().click(); await k.waitForTimeout(2500);
  await shot('quiosco-daniel-ortega-antes-de-registrar-entrada', { page: k });
  log('K2=' + (await k.locator('body').innerText()).slice(0, 300));
  const e = k.locator('button, a', { hasText: /Registrar entrada|Entrada|Check in/i }).first(); if (await e.count()) { await e.click(); await k.waitForTimeout(3000); }
  await shot('quiosco-daniel-ortega-entrada-registrada', { page: k });
  log('K3=' + (await k.locator('body').innerText()).slice(0, 300));
  await k.close();
  log(JSON.stringify(await call('hr.attendance', 'search_read', [[]], { fields: ['employee_id', 'check_in', 'check_out'] })));
};
