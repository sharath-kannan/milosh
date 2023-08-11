import { getReqOptions } from '../../tools/sharepoint/msal.js';

const href = new URL(window.location.href);
const urlParams = new URLSearchParams(href.search);
const referrer = urlParams.get('referrer');
const sourceDoc = referrer?.match(/sourcedoc=([^&]+)/)[1];
const sourceId = decodeURIComponent(sourceDoc);

const url = `https://adobe.sharepoint.com/sites/adobecom/_api/web/GetFileById('${sourceId}')`;
const contentType = 'application/json;odata=verbose';
const accept = 'application/json;odata=nometadata';

export const fetchVersions = async () => {
  const options = getReqOptions({
    accept,
    contentType,
  });
  // Fetching current version details
  const response = await fetch(url, options);
  const jsonRes = await response.json();

  if (!jsonRes.ok) {
    const message = jsonRes['odata.error']?.message.value || 'error';
    window.lana?.log(message);
  }

  const { CheckInComment, TimeLastModified, UIVersionLabel, ServerRelativeUrl, ID } = jsonRes;
   const currentVersion = {
    ID,
    CheckInComment,
    Url: ServerRelativeUrl,
    IsCurrentVersion: true,
    Created: TimeLastModified,
    VersionLabel: UIVersionLabel,
  };

  const versions = await fetch(`${url}/Versions`, options);
  const { value = [] } = await versions.json();
  const versionHistory = [...value, currentVersion];
  return versionHistory.reverse().filter((item) => item.VersionLabel.indexOf('.0') !== -1);
};

export const createHistoryTag = async (comment = '') => {
  const callOptions = getReqOptions({
    method: 'POST',
    accept,
    contentType,
  });
  const res = await fetch(`${url}/Publish('Through API: ${comment}')`, callOptions);

  if (!res.ok) {
    const error = await res.json();
    const message = error['odata.error']?.message.value || 'error';
    throw new Error(message);
  }
};