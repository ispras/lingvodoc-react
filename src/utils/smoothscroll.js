const getTop = (element, start) => {
  if (element.nodeName === 'HTML') {
    return -start;
  }

  return element.getBoundingClientRect().top + start;
};

// ease in out function thanks to:
// http://blog.greweb.fr/2012/02/bezier-curve-based-easing-functions-from-concept-to-implementation/
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1);

const position = (start, end, elapsed, duration) => {
  if (elapsed > duration) return end;
  return start + (end - start) * easeInOutCubic(elapsed / duration); // easing
  // return start + (end - start) * (elapsed / duration); // linear
};

const defaultAnimationFrame = (fn) => {
  window.setTimeout(fn, 15);
};

const smoothScroll = (el, _duration, callback, _context) => {
  const duration = _duration || 500;
  const context = _context || window;
  const start = context.scrollTop || window.pageYOffset;
  let end;

  if (typeof el === 'number') {
    end = parseInt(el, 10);
  } else {
    end = getTop(el, start);
  }

  const clock = Date.now();
  const requestAnimationFrame = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
    defaultAnimationFrame;

  const step = () => {
    const elapsed = Date.now() - clock;
    if (context !== window) {
      context.scrollTop = position(start, end, elapsed, duration);
    } else {
      window.scroll(0, position(start, end, elapsed, duration));
    }

    if (elapsed > duration) {
      if (typeof callback === 'function') {
        callback(el);
      }
    } else {
      requestAnimationFrame(step);
    }
  };
  step();
};

export default smoothScroll;
