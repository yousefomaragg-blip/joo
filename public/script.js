(() => {
  'use strict';

  try {
    const nav = document.getElementById('nav');
    const button = document.getElementById('hamburger');
    const links = document.getElementById('nav-links');
    if (!nav || !button || !links) return;

    const mobile = window.matchMedia('(max-width: 860px)');
    const setOpen = (open) => {
      links.classList.toggle('open', open);
      button.setAttribute('aria-expanded', String(open));
    };
    const close = (restoreFocus = false) => {
      const wasOpen = links.classList.contains('open');
      setOpen(false);
      if (wasOpen && restoreFocus) button.focus({ preventScroll: true });
    };

    button.addEventListener('click', () => {
      setOpen(mobile.matches && !links.classList.contains('open'));
    });
    links.addEventListener('click', (event) => {
      if (event.target.closest('a[href]')) close();
    });
    document.addEventListener('click', (event) => {
      if (!nav.contains(event.target)) close();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && links.classList.contains('open')) {
        close(links.contains(document.activeElement) || document.activeElement === button);
      }
    });
    window.addEventListener('resize', () => {
      if (!mobile.matches) close();
    });
    window.addEventListener('hashchange', () => {
      let id;
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch (_) {
        return;
      }
      const destination = document.getElementById(id);
      if (!destination) return;
      if (!destination.hasAttribute('tabindex') && destination.tabIndex < 0) {
        destination.setAttribute('tabindex', '-1');
        destination.addEventListener('blur', () => {
          if (destination.getAttribute('tabindex') === '-1') {
            destination.removeAttribute('tabindex');
          }
        }, { once: true });
      }
      destination.focus({ preventScroll: true });
    });

    button.setAttribute('aria-controls', links.id);
    setOpen(false);
    nav.classList.add('js-nav');
  } catch (error) {
    console.warn('Preview navigation could not initialize.', error);
  }
})();

(() => {
  'use strict';

  try {
    if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const elements = Array.from(document.querySelectorAll('.reveal'));
    const seen = new WeakSet();
    const running = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting || reduced.matches || seen.has(target)) return;
        seen.add(target);
        observer.unobserve(target);
        try {
          const animation = target.animate([
            { opacity: 0.4, transform: 'translateY(12px)' },
            { opacity: 1, transform: 'none' },
          ], { duration: 480, easing: 'cubic-bezier(0.22,1,0.36,1)' });
          running.add(animation);
          const forget = () => running.delete(animation);
          animation.addEventListener('finish', forget, { once: true });
          animation.addEventListener('cancel', forget, { once: true });
        } catch (error) {
          console.warn('An optional preview reveal was skipped.', error);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -32px 0px' });

    const sync = () => {
      observer.disconnect();
      if (reduced.matches) {
        running.forEach((animation) => animation.cancel());
        running.clear();
      } else {
        elements.forEach((element) => {
          if (!seen.has(element)) observer.observe(element);
        });
      }
    };
    if (reduced.addEventListener) reduced.addEventListener('change', sync);
    else reduced.addListener(sync);
    sync();
  } catch (error) {
    console.warn('Optional preview reveals could not initialize.', error);
  }
})();

(() => {
  'use strict';

  try {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const marquees = Array.from(document.querySelectorAll('.platform-marquee,.proof-marquee'));
    const tracks = Array.from(document.querySelectorAll('.platform-marquee-track,.proof-marquee-track'));
    const visible = new WeakMap();
    const groups = new Map();
    let duplicationReady = tracks.length > 0;
    let motionReady = false;

    tracks.forEach((track) => {
      const items = Array.from(track.children);
      if (items.length < 2 || items.length % 2 !== 0) {
        duplicationReady = false;
        console.warn('A marquee must contain two identical item groups.', track);
        return;
      }
      // The markup contains a second copy for the continuous loop.
      items.slice(items.length / 2).forEach((item) => {
        item.setAttribute('aria-hidden', 'true');
        item.inert = true;
      });
    });

    const syncMarquee = (marquee) => {
      marquee.classList.toggle('marquee-active', Boolean(
        motionReady && visible.get(marquee) && !document.hidden && !reduced.matches &&
        !marquee.closest('.motion-paused') && !marquee.classList.contains('marquee-focused')
      ));
    };
    const sync = () => {
      groups.forEach(({ buttons, paused }, section) => {
        section.classList.toggle('motion-paused', paused);
        buttons.forEach((button) => {
          button.setAttribute('aria-pressed', String(paused));
          button.disabled = reduced.matches;
          const label = button.querySelector('.motion-toggle-label');
          const icon = button.querySelector('use');
          if (label) label.textContent = paused ? 'Resume motion' : 'Pause motion';
          if (icon) {
            const reference = paused ? '#icon-play' : '#icon-pause';
            icon.setAttribute('href', reference);
            if (icon.hasAttributeNS('http://www.w3.org/1999/xlink', 'href')) {
              icon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', reference);
            }
          }
        });
      });
      marquees.forEach(syncMarquee);
    };

    document.querySelectorAll('[data-motion-toggle][aria-controls]').forEach((button) => {
      const section = document.getElementById(button.getAttribute('aria-controls'));
      if (!section) return;
      if (!groups.has(section)) {
        groups.set(section, { buttons: [], paused: section.classList.contains('motion-paused') });
      }
      const group = groups.get(section);
      group.buttons.push(button);
      button.addEventListener('click', () => {
        group.paused = !group.paused;
        sync();
      });
    });

    marquees.forEach((marquee) => {
      marquee.addEventListener('focusin', () => {
        marquee.classList.add('marquee-focused');
        syncMarquee(marquee);
      });
      marquee.addEventListener('focusout', () => {
        queueMicrotask(() => {
          marquee.classList.toggle('marquee-focused', marquee.contains(document.activeElement));
          syncMarquee(marquee);
        });
      });
    });
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          visible.set(target, isIntersecting);
          syncMarquee(target);
        });
      }, { threshold: 0, rootMargin: '0px' });
      marquees.forEach((marquee) => observer.observe(marquee));
    }
    // Without an observer the CSS-default static state remains usable.
    document.addEventListener('visibilitychange', sync);
    if (reduced.addEventListener) reduced.addEventListener('change', sync);
    else reduced.addListener(sync);
    motionReady = duplicationReady && marquees.length > 0 &&
      'IntersectionObserver' in window && marquees.every((marquee) =>
        Array.from(groups.keys()).some((section) => section.contains(marquee))
      );
    sync();
    if (motionReady) {
      document.documentElement.classList.add('motion-ready');
      groups.forEach(({ buttons }) => {
        buttons.forEach((button) => { button.hidden = false; });
      });
    }
  } catch (error) {
    console.warn('Preview marquee controls could not initialize.', error);
  }
})();

(() => {
  'use strict';

  try {
    const lightbox = document.getElementById('image-lightbox');
    const panel = lightbox?.querySelector('.image-lightbox-panel');
    const viewport = document.getElementById('image-lightbox-viewport');
    const stage = viewport?.querySelector('.viewer-image-stage');
    const image = document.getElementById('image-lightbox-img');
    const title = document.getElementById('image-lightbox-title');
    const caption = document.getElementById('image-lightbox-caption');
    const percentage = document.getElementById('image-zoom');
    const position = document.getElementById('image-position');
    const actions = ['previous', 'next', 'out', 'in', 'fit', 'actual', 'close'];
    const controls = Object.fromEntries(actions.map((action) => [
      action, lightbox?.querySelector(`[data-viewer-action="${action}"]`),
    ]));
    if (!lightbox || !panel || !viewport || !stage || !image || !title || !caption ||
        !percentage || !position || actions.some((action) => !controls[action])) {
      console.warn('Evidence viewer is waiting for its complete markup contract.');
      return;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const screenshots = Array.from(document.querySelectorAll(
      '.case-study .screenshot-wrap img,.case-study .evidence-card img,.case-study .ba-screenshot img'
    ));
    const background = new Map();
    const epsilon = 0.001;
    let state = 'closed';
    let current = 0;
    let returnFocus = null;
    let exitTimer = null;
    let entranceFrame = null;
    let loadVersion = 0;
    let ready = false;
    let fit = 1;
    let zoom = 1;
    let zoomMode = 'fit';
    let bodyWasLocked = false;
    let backdropPressed = false;

    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', title.id);
    panel.tabIndex = -1;
    viewport.tabIndex = 0;
    percentage.setAttribute('aria-live', 'polite');

    function getCaption(source) {
      const container = source.closest('.screenshot-frame,.screenshot-pair-card,.evidence-card,.ba-card,.case-study');
      const label = container?.querySelector('.screenshot-label,.ba-label,.cs-brand-tag')?.textContent.trim();
      return label || source.alt || 'Evidence screenshot';
    }

    function updateControls() {
      controls.previous.disabled = current <= 0;
      controls.next.disabled = current >= screenshots.length - 1;
      controls.out.disabled = !ready || zoom <= fit + epsilon;
      controls.in.disabled = !ready || zoom >= Math.max(4, fit) - epsilon;
      controls.fit.disabled = !ready || Math.abs(zoom - fit) < epsilon;
      controls.actual.disabled = !ready || Math.abs(zoom - 1) < epsilon;
      percentage.textContent = ready ? `${Math.round(zoom * 100)}%` : 'Loading';
      position.textContent = `${current + 1} of ${screenshots.length}`;
    }

    function availableSize() {
      const style = window.getComputedStyle(viewport);
      const number = (value) => Number.parseFloat(value) || 0;
      return {
        width: Math.max(1, viewport.clientWidth - number(style.paddingLeft) - number(style.paddingRight)),
        height: Math.max(1, viewport.clientHeight - number(style.paddingTop) - number(style.paddingBottom)),
      };
    }

    function measureFit() {
      const size = availableSize();
      fit = Math.min(1, size.width / image.naturalWidth, size.height / image.naturalHeight);
      return size;
    }

    function renderZoom(center = null) {
      if (!ready) return;
      const size = availableSize();
      const width = image.naturalWidth * zoom;
      const height = image.naturalHeight * zoom;
      image.style.width = `${width}px`;
      image.style.height = `${height}px`;
      stage.style.width = `${Math.max(size.width, width)}px`;
      stage.style.height = `${Math.max(size.height, height)}px`;
      if (center) {
        viewport.scrollLeft = center.x * Math.max(size.width, width) - viewport.clientWidth / 2;
        viewport.scrollTop = center.y * Math.max(size.height, height) - viewport.clientHeight / 2;
      } else {
        viewport.scrollLeft = 0;
        viewport.scrollTop = 0;
      }
      updateControls();
    }

    function setZoom(value, mode) {
      if (!ready || state !== 'open') return;
      const size = availableSize();
      const center = {
        x: (viewport.scrollLeft + viewport.clientWidth / 2) / Math.max(size.width, image.naturalWidth * zoom),
        y: (viewport.scrollTop + viewport.clientHeight / 2) / Math.max(size.height, image.naturalHeight * zoom),
      };
      zoom = Math.min(Math.max(4, fit), Math.max(fit, value));
      zoomMode = mode;
      renderZoom(mode === 'fit' ? null : center);
    }

    function finishLoading(version) {
      if (version !== loadVersion || state !== 'open' || ready ||
          !image.complete || !image.naturalWidth || !image.naturalHeight) return;
      ready = true;
      viewport.removeAttribute('aria-busy');
      measureFit();
      zoom = fit;
      zoomMode = 'fit';
      renderZoom();
    }

    function showScreenshot(index) {
      current = Math.max(0, Math.min(index, screenshots.length - 1));
      const source = screenshots[current];
      const version = ++loadVersion;
      ready = false;
      viewport.setAttribute('aria-busy', 'true');
      title.textContent = source.alt || 'Evidence screenshot';
      caption.textContent = getCaption(source);
      image.alt = source.alt || 'Evidence screenshot';
      image.style.removeProperty('width');
      image.style.removeProperty('height');
      stage.style.removeProperty('width');
      stage.style.removeProperty('height');
      viewport.scrollTop = 0;
      viewport.scrollLeft = 0;
      updateControls();
      image.onload = () => finishLoading(version);
      image.onerror = () => {
        if (version !== loadVersion || state !== 'open') return;
        viewport.removeAttribute('aria-busy');
        percentage.textContent = 'Unavailable';
        caption.textContent = `${getCaption(source)}. Image could not be loaded.`;
      };
      image.src = source.currentSrc || source.src;
      if (image.decode) {
        image.decode().then(() => finishLoading(version)).catch(() => {
          // load/error also covers browsers that reject decode prematurely.
          finishLoading(version);
        });
      }
      finishLoading(version);
    }

    function lockBackground() {
      bodyWasLocked = document.body.classList.contains('lightbox-open');
      Array.from(document.body.children).forEach((sibling) => {
        if (sibling === lightbox || sibling.contains(lightbox)) return;
        background.set(sibling, sibling.inert);
        sibling.inert = true;
      });
      document.body.classList.add('lightbox-open');
    }

    function open(index, trigger) {
      window.clearTimeout(exitTimer);
      exitTimer = null;
      if (entranceFrame !== null) window.cancelAnimationFrame(entranceFrame);
      if (state === 'closed') lockBackground();
      returnFocus = trigger;
      state = 'open';
      lightbox.hidden = false;
      lightbox.setAttribute('aria-hidden', 'false');
      showScreenshot(index);
      controls.close.focus({ preventScroll: true });
      // Commit the closed style before the next-frame opacity transition.
      void lightbox.offsetWidth;
      entranceFrame = window.requestAnimationFrame(() => {
        entranceFrame = null;
        if (state === 'open') lightbox.classList.add('open');
      });
    }

    function finishClose() {
      if (state !== 'closing') return;
      exitTimer = null;
      state = 'closed';
      lightbox.hidden = true;
      lightbox.setAttribute('aria-hidden', 'true');
      viewport.removeAttribute('aria-busy');
      image.onload = null;
      image.onerror = null;
      image.removeAttribute('src');
      background.forEach((wasInert, sibling) => { sibling.inert = wasInert; });
      background.clear();
      document.body.classList.toggle('lightbox-open', bodyWasLocked);
      if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
      returnFocus = null;
    }

    function close() {
      if (state !== 'open') return;
      state = 'closing';
      ++loadVersion;
      if (entranceFrame !== null) window.cancelAnimationFrame(entranceFrame);
      entranceFrame = null;
      lightbox.classList.remove('open');
      if (reduced.matches) finishClose();
      else exitTimer = window.setTimeout(finishClose, 200);
    }

    function perform(action) {
      if (state !== 'open' || controls[action]?.disabled) return;
      switch (action) {
        case 'previous': showScreenshot(current - 1); break;
        case 'next': showScreenshot(current + 1); break;
        case 'out': setZoom(zoom / 1.35, 'custom'); break;
        case 'in': setZoom(zoom * 1.35, 'custom'); break;
        case 'fit': setZoom(fit, 'fit'); break;
        case 'actual': setZoom(1, 'actual'); break;
        case 'close': close(); break;
      }
    }

    function focusableElements() {
      return Array.from(panel.querySelectorAll(
        'button,a[href],input,select,textarea,[tabindex]'
      )).filter((element) => !element.disabled && element.tabIndex >= 0 &&
        !element.closest('[hidden],[inert]') && element.getClientRects().length > 0);
    }

    function keepFocusUsable() {
      const active = document.activeElement;
      if (panel.contains(active) && active.disabled) controls.close.focus({ preventScroll: true });
    }

    actions.forEach((action) => {
      controls[action].addEventListener('click', () => {
        perform(action);
        keepFocusUsable();
      });
    });
    screenshots.forEach((source, index) => {
      let trigger = source.closest('button');
      if (!trigger) {
        // Do not introduce a nested interactive element around an existing link.
        if (source.closest('a[href]')) {
          console.warn('An evidence image inside a link needs a button wrapper in markup.', source);
          return;
        }
        trigger = document.createElement('button');
        trigger.type = 'button';
        source.before(trigger);
        trigger.append(source);
      }
      trigger.classList.add('evidence-trigger');
      trigger.type = 'button';
      trigger.setAttribute('aria-label', `Inspect ${source.alt || getCaption(source)}`);
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.setAttribute('aria-controls', lightbox.id);
      trigger.addEventListener('click', () => open(index, trigger));
    });

    lightbox.addEventListener('pointerdown', (event) => {
      backdropPressed = event.target === lightbox;
    });
    lightbox.addEventListener('pointercancel', () => { backdropPressed = false; });
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox && backdropPressed) close();
      backdropPressed = false;
    });
    document.addEventListener('focusin', (event) => {
      if (state !== 'closed' && !panel.contains(event.target)) {
        controls.close.focus({ preventScroll: true });
      }
    });
    document.addEventListener('keydown', (event) => {
      if (state === 'closed') return;
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === 'Tab') {
        const focusable = focusableElements();
        const first = focusable[0] || panel;
        const last = focusable[focusable.length - 1] || panel;
        const active = document.activeElement;
        if (event.shiftKey && (active === first || !focusable.includes(active))) {
          event.preventDefault();
          last.focus({ preventScroll: true });
        } else if (!event.shiftKey && (active === last || !focusable.includes(active))) {
          event.preventDefault();
          first.focus({ preventScroll: true });
        }
        return;
      }
      if (state !== 'open' || event.ctrlKey || event.metaKey || event.altKey ||
          event.target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])')) return;
      let action;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        if (event.shiftKey) return;
        if (viewport.contains(event.target) && ready && zoom > fit + epsilon) return;
        action = event.key === 'ArrowLeft' ? 'previous' : 'next';
      } else if (event.key === '+' || event.key === '=') action = 'in';
      else if (event.key === '-') action = 'out';
      else if (event.key === '0') action = 'fit';
      if (action) {
        event.preventDefault();
        perform(action);
        keepFocusUsable();
      }
    });

    const resize = () => {
      if (state !== 'open' || !ready) return;
      measureFit();
      if (zoomMode === 'fit') zoom = fit;
      else zoom = Math.min(Math.max(4, fit), Math.max(fit, zoom));
      renderZoom();
      keepFocusUsable();
    };
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(viewport);
    else window.addEventListener('resize', resize);
    const onPreferenceChange = () => {
      if (state === 'closing' && reduced.matches) {
        window.clearTimeout(exitTimer);
        finishClose();
      }
    };
    if (reduced.addEventListener) reduced.addEventListener('change', onPreferenceChange);
    else reduced.addListener(onPreferenceChange);
  } catch (error) {
    console.warn('Preview evidence viewer could not initialize.', error);
  }
})();
