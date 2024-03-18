import { html, signal, useEffect } from '../../../deps/htm-preact.js';

const DEF_ICON = 'purple';
const DEF_DESC = 'Checking...';
const pass = 'green';
const fail = 'red';
const limbo = 'orange';

const h1Result = signal({ icon: DEF_ICON, title: 'H1 count', description: DEF_DESC });
const titleResult = signal({ icon: DEF_ICON, title: 'Title size', description: DEF_DESC });
const canonResult = signal({ icon: DEF_ICON, title: 'Canonical', description: DEF_DESC });
const descResult = signal({ icon: DEF_ICON, title: 'Meta description', description: DEF_DESC });
const bodyResult = signal({ icon: DEF_ICON, title: 'Body size', description: DEF_DESC });
const loremResult = signal({ icon: DEF_ICON, title: 'Lorem Ipsum', description: DEF_DESC });
const linksResult = signal({ icon: DEF_ICON, title: 'Links', description: DEF_DESC });
const badLinks = signal([]);

function checkH1s() {
  const h1s = document.querySelectorAll('h1');
  const result = { ...h1Result.value };
  if (h1s.length === 1) {
    result.icon = pass;
    result.description = 'Only one H1 on the page.';
  } else {
    result.icon = fail;
    if (h1s.length > 1) {
      result.description = 'Reason: More than one H1 on the page.';
    } else {
      result.description = 'Reason: No H1 on the page.';
    }
  }
  h1Result.value = result;
  return result.icon;
}

async function checkTitle() {
  const titleSize = document.title.replace(/\s/g, '').length;
  const result = { ...titleResult.value };
  if (titleSize < 15) {
    result.icon = fail;
    result.description = 'Reason: Title size is too short.';
  } else if (titleSize > 70) {
    result.icon = fail;
    result.description = 'Reason: Title size is too long.';
  } else {
    result.icon = pass;
    result.description = 'Title size is good.';
  }
  titleResult.value = result;
  return result.icon;
}

async function checkCanon() {
  const result = { ...canonResult.value };
  const canon = document.querySelector("link[rel='canonical']");
  if (!canon) {
    result.icon = pass;
    result.description = 'Canonical is self-referencing.';
  } else {
    const { href } = canon;
    try {
      const resp = await fetch(href, { method: 'HEAD' });
      if (!resp.ok) {
        result.icon = fail;
        result.description = 'Reason: Error with canonical reference.';
      }
      if (resp.ok) {
        if (resp.status >= 300 && resp.status <= 308) {
          result.icon = fail;
          result.description = 'Reason: Canonical reference redirects.';
        } else {
          result.icon = pass;
          result.description = 'Canonical referenced is valid.';
        }
      }
    } catch (e) {
      result.icon = limbo;
      result.description = 'Canonical cannot be crawled.';
    }
  }
  canonResult.value = result;
  return result.icon;
}

async function checkDescription() {
  const metaDesc = document.querySelector('meta[name="description"]');
  const result = { ...descResult.value };
  if (!metaDesc) {
    result.icon = fail;
    result.description = 'Reason: No meta description found.';
  } else {
    const descSize = metaDesc.content.replace(/\s/g, '').length;
    if (descSize < 50) {
      result.icon = fail;
      result.description = 'Reason: Meta description too short.';
    } else if (descSize > 150) {
      result.icon = fail;
      result.description = 'Reason: Meta description too long.';
    } else {
      result.icon = pass;
      result.description = 'Meta description is good.';
    }
  }
  descResult.value = result;
  return result.icon;
}

async function checkBody() {
  const result = { ...bodyResult.value };
  const { length } = document.documentElement.innerText;

  if (length > 100) {
    result.icon = pass;
    result.description = 'Body content has a good length.';
  } else {
    result.icon = fail;
    result.description = 'Reson: Not enough content.';
  }
  bodyResult.value = result;
  return result.icon;
}

async function checkLorem() {
  const result = { ...loremResult.value };
  const { innerHTML } = document.documentElement;
  if (innerHTML.includes('Lorem ipsum')) {
    result.icon = fail;
    result.description = 'Reason: Lorem ipsum is used on the page.';
  } else {
    result.icon = pass;
    result.description = 'No Lorem ipsum is used on the page.';
  }
  loremResult.value = result;
  return result.icon;
}

function makeGroups(items, size = 20) {
  const groups = [];
  while (items.length) {
    groups.push(items.splice(0, size));
  }
  return groups;
}

async function checkLinks() {
  const spidyUrl = 'https://spidy.corp.adobe.com';
  if (linksResult.value.checked) return;

  const connectionError = () => {
    linksResult.value = {
      icon: fail,
      description: `A VPN connection is required to use the link check service.
      Please turn on VPN and refresh the page. If VPN is running contact your site engineers for help.`,
    };
  };

  // Check to see if Spidy is available.
  try {
    const resp = await fetch(spidyUrl, { method: 'HEAD' });
    if (!resp.ok) {
      connectionError();
      return;
    }
  } catch (e) {
    connectionError();
    console.error(`There was a prolem connecting to the link check API ${spidyUrl}. ${e}`);
    return;
  }

  const result = { ...linksResult.value };

  // Find all links. Remove any local or existing preflight links
  const links = [...document.querySelectorAll('a')]
    .filter((link) => {
      if (!link.href.includes('local') && !link.closest('.preflight')) {
        link.dataset.livehref = link.href.replace('hlx.page', 'hlx.live');
        console.log(link);
        return true;
      }
      return false;
    });

  links.forEach(())
  const groups = makeGroups(links);

  // for (const group of groups) {
  //   // Check .hlx.live URLS
  //   const urls = group.map((link) => link);

  //   const opts = {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ urls }),
  //   };
  //   try {
  //     const resp = await fetch(`${spidyUrl}/api/url-http-status`, opts);
  //     if (!resp.ok) return;

  //     const json = await resp.json();
  //     if (!json) return;
  //     json.data.forEach((linkResult) => {
  //       const status = linkResult.status === 'ECONNREFUSED' ? 503 : linkResult.status;
  //       // Response will come back out of order, use ID to find the correct index
  //       group[linkResult.id].status = status;

  //       if (status >= 399) {
  //         let parent = '';
  //         if (group[linkResult.id].closest('header')) parent = 'Gnav';
  //         if (group[linkResult.id].closest('main')) parent = 'Main content';
  //         if (group[linkResult.id].closest('footer')) parent = 'Footer';
  //         badLinks.value = [...badLinks.value,
  //           {
  //             // Diplay .hlx.live URL in broken link list for relative links
  //             href: group[linkResult.id].href.includes('.hlx.page')
  //               ? group[linkResult.id].href.replace('.hlx.page', '.hlx.live')
  //               : group[linkResult.id].href,
  //             status: group[linkResult.id].status,
  //             parent,
  //           }];
  //         group[linkResult.id].classList.add('broken-link');
  //         group[linkResult.id].dataset.status = status;
  //       }
  //     });
  //   } catch (e) {
  //     console.error(`There was a prolem connecting to the link check API ${spidyUrl}/api/url-http-status. ${e}`);
  //   }
  // }

  if (badLinks.value.length > 0) {
    result.icon = fail;
    result.description = `Reason: ${badLinks.value.length} broken link(s) found on the page. Use the list below to identify and fix them.`;
  }

  /* No broken links */
  if (badLinks.value.length === 0) {
    result.icon = pass;
    result.description = 'Links are valid.';
  }
  linksResult.value = { ...result, checked: true };
}

export async function sendResults() {
  const robots = document.querySelector('meta[name="robots"]').content || 'all';

  const data = {
    dateTime: new Date().toLocaleString(),
    url: window.location.href,
    H1: h1Result.value.description,
    httpsLinks: linksResult.value.description,
    title: titleResult.value.description,
    canon: canonResult.value.description,
    metaDescription: descResult.value.description,
    loremIpsum: loremResult.value.description,
    bodyLength: bodyResult.value.description,
    https: window.location.protocol === 'https:' ? 'HTTPS' : 'HTTP',
    robots,
  };

  await fetch(
    'https://main--milo--adobecom.hlx.page/seo/preflight',
    {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify({ data }),
    },
  );
}

function SeoItem({ icon, title, description }) {
  return html`
    <div class=seo-item>
      <div class="result-icon ${icon}"></div>
      <div class=seo-item-text>
        <p class=seo-item-title>${title}</p>
        <p class=seo-item-description>${description}</p>
      </div>
    </div>`;
}

async function getResults() {
  const h1 = checkH1s();
  const title = checkTitle();
  const canon = await checkCanon();
  const desc = checkDescription();
  const body = checkBody();
  const lorem = checkLorem();
  const links = await checkLinks();

  const icons = [h1, title, canon, desc, body, lorem, links];

  const red = icons.find((icon) => icon === 'red');
  if (red) {
    const sk = document.querySelector('helix-sidekick');
    if (sk) {
      const publishBtn = sk.shadowRoot.querySelector('div.publish.plugin button');
      publishBtn.addEventListener('click', () => {
        sendResults();
      });
    }
  }
}

export default function Panel() {
  useEffect(() => { getResults(); }, []);
  return html`
    <div class=seo-columns>
      <div class=seo-column>
        <${SeoItem} icon=${titleResult.value.icon} title=${titleResult.value.title} description=${titleResult.value.description} />
        <${SeoItem} icon=${h1Result.value.icon} title=${h1Result.value.title} description=${h1Result.value.description} />
        <${SeoItem} icon=${canonResult.value.icon} title=${canonResult.value.title} description=${canonResult.value.description} />
        <${SeoItem} icon=${linksResult.value.icon} title=${linksResult.value.title} description=${linksResult.value.description} />
      </div>
      <div class=seo-column>
        <${SeoItem} icon=${bodyResult.value.icon} title=${bodyResult.value.title} description=${bodyResult.value.description} />
        <${SeoItem} icon=${loremResult.value.icon} title=${loremResult.value.title} description=${loremResult.value.description} />
        <${SeoItem} icon=${descResult.value.icon} title=${descResult.value.title} description=${descResult.value.description} />
      </div>
    </div>
    <div class='broken-links'>
    ${badLinks.value.length > 0 && html`
      <p class="note">Broken links can also be found highlted on the page. Close preflight to see problem links highlighted in red.</p>
      <table>
        <tr>
          <th></th>
          <th>Broken URLs</th>
          <th>Located in</th>
          <th>Status</th>
        </tr>
        ${badLinks.value.map((link, idx) => html`
          <tr>
            <td>${idx + 1}.</td>
            <td><a href='${link.href}' target='_blank'>${link.href}</a></td>
            <td><span>${link.parent}</span></td>
            <td><span>${link.status}</span></td>
          </tr>`)}
      </table>`}
    </div>`;
}
