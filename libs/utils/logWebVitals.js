export default function webVitals(mep, { delay = 1000 } = {}) {
  let lanaSent = false;
  const lanaData = {};

  function sendToLana() {
    if (lanaSent) return;
    const ua = window.navigator.userAgent;

    Object.assign(lanaData, {
      chromeVer: (ua.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/) || [])[1] || '',
      country: sessionStorage.getItem('akamai') || '',
      // eslint-disable-next-line compat/compat
      downlink: window.navigator?.connection?.downlink || '',
      loggedIn: window.adobeIMS?.isSignedInUser() || false,
      os: (ua.match(/Windows/) && 'win') || (ua.match(/Mac/) && 'mac') || '',
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth,
      url: `${window.location.host}${window.location.pathname}`,
    });

    const lanaDataStr = Object.entries(lanaData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join(',');

    lanaSent = true;
    setTimeout(() => {
      window.lana.log(lanaDataStr, {
        clientId: 'pageperf',
        sampleRate: 100,
      });
    }, delay);
  }

  let cls = 0;
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      if (!entry.hadRecentInput) {
        cls += entry.value;
      }
    }
    lanaData.cls = cls.toPrecision(4);
    if (lanaData.lcp !== undefined) {
      sendToLana();
    }
  }).observe({ type: 'layout-shift', buffered: true });

  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1]; // Use the latest LCP candidate
    lanaData.lcp = parseInt(lastEntry.startTime, 10);

    if (lanaData.cls !== undefined) {
      sendToLana();
    }
  }).observe({ type: 'largest-contentful-paint', buffered: true });

  mep?.experiments?.forEach((exp, idx) => {
    // only log manifests that affect the page
    if (exp.selectedVariantName === 'default') return;
    lanaData[`manifest${idx + 1}path`] = exp.manifestPath;
    lanaData[`manifest${idx + 1}selected`] = exp.selectedVariantName;
  });

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      sendToLana();
    }
  });
}
