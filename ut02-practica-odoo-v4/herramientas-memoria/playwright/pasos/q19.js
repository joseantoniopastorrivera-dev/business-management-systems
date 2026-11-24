module.exports = async ({ page, log }) => {
  const g = page.locator('.o_group_header', { hasText: 'PT-IPA-30' }).first();
  log('HDR=' + (await g.innerHTML()).slice(0, 1500));
};
