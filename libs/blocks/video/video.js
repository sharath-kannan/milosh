import { createIntersectionObserver, getConfig } from '../../utils/utils.js';
import { applyHoverPlay, getVideoAttrs, applyInViewPortPlay, syncPausePlayIcon } from '../../utils/decorate.js';

const accessiblity = true;
const ROOT_MARGIN = 1000;
const handlePause = (event) => {
  const video = event.target.parentElement.parentElement.querySelector('video');
  const playIcon = event.target.closest('.play-icon') || event.target.querySelector('.play-icon');
  const pauseIcon = event.target.closest('.pause-icon') || event.target.querySelector('.pause-icon');
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  syncPausePlayIcon(video);
}

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
  let video = '';
  if (accessiblity) {
    video = `<div class='video-container'><video ${attrs}>
          <source src="${videoPath}" type="video/mp4" />
        </video>
        <div class='pause-play-wrapper' tabindex=0>
          <img class='pause-icon ${a.textContent.includes('autoplay') ? '' : 'hidden'}' src='https://main--cc--adobecom.hlx.page/drafts/sharathkannan/accessiblity/pause.svg'/>
          <img class='play-icon ${a.textContent.includes('autoplay') ? 'hidden' : ''}' src='https://main--cc--adobecom.hlx.page/drafts/sharathkannan/accessiblity/play.svg'/>
        </div>
        <div>`;
  } else {
    video = `<video ${attrs}>
    <source src="${videoPath}" type="video/mp4" />
  </video>`
  }
  if (!a.parentNode) return;
  a.insertAdjacentHTML('afterend', video);
  const videoElem = document.body.querySelector(`source[src="${videoPath}"]`)?.parentElement;
  const pausePlayWrapper = a.nextElementSibling.querySelector('.pause-play-wrapper');
  pausePlayWrapper?.addEventListener('click', handlePause);
  pausePlayWrapper?.addEventListener('keydown', handlePause)

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
