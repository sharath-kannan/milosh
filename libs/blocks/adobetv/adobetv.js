import { createIntersectionObserver } from '../../utils/utils.js';
import { addAccessibilityControl, applyHoverPlay, getVideoAttrs, handlePause } from '../../utils/decorate.js';

const ROOT_MARGIN = 1000;

const loadAdobeTv = (a) => {
  const bgBlocks = ['aside', 'marquee', 'hero-marquee'];
  if (a.href.includes('.mp4') && bgBlocks.some((b) => a.closest(`.${b}`))) {
    a.classList.add('hide');
    const { href, hash, dataset } = a;
    const attrs = getVideoAttrs(hash || 'autoplay', dataset);
    let video = `<div class='video-container'><video ${attrs}>
    <source src="${href}" type="video/mp4" />
  </video>`;
    video = addAccessibilityControl(video, attrs);
    if (!a.parentNode) return;
    a.insertAdjacentHTML('afterend', video);
    const videoElem = document.body.querySelector(`source[src="${href}"]`)?.parentElement;
    const pausePlayWrapper = a.nextElementSibling.querySelector('.pause-play-wrapper');
    pausePlayWrapper?.addEventListener('click', handlePause);
    pausePlayWrapper?.addEventListener('keydown', handlePause)
    applyHoverPlay(videoElem);
    a.remove();
  } else {
    const embed = `<div class="milo-video">
      <iframe src="${a.href}" class="adobetv" webkitallowfullscreen mozallowfullscreen allowfullscreen scrolling="no" allow="encrypted-media" title="Adobe Video Publishing Cloud Player" loading="lazy">
      </iframe>
    </div>`;
    a.insertAdjacentHTML('afterend', embed);
    a.remove();
  }
};

export default function init(a) {
  a.classList.add('hide-video');
  if (a.textContent.includes('no-lazy')) {
    loadAdobeTv(a);
  } else {
    createIntersectionObserver({
      el: a,
      options: { rootMargin: `${ROOT_MARGIN}px` },
      callback: loadAdobeTv,
    });
  }
}
