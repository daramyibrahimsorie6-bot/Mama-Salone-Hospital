/* =========================================================
   MAMA SALONE HOSPITAL — GLOBAL JAVASCRIPT
   File: assets/js/main.js
   ---------------------------------------------------------
   CONTENTS
   01. Utilities
   02. Navbar scroll shrink
   03. Footer year
   04. AOS init
   05. GSAP hero & logo entrance
   06. Count-up statistics
   07. Swiper testimonials
   08. Appointment form validation + submit
   09. Toast helper
   10. Pre-fill department from URL (?service=)
   11. Smooth anchor scrolling (fallback)
   12. Reduce-motion awareness
   ========================================================= */

(function () {
    'use strict';

    /* ---------------------------------------------------------
       01. UTILITIES
       --------------------------------------------------------- */
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    const prefersReducedMotion =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;


    /* ---------------------------------------------------------
       02. NAVBAR SCROLL SHRINK
       --------------------------------------------------------- */
    function initNavbar() {
        const nav = $('#siteNav');
        if (!nav) return;

        const onScroll = () => {
            if (window.scrollY > 60) nav.classList.add('scrolled');
            else nav.classList.remove('scrolled');
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }


    /* ---------------------------------------------------------
       03. FOOTER YEAR (auto updates)
       --------------------------------------------------------- */
    function initYear() {
        const el = $('#year');
        if (el) el.textContent = new Date().getFullYear();
    }


    /* ---------------------------------------------------------
       04. AOS INIT
       --------------------------------------------------------- */
    function initAOS() {
        if (typeof AOS === 'undefined') return;

        AOS.init({
            duration: 500,
            easing: 'ease-out-cubic',
            once: true,
            offset: 60,
            disable: prefersReducedMotion
        });
    }


    /* ---------------------------------------------------------
       05. GSAP HERO & LOGO ENTRANCE
       --------------------------------------------------------- */
    function initGSAPEntrance() {
        if (typeof gsap === 'undefined' || prefersReducedMotion) return;

        // Logo mark gentle rotate + fade
        const brandMark = $('.navbar-brand .brand-mark');
        if (brandMark) {
            gsap.from(brandMark, {
                opacity: 0,
                scale: 0.6,
                rotate: -35,
                duration: 0.9,
                ease: 'back.out(1.6)',
                delay: 0.1
            });
        }

        // Brand text fade up
        const brandText = $('.navbar-brand .brand-text');
        if (brandText) {
            gsap.from(brandText, {
                opacity: 0,
                x: -12,
                duration: 0.7,
                ease: 'power2.out',
                delay: 0.25
            });
        }

        // Hero headline (words fade in sequence)
        const heroTitle = $('.hero-title');
        if (heroTitle) {
            gsap.from(heroTitle, {
                opacity: 0,
                y: 26,
                duration: 0.85,
                ease: 'power3.out',
                delay: 0.2
            });
        }

        // Hero supporting elements
        const heroStagger = $$('.hero-badges, .hero-sub, .hero-cta, .hero-trust');
        if (heroStagger.length) {
            gsap.from(heroStagger, {
                opacity: 0,
                y: 18,
                duration: 0.7,
                ease: 'power2.out',
                stagger: 0.12,
                delay: 0.4
            });
        }

        // Hero image gentle rise
        const heroVisual = $('.hero-visual');
        if (heroVisual) {
            gsap.from(heroVisual, {
                opacity: 0,
                y: 30,
                scale: 0.97,
                duration: 0.9,
                ease: 'power3.out',
                delay: 0.3
            });
        }

        // Subtle micro-interaction: CTA buttons "breath" once
        const primaryCta = $('.hero-cta .btn-accent');
        if (primaryCta) {
            gsap.fromTo(primaryCta,
                { boxShadow: '0 0 0 0 rgba(245,166,35,0.55)' },
                {
                    boxShadow: '0 0 0 14px rgba(245,166,35,0)',
                    duration: 1.2,
                    ease: 'power2.out',
                    delay: 1.1
                }
            );
        }
    }


    /* ---------------------------------------------------------
       06. COUNT-UP STATISTICS
       Uses data-count and data-suffix on .stat-num
       --------------------------------------------------------- */
    function initCountUp() {
        const counters = $$('.stat-num');
        if (!counters.length) return;

        const animate = (el) => {
            const target = parseFloat(el.dataset.count || '0');
            const suffix = el.dataset.suffix || '';
            const duration = 1400;
            const start = performance.now();

            // Format numbers with thousands separators, e.g. 20,000
            const format = (n) => {
                const rounded = Math.round(n);
                return rounded.toLocaleString('en-US') + suffix;
            };

            const tick = (now) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                // Ease-out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = format(target * eased);

                if (progress < 1) requestAnimationFrame(tick);
                else el.textContent = format(target);
            };

            if (prefersReducedMotion) {
                el.textContent = format(target);
            } else {
                requestAnimationFrame(tick);
            }
        };

        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        animate(entry.target);
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.4 });

            counters.forEach((c) => io.observe(c));
        } else {
            counters.forEach(animate);
        }
    }


    /* ---------------------------------------------------------
       07. SWIPER TESTIMONIALS
       --------------------------------------------------------- */
    function initTestimonials() {
        if (typeof Swiper === 'undefined') return;
        const el = $('.testimonial-swiper');
        if (!el) return;

        new Swiper(el, {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            grabCursor: true,
            autoHeight: true,
            autoplay: prefersReducedMotion ? false : {
                delay: 6500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            },
            pagination: {
                el: '.testimonial-swiper .swiper-pagination',
                clickable: true
            },
            breakpoints: {
                768: { slidesPerView: 2, spaceBetween: 24 },
                1200: { slidesPerView: 3, spaceBetween: 26 }
            },
            a11y: {
                prevSlideMessage: 'Previous testimonial',
                nextSlideMessage: 'Next testimonial'
            }
        });
    }


     /* ---------------------------------------------------------
     08. APPOINTMENT FORM VALIDATION + SUBMIT
     Submits to Formspree via fetch; falls back to native POST
     if JavaScript is unavailable.
     --------------------------------------------------------- */
  function initAppointmentForm() {
    const form = $('#appointmentForm');
    if (!form) return;

    const submitBtn  = $('#submitBtn');
    const successBox = $('#formSuccess');

    /* Formspree endpoint — mirrors the form's action attribute */
    const FORM_ENDPOINT = 'https://formspree.io/f/mwlpobda';

    // Prevent selecting a past date
    const dateInput = $('#date');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }

    // Bootstrap-style validation on blur/input
    const validateField = (field) => {
      const valid = field.checkValidity();
      field.classList.toggle('is-invalid', !valid);
      field.classList.toggle('is-valid', valid && field.value.trim() !== '');
      return valid;
    };

    $$('input, select, textarea', form).forEach((field) => {
      if (field.type === 'hidden' || field.name === 'website') return;
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('is-invalid')) validateField(field);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // --- Validate every required field ---
      let allValid = true;
      let firstInvalid = null;

      $$('input, select, textarea', form).forEach((field) => {
        if (field.name === 'website') return;
        if (field.type === 'hidden') return;

        const ok = validateField(field);
        if (!ok) {
          allValid = false;
          if (!firstInvalid) firstInvalid = field;
        }
      });

      // --- Honeypot: bots fill this, humans don't ---
      const honeypot = form.querySelector('[name="website"]');
      if (honeypot && honeypot.value.trim() !== '') {
        // Pretend success to fool the bot; nothing is sent.
        showSuccess();
        form.reset();
        return;
      }

      if (!allValid) {
        showToast('Please check the highlighted fields.', 'error');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // --- Submit to Formspree ---
      setLoading(true);

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      })
        .then(async (res) => {
          setLoading(false);

          if (res.ok) {
            showSuccess();
            form.reset();
            $$('.is-valid, .is-invalid', form).forEach((el) => {
              el.classList.remove('is-valid', 'is-invalid');
            });
            return;
          }

          // Formspree returned an error — try to surface the details
          let topLevelError = 'Something went wrong. Please call us instead.';

          try {
            const data = await res.json();
            if (data && Array.isArray(data.errors) && data.errors.length) {
              data.errors.forEach((err) => {
                if (err.field) {
                  const field = form.querySelector(`[name="${err.field}"]`);
                  if (field) {
                    field.classList.add('is-invalid');
                    const feedback = field.parentElement
                      ? field.parentElement.querySelector('.invalid-feedback')
                      : null;
                    if (feedback) feedback.textContent = err.message;
                  }
                } else if (err.message) {
                  topLevelError = err.message;
                }
              });

              const firstErr = form.querySelector('.is-invalid');
              if (firstErr) firstErr.focus();
            }
          } catch (_) {
            /* Response body wasn't JSON — keep the generic message */
          }

          showToast(topLevelError, 'error');
        })
        .catch(() => {
          setLoading(false);
          showToast(
            'Network error. Please check your connection or call us directly.',
            'error'
          );
        });
    });

    /* ---- Helpers ---- */

    function setLoading(isLoading) {
      if (!submitBtn) return;
      if (isLoading) {
        submitBtn.dataset.originalHtml = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML =
          '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending…';
      } else {
        submitBtn.disabled = false;
        if (submitBtn.dataset.originalHtml) {
          submitBtn.innerHTML = submitBtn.dataset.originalHtml;
        }
      }
    }

    function showSuccess() {
      if (successBox) {
        successBox.classList.remove('d-none');
        successBox.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'center'
        });
      }
      showToast('Thank you! Your appointment request has been received.', 'success');
    }
  }

    /* ---------------------------------------------------------
       09. TOAST HELPER
       --------------------------------------------------------- */
    function showToast(message, variant = 'success') {
        const host = $('#toastArea');
        if (!host || typeof bootstrap === 'undefined') return;

        const icon = variant === 'success'
            ? 'bi-check-circle-fill'
            : 'bi-exclamation-triangle-fill';

        const title = variant === 'success' ? 'Success' : 'Please note';

        const wrapper = document.createElement('div');
        wrapper.className = `toast toast-${variant} align-items-center`;
        wrapper.setAttribute('role', 'alert');
        wrapper.setAttribute('aria-live', 'assertive');
        wrapper.setAttribute('aria-atomic', 'true');

        wrapper.innerHTML = `
      <div class="toast-header">
        <i class="bi ${icon} me-2" aria-hidden="true"></i>
        <strong class="me-auto">${title}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">${message}</div>
    `;

        host.appendChild(wrapper);

        const toast = new bootstrap.Toast(wrapper, { delay: 5000 });
        toast.show();

        wrapper.addEventListener('hidden.bs.toast', () => wrapper.remove());
    }


    /* ---------------------------------------------------------
       10. PRE-FILL DEPARTMENT FROM ?service=xxx
       --------------------------------------------------------- */
    function initServicePrefill() {
        const select = $('#department');
        if (!select) return;

        const params = new URLSearchParams(window.location.search);
        const service = params.get('service');
        if (!service) return;

        const option = select.querySelector(`option[value="${service}"]`);
        if (option) {
            select.value = service;
            select.classList.add('is-valid');
        }
    }


    /* ---------------------------------------------------------
       11. SMOOTH ANCHOR SCROLLING (fallback for older browsers)
       --------------------------------------------------------- */
    function initSmoothAnchors() {
        if (prefersReducedMotion) return;

        $$('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', (e) => {
                const id = link.getAttribute('href');
                if (!id || id === '#') return;

                const target = document.querySelector(id);
                if (!target) return;

                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });

                // Update the URL hash without jumping
                history.pushState(null, '', id);
            });
        });
    }


    /* ---------------------------------------------------------
       12. REDUCE-MOTION AWARENESS
       If the user changes their motion preference live, disable AOS.
       --------------------------------------------------------- */
    function watchReducedMotion() {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        mq.addEventListener?.('change', (e) => {
            if (e.matches && typeof AOS !== 'undefined') {
                AOS.refreshHard();
            }
        });
    }


    /* ---------------------------------------------------------
       BOOT
       --------------------------------------------------------- */
    function boot() {
        initNavbar();
        initYear();
        initAOS();
        initGSAPEntrance();
        initCountUp();
        initTestimonials();
        initAppointmentForm();
        initServicePrefill();
        initSmoothAnchors();
        watchReducedMotion();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

})();