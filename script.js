/**
 * YASHMITA BHUSHAN — PORTFOLIO ENGINE
 * Refractive Moving Glass Bubble | Stacked Card Deck | Editorial Interactions
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. REFRACTIVE MOVING GLASS BUBBLE (HERO SECTION)
     ========================================================================== */
  const interactiveZone = document.getElementById('hero-interactive-zone');
  const baseText = document.getElementById('hero-base-text');
  const lens = document.getElementById('hero-lens');
  const lensClone = document.getElementById('hero-lens-clone');

  if (interactiveZone && lens && lensClone) {
    let zoneRect = interactiveZone.getBoundingClientRect();
    let lensWidth = lens.offsetWidth || 180;
    let radius = lensWidth / 2;

    // Position state for lerp
    let currentX = zoneRect.width * 0.45;
    let currentY = zoneRect.height * 0.45;
    let targetX = currentX;
    let targetY = currentY;

    let isMouseActive = false;
    let lastMouseMoveTime = 0;
    let animTime = 0;

    // Sync clone dimensions to base text
    const syncDimensions = () => {
      zoneRect = interactiveZone.getBoundingClientRect();
      lensWidth = lens.offsetWidth || 180;
      radius = lensWidth / 2;
      
      // Ensure the clone has identical dimensions to the base text container
      const targetW = baseText ? baseText.offsetWidth : zoneRect.width;
      const targetH = baseText ? baseText.offsetHeight : zoneRect.height;
      lensClone.style.width = `${targetW}px`;
      lensClone.style.height = `${targetH}px`;
    };

    syncDimensions();
    window.addEventListener('resize', syncDimensions, { passive: true });

    // Mouse / Cursor Tracking
    const handlePointerMove = (clientX, clientY) => {
      zoneRect = interactiveZone.getBoundingClientRect();
      const relX = clientX - zoneRect.left;
      const relY = clientY - zoneRect.top;

      // Check if cursor is near the interactive headline
      if (
        relX >= -80 &&
        relX <= zoneRect.width + 80 &&
        relY >= -80 &&
        relY <= zoneRect.height + 80
      ) {
        isMouseActive = true;
        lastMouseMoveTime = performance.now();
        
        // Target center of lens onto cursor
        targetX = Math.max(-radius * 0.5, Math.min(zoneRect.width - radius * 1.5, relX - radius));
        targetY = Math.max(-radius * 0.5, Math.min(zoneRect.height - radius * 1.5, relY - radius));
      }
    };

    // Hero container mousemove
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      heroSection.addEventListener('mousemove', (e) => {
        handlePointerMove(e.clientX, e.clientY);
      }, { passive: true });

      heroSection.addEventListener('mouseleave', () => {
        isMouseActive = false;
      });

      // Touch interaction on mobile
      heroSection.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      heroSection.addEventListener('touchend', () => {
        isMouseActive = false;
      });
    }

    // 60fps Physics & Render Loop
    const renderLoop = (time) => {
      animTime += 0.016;

      // If user hasn't moved cursor for 2.2 seconds, resume autonomous organic floating
      if (!isMouseActive || (performance.now() - lastMouseMoveTime > 2200)) {
        isMouseActive = false;
        const centerX = zoneRect.width * 0.5 - radius;
        const centerY = zoneRect.height * 0.45 - radius;

        const xOffset = Math.sin(animTime * 0.75) * (zoneRect.width * 0.28) + Math.cos(animTime * 1.45) * 45;
        const yOffset = Math.cos(animTime * 0.65) * (zoneRect.height * 0.24) + Math.sin(animTime * 1.25) * 30;

        targetX = centerX + xOffset;
        targetY = centerY + yOffset;
      }

      // Smooth Lerp Interpolation
      const lerpFactor = isMouseActive ? 0.12 : 0.055;
      currentX += (targetX - currentX) * lerpFactor;
      currentY += (targetY - currentY) * lerpFactor;

      // 1. Move circular glass lens
      lens.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

      // 2. Magnify underlying text precisely centered at lens position
      const centerX = currentX + radius;
      const centerY = currentY + radius;
      const magnification = 1.14;

      lensClone.style.transform = `translate3d(${-currentX}px, ${-currentY}px, 0) scale(${magnification})`;
      lensClone.style.transformOrigin = `${centerX}px ${centerY}px`;

      requestAnimationFrame(renderLoop);
    };

    requestAnimationFrame(renderLoop);
  }

  /* ==========================================================================
     2. STACKED OVERLAPPING CARDS DECK (ABOUT SECTION)
     ========================================================================== */
  const cards = Array.from(document.querySelectorAll('.deck-card'));
  const dotBtns = Array.from(document.querySelectorAll('.deck-dot-btn'));
  let currentCardIndex = 0;
  let autoDeckTimer = null;

  const updateCardDeck = (activeIndex) => {
    currentCardIndex = activeIndex;
    const total = cards.length;

    cards.forEach((card, idx) => {
      card.classList.remove('active', 'next', 'back');
      
      const offset = (idx - activeIndex + total) % total;
      if (offset === 0) {
        card.classList.add('active');
      } else if (offset === 1) {
        card.classList.add('next');
      } else {
        card.classList.add('back');
      }
    });

    dotBtns.forEach((btn, idx) => {
      btn.classList.toggle('active', idx === activeIndex);
    });
  };

  // Card click triggers front promotion
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const cardIdx = parseInt(card.getAttribute('data-index'), 10);
      updateCardDeck(cardIdx);
      resetAutoTimer();
    });
  });

  // Pagination buttons
  dotBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetIdx = parseInt(btn.getAttribute('data-target'), 10);
      updateCardDeck(targetIdx);
      resetAutoTimer();
    });
  });

  // Auto shuffle cards gently every 7 seconds if unclicked
  const startAutoTimer = () => {
    autoDeckTimer = setInterval(() => {
      const nextIdx = (currentCardIndex + 1) % cards.length;
      updateCardDeck(nextIdx);
    }, 7000);
  };

  const resetAutoTimer = () => {
    if (autoDeckTimer) clearInterval(autoDeckTimer);
    startAutoTimer();
  };

  if (cards.length > 0) {
    updateCardDeck(0);
    startAutoTimer();
  }

  /* ==========================================================================
     3. INTERACTIVE COPY-TO-CLIPBOARD EMAIL
     ========================================================================== */
  const copyEmailCard = document.getElementById('copy-email-card');
  const toast = document.getElementById('toast');
  const emailTextEl = document.getElementById('email-address-text');
  let toastTimer = null;

  if (copyEmailCard && emailTextEl) {
    const handleCopy = () => {
      const email = emailTextEl.textContent.trim() || 'yashmitabhushan@gmail.com';

      const showToast = () => {
        if (toast) {
          toast.classList.add('show');
          if (toastTimer) clearTimeout(toastTimer);
          toastTimer = setTimeout(() => {
            toast.classList.remove('show');
          }, 3200);
        }
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(showToast).catch(() => {
          fallbackCopy(email);
          showToast();
        });
      } else {
        fallbackCopy(email);
        showToast();
      }
    };

    const fallbackCopy = (text) => {
      const tempInput = document.createElement('textarea');
      tempInput.value = text;
      tempInput.style.position = 'fixed';
      tempInput.style.opacity = '0';
      document.body.appendChild(tempInput);
      tempInput.select();
      try {
        document.execCommand('copy');
      } catch (e) {
        console.warn('Copy command failed', e);
      }
      document.body.removeChild(tempInput);
    };

    copyEmailCard.addEventListener('click', handleCopy);
    copyEmailCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCopy();
      }
    });
  }

  /* ==========================================================================
     4. HEADER SCROLL & ACTIVE SECTION NAVIGATION
     ========================================================================== */
  const header = document.getElementById('header');
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  const handleScroll = () => {
    const scrollY = window.pageYOffset;

    // Header blurred background on scroll
    if (header) {
      header.classList.toggle('scrolled', scrollY > 40);
    }

    // Nav active link highlighting
    const viewportMiddle = scrollY + window.innerHeight * 0.35;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (viewportMiddle >= top && viewportMiddle < top + height) {
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ==========================================================================
     5. MOBILE NAVIGATION TOGGLE
     ========================================================================== */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
      document.body.classList.toggle('nav-open', navMenu.classList.contains('open'));
    });

    // Close menu when clicking link
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navMenu.classList.remove('open');
        document.body.classList.remove('nav-open');
      });
    });
  }

  /* ==========================================================================
     6. SCROLL TO TOP
     ========================================================================== */
  const scrollTopBtn = document.getElementById('scroll-top');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /* ==========================================================================
     7. CARD 3D TILT EFFECT FOR FEATURED PROJECTS
     ========================================================================== */
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const glowLayer = card.querySelector('.card-glow-layer');
      if (glowLayer) {
        glowLayer.style.left = `${x - 80}px`;
        glowLayer.style.top = `${y - 80}px`;
        glowLayer.style.opacity = '1';
      }
    });

    card.addEventListener('mouseleave', () => {
      const glowLayer = card.querySelector('.card-glow-layer');
      if (glowLayer) {
        glowLayer.style.opacity = '0';
      }
    });
  });

});
