(() => {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Nav: glassy on scroll + mobile menu ---------- */
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  document.querySelectorAll('.nav__menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Count-up stats ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const countUp = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('en');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window && !reduceMotion) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          countUp(entry.target);
          co.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => co.observe(el));
  } else {
    counters.forEach((el) => { el.textContent = Number(el.dataset.count).toLocaleString('en'); });
  }

  /* ---------- Contact form ---------- */
  const form = document.getElementById('contact-form');
  const success = form.querySelector('.form__success');
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const validate = () => {
    let valid = true;
    form.querySelectorAll('.field').forEach((field) => {
      const input = field.querySelector('input, textarea');
      if (!input.required) return;
      const value = input.value.trim();
      const ok = input.type === 'email' ? emailOk(value) : value.length > 0;
      field.classList.toggle('has-error', !ok);
      if (!ok) valid = false;
    });
    const consent = form.querySelector('.consent');
    const consentOk = consent.querySelector('input').checked;
    consent.classList.toggle('has-error', !consentOk);
    return valid && consentOk;
  };

  form.addEventListener('input', (e) => {
    const field = e.target.closest('.field, .consent');
    if (field) field.classList.remove('has-error');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) {
      const firstError = form.querySelector('.has-error input, .has-error textarea');
      if (firstError) firstError.focus();
      return;
    }

    form.classList.add('is-sending');
    const label = form.querySelector('.btn__label');
    label.textContent = 'Sending…';

    try {
      const endpoint = form.dataset.endpoint;
      if (endpoint) {
        const res = await fetch(endpoint, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error('Request failed');
      } else {
        // No endpoint configured yet, so simulate a gentle send for the demo
        await new Promise((r) => setTimeout(r, 900));
      }
      success.hidden = false;
      form.reset();
    } catch {
      label.textContent = 'Something went wrong. Please try again';
      setTimeout(() => { label.textContent = 'Send with love'; }, 3500);
      return;
    } finally {
      form.classList.remove('is-sending');
    }
    label.textContent = 'Send with love';
  });

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
