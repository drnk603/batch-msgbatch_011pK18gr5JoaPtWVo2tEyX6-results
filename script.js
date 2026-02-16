(function() {
  'use strict';

  const App = {
    elements: {},
    state: {
      cookiesAccepted: false,
      formSubmitting: false,
      burgerMenuOpen: false
    },

    init() {
      this.cacheElements();
      this.bindEvents();
      this.initCookieConsent();
      this.initScrollSpy();
      this.initCountUp();
      this.checkConnection();
    },

    cacheElements() {
      this.elements = {
        burgerToggle: document.querySelector('.navbar-toggler'),
        navCollapse: document.querySelector('.navbar-collapse'),
        navLinks: document.querySelectorAll('.nav-link'),
        cookieConsent: document.getElementById('cookieConsent'),
        acceptCookies: document.getElementById('acceptCookies'),
        declineCookies: document.getElementById('declineCookies'),
        contactForm: document.getElementById('contactForm'),
        pollForm: document.getElementById('pollForm'),
        scrollTopBtn: document.querySelector('[data-scroll-top]'),
        body: document.body
      };
    },

    bindEvents() {
      if (this.elements.burgerToggle) {
        this.elements.burgerToggle.addEventListener('click', this.toggleBurgerMenu.bind(this));
      }

      if (this.elements.navLinks.length > 0) {
        this.elements.navLinks.forEach(link => {
          link.addEventListener('click', this.handleNavClick.bind(this));
        });
      }

      if (this.elements.acceptCookies) {
        this.elements.acceptCookies.addEventListener('click', this.acceptCookies.bind(this));
      }

      if (this.elements.declineCookies) {
        this.elements.declineCookies.addEventListener('click', this.declineCookies.bind(this));
      }

      if (this.elements.contactForm) {
        this.elements.contactForm.addEventListener('submit', this.handleContactFormSubmit.bind(this));
      }

      if (this.elements.pollForm) {
        this.elements.pollForm.addEventListener('submit', this.handlePollFormSubmit.bind(this));
      }

      if (this.elements.scrollTopBtn) {
        this.elements.scrollTopBtn.addEventListener('click', this.scrollToTop.bind(this));
      }

      window.addEventListener('scroll', this.handleScroll.bind(this));
      window.addEventListener('resize', this.handleResize.bind(this));

      document.addEventListener('click', this.handleOutsideClick.bind(this));
    },

    toggleBurgerMenu(e) {
      if (e) e.preventDefault();

      this.state.burgerMenuOpen = !this.state.burgerMenuOpen;

      if (this.elements.burgerToggle) {
        this.elements.burgerToggle.setAttribute('aria-expanded', this.state.burgerMenuOpen);
      }

      if (this.elements.navCollapse) {
        if (this.state.burgerMenuOpen) {
          this.elements.navCollapse.classList.add('show');
          this.elements.body.classList.add('menu-open');
        } else {
          this.elements.navCollapse.classList.remove('show');
          this.elements.body.classList.remove('menu-open');
        }
      }
    },

    closeBurgerMenu() {
      if (this.state.burgerMenuOpen) {
        this.state.burgerMenuOpen = false;

        if (this.elements.burgerToggle) {
          this.elements.burgerToggle.setAttribute('aria-expanded', 'false');
        }

        if (this.elements.navCollapse) {
          this.elements.navCollapse.classList.remove('show');
          this.elements.body.classList.remove('menu-open');
        }
      }
    },

    handleNavClick(e) {
      const href = e.currentTarget.getAttribute('href');

      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetEl = document.getElementById(targetId);

        if (targetEl) {
          this.closeBurgerMenu();
          this.smoothScrollTo(targetEl);
        }
      } else {
        this.closeBurgerMenu();
      }
    },

    smoothScrollTo(element) {
      const headerOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset - 16;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    },

    handleOutsideClick(e) {
      if (this.state.burgerMenuOpen &&
          this.elements.navCollapse &&
          !this.elements.navCollapse.contains(e.target) &&
          !this.elements.burgerToggle.contains(e.target)) {
        this.closeBurgerMenu();
      }
    },

    handleResize() {
      if (window.innerWidth >= 768 && this.state.burgerMenuOpen) {
        this.closeBurgerMenu();
      }
    },

    initCookieConsent() {
      const consent = localStorage.getItem('cookieConsent');
      
      if (!consent && this.elements.cookieConsent) {
        this.elements.cookieConsent.classList.add('is-visible');
      }
    },

    acceptCookies() {
      localStorage.setItem('cookieConsent', 'accepted');
      this.state.cookiesAccepted = true;

      if (this.elements.cookieConsent) {
        this.elements.cookieConsent.classList.remove('is-visible');
      }
    },

    declineCookies() {
      localStorage.setItem('cookieConsent', 'declined');

      if (this.elements.cookieConsent) {
        this.elements.cookieConsent.classList.remove('is-visible');
      }
    },

    handleContactFormSubmit(e) {
      e.preventDefault();

      if (this.state.formSubmitting) return;

      const formData = this.getFormData(this.elements.contactForm);
      const errors = this.validateContactForm(formData);

      this.clearFormErrors(this.elements.contactForm);

      if (Object.keys(errors).length > 0) {
        this.displayFormErrors(this.elements.contactForm, errors);
        return;
      }

      this.submitForm(this.elements.contactForm);
    },

    handlePollFormSubmit(e) {
      e.preventDefault();

      if (this.state.formSubmitting) return;

      const formData = this.getFormData(this.elements.pollForm);
      const errors = this.validatePollForm(formData);

      this.clearFormErrors(this.elements.pollForm);

      if (Object.keys(errors).length > 0) {
        this.displayFormErrors(this.elements.pollForm, errors);
        return;
      }

      this.submitForm(this.elements.pollForm);
    },

    getFormData(form) {
      const formData = new FormData(form);
      const data = {};

      for (let [key, value] of formData.entries()) {
        data[key] = value;
      }

      return data;
    },

    validateContactForm(data) {
      const errors = {};
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!data.firstName || data.firstName.trim().length < 2) {
        errors.firstName = 'Vorname muss mindestens 2 Zeichen enthalten';
      }

      if (!data.lastName || data.lastName.trim().length < 2) {
        errors.lastName = 'Nachname muss mindestens 2 Zeichen enthalten';
      }

      if (!data.email || !emailPattern.test(data.email.trim())) {
        errors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
      }

      if (!data.subject || data.subject.trim().length < 3) {
        errors.subject = 'Betreff muss mindestens 3 Zeichen enthalten';
      }

      if (!data.message || data.message.trim().length < 10) {
        errors.message = 'Nachricht muss mindestens 10 Zeichen enthalten';
      }

      if (!data.privacyConsent) {
        errors.privacyConsent = 'Sie müssen der Datenschutzerklärung zustimmen';
      }

      return errors;
    },

    validatePollForm(data) {
      const errors = {};

      if (!data.challenge) {
        errors.challenge = 'Bitte wählen Sie eine Option aus';
      }

      return errors;
    },

    displayFormErrors(form, errors) {
      Object.keys(errors).forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        
        if (field) {
          field.classList.add('is-invalid');

          let feedbackEl = field.parentElement.querySelector('.invalid-feedback');
          
          if (!feedbackEl) {
            feedbackEl = document.createElement('div');
            feedbackEl.className = 'invalid-feedback';
            field.parentElement.appendChild(feedbackEl);
          }

          feedbackEl.textContent = errors[fieldName];
        }
      });

      const firstErrorField = form.querySelector('.is-invalid');
      if (firstErrorField) {
        firstErrorField.focus();
      }
    },

    clearFormErrors(form) {
      const invalidFields = form.querySelectorAll('.is-invalid');
      invalidFields.forEach(field => {
        field.classList.remove('is-invalid');
      });

      const feedbackElements = form.querySelectorAll('.invalid-feedback');
      feedbackElements.forEach(el => {
        el.textContent = '';
      });
    },

    submitForm(form) {
      this.state.formSubmitting = true;

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Wird gesendet...';
      }

      setTimeout(() => {
        this.state.formSubmitting = false;

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }

        window.location.href = 'thank_you.html';
      }, 1500);
    },

    initScrollSpy() {
      const sections = document.querySelectorAll('section[id]');
      
      if (sections.length === 0) return;

      window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset + 120;

        sections.forEach(section => {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          const sectionId = section.getAttribute('id');

          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            this.elements.navLinks.forEach(link => {
              link.classList.remove('active');
              link.removeAttribute('aria-current');

              if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
              }
            });
          }
        });
      });
    },

    initCountUp() {
      const counters = document.querySelectorAll('[data-count-up]');
      
      if (counters.length === 0) return;

      const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            this.animateCounter(entry.target);
            entry.target.classList.add('counted');
          }
        });
      }, observerOptions);

      counters.forEach(counter => observer.observe(counter));
    },

    animateCounter(element) {
      const target = parseInt(element.getAttribute('data-count-up')) || 0;
      const duration = 2000;
      const increment = target / (duration / 16);
      let current = 0;

      const updateCounter = () => {
        current += increment;
        
        if (current < target) {
          element.textContent = Math.floor(current);
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent = target;
        }
      };

      updateCounter();
    },

    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },

    handleScroll() {
      if (this.elements.scrollTopBtn) {
        if (window.pageYOffset > 300) {
          this.elements.scrollTopBtn.classList.add('is-visible');
        } else {
          this.elements.scrollTopBtn.classList.remove('is-visible');
        }
      }
    },

    checkConnection() {
      if (!navigator.onLine) {
        this.showNotification('Keine Internetverbindung. Bitte versuchen Sie es später erneut.', 'warning');
      }

      window.addEventListener('online', () => {
        this.showNotification('Verbindung wiederhergestellt', 'success');
      });

      window.addEventListener('offline', () => {
        this.showNotification('Verbindung unterbrochen', 'warning');
      });
    },

    showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `alert alert-${type}`;
      notification.textContent = message;
      notification.setAttribute('role', 'alert');

      const container = document.querySelector('.container');
      if (container) {
        container.insertBefore(notification, container.firstChild);

        setTimeout(() => {
          notification.remove();
        }, 5000);
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }

})();