import { createIntersectionObserver, getConfig } from '../../utils/utils.js';
import { applyHoverPlay, getVideoAttrs, applyInViewPortPlay, handlePause, addAccessibilityControl, syncPausePlayIcon } from '../../utils/decorate.js';

const accessiblity = true;
const ROOT_MARGIN = 1000;

const loadVideo = (a) => {
  const { pathname, hash, dataset } = a;
  let videoPath = `.${pathname}`;
  if (pathname.match('media_.*.mp4')) {
    const { codeRoot } = getConfig();
    const root = codeRoot.endsWith('/')
      ? codeRoot
      : `${codeRoot}/`;
    const mediaFilename = pathname.split('/').pop();
    videoPath = `${root}${mediaFilename}`;
  }

  const attrs = getVideoAttrs(hash, dataset);
  let video = `<video ${attrs}>
  <source src="${videoPath}" type="video/mp4" />
  </video>`
  if (accessiblity) {
    video = addAccessibilityControl(video, attrs);
  }
  if (!a.parentNode) return;
  a.insertAdjacentHTML('afterend', video);
  const videoElem = a.parentElement.querySelector(`source[src="${videoPath}"]`)?.parentElement;
  const pausePlayWrapper = a.nextElementSibling.querySelector('.pause-play-wrapper');
  pausePlayWrapper?.addEventListener('click', handlePause);
  pausePlayWrapper?.addEventListener('keydown', handlePause);
  if (attrs.includes('autoplay')) {
    videoElem.addEventListener('ended', () => { syncPausePlayIcon(videoElem); });
  }
  applyHoverPlay(videoElem);
  applyInViewPortPlay(videoElem);
  a.remove();
};

export default function init(a) {
  a.classList.add('hide-video');
  if (a.textContent.includes('no-lazy')) {
    loadVideo(a);
  } else {
    createIntersectionObserver({
      el: a,
      options: { rootMargin: `${ROOT_MARGIN}px` },
      callback: loadVideo,
    });
  }
}
