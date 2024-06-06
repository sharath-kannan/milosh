import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { getMepEnablement } from '../../libs/utils/utils.js';

describe('MEP Utils', () => {
  describe('getMepEnablement', async () => {
    it('checks target metadata set to off', async () => {
      document.head.innerHTML = await readFile({ path: './mocks/mep/head-target-on.html' });
      const targetEnabled = getMepEnablement('target');
      expect(targetEnabled).to.equal(true);
    });
    it('checks target metadata set to on', async () => {
      document.head.innerHTML = await readFile({ path: './mocks/mep/head-target-off.html' });
      const targetEnabled = getMepEnablement('target');
      expect(targetEnabled).to.equal(false);
    });
    it('checks target metadata set to gnav', async () => {
      document.head.innerHTML = await readFile({ path: './mocks/mep/head-target-gnav.html' });
      const targetEnabled = getMepEnablement('target');
      expect(targetEnabled).to.equal('gnav');
    });
    it('checks from just metadata with no target metadata', async () => {
      document.head.innerHTML = await readFile({ path: './mocks/mep/head-promo.html' });
      const persEnabled = getMepEnablement('personalization');
      const promoEnabled = getMepEnablement('manifestnames', 'promo');
      const targetEnabled = getMepEnablement('target');
      expect(promoEnabled).to.equal('pre-black-friday-global,black-friday-global');
      expect(persEnabled).to.equal('https://main--milo--adobecom.hlx.page/products/special-offers-manifest.json');
      expect(targetEnabled).to.equal(false);
    });
  });
});
