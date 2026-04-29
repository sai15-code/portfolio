/* 

JavaScript Document

TemplateMo 615 Amber Folio

https://templatemo.com/tm-615-amber-folio

*/

// Coverflow Class
class PhotoCoverflow {
   constructor() {
      this.items = document.querySelectorAll('.coverflow-item');
      this.indicators = document.querySelectorAll('.indicator');
      this.currentIndex = 2; // Start with middle item
      this.totalItems = this.items.length;
      this.isPlaying = false;
      this.autoPlayInterval = null;
      this.autoPlaySpeed = 4000;

      this.init();
   }

   init() {
      this.updateCoverflow();
      this.bindEvents();
   }

   // Compute all layout values from current viewport in one place
   getLayoutConfig() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // ── Breakpoint flags ──────────────────────────────────────
      const isVerySmall   = vw <= 360;
      const isSmallMobile = vw <= 480;
      const isMobile      = vw <= 768;
      const isTablet      = vw <= 1024;
      const isLandscape   = vw <= 900 && vh <= 520 && window.matchMedia('(orientation: landscape)').matches;
      const isTallScreen  = vh > 900;
      const isShortScreen = vh < 700;

      // ── Base spacing (horizontal gap between card centres) ────
      let baseSpacing;
      if (isVerySmall)        baseSpacing = 100;
      else if (isSmallMobile) baseSpacing = 120;
      else if (isMobile)      baseSpacing = 150;
      else if (isTablet)      baseSpacing = 190;
      else if (isTallScreen)  baseSpacing = 260;
      else if (isShortScreen) baseSpacing = 170;
      else                    baseSpacing = 220;

      // Landscape override wins if it matches
      if (isLandscape) baseSpacing = 110;

      // ── Scale per position offset ──────────────────────────────
      const centerScale   = isMobile ? 1.05 : 1.1;
      const adj1Scale     = isMobile ? 0.80 : 0.85;
      const adj2Scale     = isMobile ? 0.65 : 0.70;
      const adj3Scale     = isMobile ? 0.55 : 0.60;
      const farScale      = isMobile ? 0.45 : 0.50;

      // ── rotateY per offset ─────────────────────────────────────
      const rotateY1 = isMobile ? 35 : 40;
      const rotateY2 = isMobile ? 42 : 50;
      const rotateY3 = isMobile ? 50 : 60;
      const rotateYFar = isMobile ? 60 : 70;

      // ── translateZ per offset ──────────────────────────────────
      const tz0   =  100;
      const tz1   =    0;
      const tz2   = -100;
      const tz3   = -150;
      const tzFar = -200;

      return {
         baseSpacing,
         centerScale, adj1Scale, adj2Scale, adj3Scale, farScale,
         rotateY1, rotateY2, rotateY3, rotateYFar,
         tz0, tz1, tz2, tz3, tzFar
      };
   }

   bindEvents() {
      // Navigation buttons
      document.getElementById('prevBtn').addEventListener('click', () => this.prev());
      document.getElementById('nextBtn').addEventListener('click', () => this.next());
      document.getElementById('playPauseBtn').addEventListener('click', () => this.toggleAutoPlay());

      // Indicator clicks
      this.indicators.forEach((indicator, index) => {
         indicator.addEventListener('click', () => this.goTo(index));
      });

      // Item clicks
      this.items.forEach((item, index) => {
         item.addEventListener('click', () => {
            if (index === this.currentIndex) {
               console.log('Center item clicked');
            } else {
               this.goTo(index);
            }
         });
      });

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
         if (e.key === 'ArrowLeft')  this.prev();
         if (e.key === 'ArrowRight') this.next();
         if (e.key === ' ') {
            e.preventDefault();
            this.toggleAutoPlay();
         }
      });

      // Touch / swipe support
      let startX = 0;
      let startY = 0;
      const container = document.getElementById('coverflowContainer');

      container.addEventListener('touchstart', (e) => {
         startX = e.touches[0].clientX;
         startY = e.touches[0].clientY;
      }, { passive: true });

      container.addEventListener('touchend', (e) => {
         if (!startX || !startY) return;
         const endX   = e.changedTouches[0].clientX;
         const endY   = e.changedTouches[0].clientY;
         const diffX  = startX - endX;
         const diffY  = startY - endY;

         if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
            diffX > 0 ? this.next() : this.prev();
         }
         startX = 0;
         startY = 0;
      }, { passive: true });

      // Resize — debounced, recalculates layout on both width AND height changes
      let resizeTimer;
      window.addEventListener('resize', () => {
         clearTimeout(resizeTimer);
         resizeTimer = setTimeout(() => this.updateCoverflow(), 120);
      });

      // Also catch orientation change (fires before resize on some devices)
      window.addEventListener('orientationchange', () => {
         // Wait for the browser to finish the rotation transition
         setTimeout(() => this.updateCoverflow(), 300);
      });
   }

   updateCoverflow() {
      const cfg = this.getLayoutConfig();

      this.items.forEach((item, index) => {
         let offset = index - this.currentIndex;

         // Wrap offset for looping
         if (offset >  this.totalItems / 2) offset -= this.totalItems;
         if (offset < -this.totalItems / 2) offset += this.totalItems;

         const absOffset = Math.abs(offset);
         let translateX, translateZ, rotateY, scale, opacity;

         if (absOffset === 0) {
            translateX = 0;
            translateZ = cfg.tz0;
            rotateY    = 0;
            scale      = cfg.centerScale;
            opacity    = 1;
         } else if (absOffset === 1) {
            translateX = offset * cfg.baseSpacing;
            translateZ = cfg.tz1;
            rotateY    = offset * -cfg.rotateY1;
            scale      = cfg.adj1Scale;
            opacity    = 0.7;
         } else if (absOffset === 2) {
            translateX = offset * cfg.baseSpacing;
            translateZ = cfg.tz2;
            rotateY    = offset * -cfg.rotateY2;
            scale      = cfg.adj2Scale;
            opacity    = 0.5;
         } else if (absOffset === 3) {
            translateX = offset * cfg.baseSpacing;
            translateZ = cfg.tz3;
            rotateY    = offset * -cfg.rotateY3;
            scale      = cfg.adj3Scale;
            opacity    = 0.3;
         } else {
            translateX = offset * cfg.baseSpacing;
            translateZ = cfg.tzFar;
            rotateY    = offset * -cfg.rotateYFar;
            scale      = cfg.farScale;
            opacity    = 0.15;
         }

         item.style.transform = `
            translate(-50%, -50%)
            translateX(${translateX}px)
            translateZ(${translateZ}px)
            rotateY(${rotateY}deg)
            scale(${scale})
         `;
         item.style.opacity = opacity;
         item.style.zIndex  = this.totalItems - absOffset;
      });

      // Sync indicators
      this.indicators.forEach((indicator, index) => {
         indicator.classList.toggle('active', index === this.currentIndex);
      });
   }

   toggleAutoPlay() {
      const btn = document.getElementById('playPauseBtn');
      if (this.isPlaying) {
         this.stopAutoPlay();
         btn.innerHTML = '▶';
         btn.classList.remove('playing');
      } else {
         this.startAutoPlay();
         btn.innerHTML = '❚❚';
         btn.classList.add('playing');
      }
   }

   startAutoPlay() {
      this.isPlaying = true;
      this.autoPlayInterval = setInterval(() => this.next(), this.autoPlaySpeed);
   }

   stopAutoPlay() {
      this.isPlaying = false;
      if (this.autoPlayInterval) {
         clearInterval(this.autoPlayInterval);
         this.autoPlayInterval = null;
      }
   }

   prev() {
      this.currentIndex = (this.currentIndex - 1 + this.totalItems) % this.totalItems;
      this.updateCoverflow();
   }

   next() {
      this.currentIndex = (this.currentIndex + 1) % this.totalItems;
      this.updateCoverflow();
   }

   goTo(index) {
      this.currentIndex = index;
      this.updateCoverflow();
   }
}

// ── Bootstrap everything after DOM is ready ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

   // Coverflow
   new PhotoCoverflow();

   // Loading screen
   setTimeout(() => {
      const ls = document.getElementById('loadingScreen');
      if (ls) ls.classList.add('hidden');
   }, 1000);

   // Header shrink on scroll
   const header = document.getElementById('header');
   window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
   }, { passive: true });

   // Mobile menu toggle
   const menuToggle = document.getElementById('menuToggle');
   const navMenu    = document.getElementById('navMenu');

   menuToggle.addEventListener('click', () => {
      const open = menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active', open);
      // Prevent body scroll while menu is open
      document.body.style.overflow = open ? 'hidden' : '';
   });

   // Close menu on link click
   document.querySelectorAll('.nav-menu a').forEach(link => {
      link.addEventListener('click', () => {
         menuToggle.classList.remove('active');
         navMenu.classList.remove('active');
         document.body.style.overflow = '';
      });
   });

   // Close menu when clicking outside (tap on overlay)
   navMenu.addEventListener('click', (e) => {
      if (e.target === navMenu) {
         menuToggle.classList.remove('active');
         navMenu.classList.remove('active');
         document.body.style.overflow = '';
      }
   });

   // Smooth scrolling for anchor links
   document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
         e.preventDefault();
         const target = document.querySelector(this.getAttribute('href'));
         if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
         }
      });
   });

   // Active nav highlight on scroll
   const sections = document.querySelectorAll('section[id]');
   const navLinks = document.querySelectorAll('.nav-menu a');

   const highlightNav = () => {
      let current = '';
      sections.forEach(section => {
         if (window.pageYOffset >= section.offsetTop - 200) {
            current = section.getAttribute('id');
         }
      });
      navLinks.forEach(link => {
         link.classList.toggle('active', link.getAttribute('href').slice(1) === current);
      });
   };

   window.addEventListener('scroll', highlightNav, { passive: true });

   // Reveal animations on scroll
   const revealElements = document.querySelectorAll('.reveal');

   const revealOnScroll = () => {
      revealElements.forEach(el => {
         if (el.getBoundingClientRect().top < window.innerHeight - 150) {
            el.classList.add('active');
         }
      });
   };

   window.addEventListener('scroll', revealOnScroll, { passive: true });
   revealOnScroll(); // run once on load
});
