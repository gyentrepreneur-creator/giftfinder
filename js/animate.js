/* ──────────────────────────────────────────────
   Kadoizi — animate.js
   Gère les animations au scroll (IntersectionObserver)
   + effet confetti sur la page résultats
   ────────────────────────────────────────────── */

(function () {
  'use strict';

  // ── 1. ANIMATIONS AU SCROLL ──────────────────
  // Tout élément avec .anim-fade-up, .anim-scale-up, etc.
  // reçoit .anim-visible quand il entre dans le viewport.

  function initScrollAnimations() {
    var animatedEls = document.querySelectorAll(
      '.anim-fade-up, .anim-fade-in, .anim-scale-up, .anim-slide-left, .anim-slide-right'
    );

    if (!animatedEls.length) return;

    // Si IntersectionObserver n'est pas supporté → tout afficher direct
    if (!('IntersectionObserver' in window)) {
      animatedEls.forEach(function (el) { el.classList.add('anim-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('anim-visible');
          observer.unobserve(entry.target); // une seule fois
        }
      });
    }, {
      threshold: 0.15,     // déclenche quand 15% de l'élément est visible
      rootMargin: '0px 0px -40px 0px'  // un peu avant le bas du viewport
    });

    animatedEls.forEach(function (el) { observer.observe(el); });
  }

  // ── 2. ANIMATIONS HERO (au chargement) ──────────
  // Les éléments .anim-hero sont animés dès le chargement (pas au scroll)
  function initHeroAnimations() {
    var heroEls = document.querySelectorAll('.anim-hero');
    if (!heroEls.length) return;

    // Petit délai pour que le CSS se charge
    requestAnimationFrame(function () {
      setTimeout(function () {
        heroEls.forEach(function (el) {
          el.classList.add('anim-visible');
        });
      }, 100);
    });
  }

  // ── 3. EFFET CONFETTI (page résultats) ─────────
  // Appelé quand les résultats s'affichent
  window.triggerConfetti = function () {
    var container = document.createElement('div');
    container.className = 'sparkle-container';
    document.body.appendChild(container);

    var colors = ['#3C3489', '#D4537E', '#1D9E75', '#EF9F27', '#7F77DD', '#FBEAF0'];
    var shapes = ['circle', 'square'];

    for (var i = 0; i < 40; i++) {
      var sparkle = document.createElement('div');
      sparkle.className = 'sparkle';

      var color = colors[Math.floor(Math.random() * colors.length)];
      var shape = shapes[Math.floor(Math.random() * shapes.length)];
      var size = 4 + Math.random() * 8;
      var left = 10 + Math.random() * 80; // 10%-90% de la largeur
      var delay = Math.random() * 0.6;
      var duration = 1.2 + Math.random() * 1.2;

      sparkle.style.cssText =
        'left:' + left + '%;' +
        'top:-10px;' +
        'width:' + size + 'px;' +
        'height:' + size + 'px;' +
        'background:' + color + ';' +
        'border-radius:' + (shape === 'circle' ? '50%' : '2px') + ';' +
        'animation-delay:' + delay + 's;' +
        'animation-duration:' + duration + 's;';

      container.appendChild(sparkle);
    }

    // Nettoyer après l'animation
    setTimeout(function () {
      container.remove();
    }, 3000);
  };

  // ── 4. ANIMATION DES CARTES RÉSULTATS ──────────
  // Ajoute .anim-card + .anim-visible en cascade aux cartes
  window.animateResultCards = function () {
    var cards = document.querySelectorAll('.r-card');
    if (!cards.length) return;

    cards.forEach(function (card) {
      card.classList.add('anim-card');
    });

    // Petit délai puis déclencher
    requestAnimationFrame(function () {
      setTimeout(function () {
        cards.forEach(function (card) {
          card.classList.add('anim-visible');
        });
        // Confetti après les cartes
        setTimeout(function () {
          window.triggerConfetti();
        }, 400);
      }, 100);
    });
  };

  // ── 5. INIT ────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initHeroAnimations();
      initScrollAnimations();
    });
  } else {
    initHeroAnimations();
    initScrollAnimations();
  }
})();
