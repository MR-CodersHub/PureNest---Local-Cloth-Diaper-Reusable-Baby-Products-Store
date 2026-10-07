/**
 * PURENEST ECO BABY REUSABLES - MASTER JAVASCRIPT
 * Interactive UI: Navigation, Filtering, Calculator, Accordions, Modal, Forms & Toasts
 */

// Immediate execution to prevent theme or layout flicker on initial load
(function() {
  try {
    const savedTheme = localStorage.getItem('purenest_theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    const savedDir = localStorage.getItem('purenest_direction');
    if (savedDir === 'rtl') {
      document.documentElement.setAttribute('dir', 'rtl');
    }
  } catch (e) {
    console.warn('Storage access restricted', e);
  }
})();

document.addEventListener('DOMContentLoaded', () => {

  // ─── 1. Header Sticky Elevation & Back-To-Top Button ───
  const header = document.querySelector('.site-header');
  const backToTopBtn = document.getElementById('backToTopBtn');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    if (header) {
      if (scrollPos > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    if (backToTopBtn) {
      if (scrollPos > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ─── 2. Mobile Navigation Drawer ───
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  const mobileOverlay = document.getElementById('mobileNavOverlay');
  const mobileCloseBtn = document.getElementById('mobileNavClose');

  function openMobileNav() {
    if (mobileDrawer && mobileOverlay) {
      mobileDrawer.classList.add('open');
      mobileOverlay.classList.add('open');
      if (hamburgerBtn) hamburgerBtn.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileNav() {
    if (mobileDrawer && mobileOverlay) {
      mobileDrawer.classList.remove('open');
      mobileOverlay.classList.remove('open');
      if (hamburgerBtn) hamburgerBtn.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
      if (mobileDrawer && mobileDrawer.classList.contains('open')) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobileNav);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileNav);

  // ─── 3. FAQ Accordion Functionality ───
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question-btn');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close siblings if inside same accordion container
        const parent = item.closest('.faq-accordion-container');
        if (parent) {
          parent.querySelectorAll('.faq-item').forEach(sibling => {
            sibling.classList.remove('active');
          });
        }
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // ─── 4. Interactive Eco & Cost Savings Calculator ───
  const calcAgeSlider = document.getElementById('calcAgeSlider');
  const calcChangesSlider = document.getElementById('calcChangesSlider');
  const calcAgeVal = document.getElementById('calcAgeVal');
  const calcChangesVal = document.getElementById('calcChangesVal');
  const calcDisposablesSaved = document.getElementById('calcDisposablesSaved');
  const calcMoneySaved = document.getElementById('calcMoneySaved');
  const calcLandfillKg = document.getElementById('calcLandfillKg');
  const calcTrashBags = document.getElementById('calcTrashBags');

  function updateSavingsCalculator() {
    if (!calcAgeSlider || !calcChangesSlider) return;
    const months = parseInt(calcAgeSlider.value, 10);
    const changesPerDay = parseInt(calcChangesSlider.value, 10);

    if (calcAgeVal) calcAgeVal.textContent = `${months} Months`;
    if (calcChangesVal) calcChangesVal.textContent = `${changesPerDay} per Day`;

    // Calculations:
    const days = months * 30.4;
    const totalDisposables = Math.round(days * changesPerDay);
    
    // Average cost per single-use disposable diaper in AUD: $0.42
    const disposableCost = totalDisposables * 0.42;
    // Average one-off cost for a 20-diaper cloth stash + accessories: $460
    const clothStashCost = 460;
    const netSavings = Math.max(0, Math.round(disposableCost - (clothStashCost * (months / 24))));

    // Environmental impact:
    // 1 disposable diaper = approx 0.18 kg waste
    const kgSaved = Math.round(totalDisposables * 0.18);
    // 1 standard garbage bag = approx 120 diapers
    const bagsSaved = Math.round(totalDisposables / 120);

    if (calcDisposablesSaved) calcDisposablesSaved.textContent = totalDisposables.toLocaleString();
    if (calcMoneySaved) calcMoneySaved.textContent = `$${netSavings.toLocaleString()}`;
    if (calcLandfillKg) calcLandfillKg.textContent = `${kgSaved.toLocaleString()} kg`;
    if (calcTrashBags) calcTrashBags.textContent = `${bagsSaved} Bags`;
  }

  if (calcAgeSlider && calcChangesSlider) {
    calcAgeSlider.addEventListener('input', updateSavingsCalculator);
    calcChangesSlider.addEventListener('input', updateSavingsCalculator);
    updateSavingsCalculator();
  }

  // ─── 5. Toast Notification System ───
  function showToast(message, iconClass = 'fa-solid fa-check') {
    let toast = document.getElementById('siteToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'siteToast';
      toast.className = 'toast-notice';
      toast.innerHTML = `
        <div class="toast-icon"><i class="${iconClass}"></i></div>
        <span class="toast-msg"></span>
      `;
      document.body.appendChild(toast);
    }
    const msgEl = toast.querySelector('.toast-msg');
    if (msgEl) msgEl.textContent = message;

    toast.classList.add('show');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3800);
  }
  window.showToast = showToast;

  // ─── 6. Cart Counter / Stash Wishlist ───
  let cartCount = parseInt(localStorage.getItem('purenest_cart_count') || '0', 10);
  const cartBadges = document.querySelectorAll('.cart-badge');
  function updateCartBadge() {
    cartBadges.forEach(badge => {
      badge.textContent = cartCount;
    });
  }
  updateCartBadge();

  // Attach add-to-stash listeners
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.btn-add-stash');
    if (addBtn) {
      e.preventDefault();
      const productName = addBtn.getAttribute('data-product-name') || 'Item';
      cartCount += 1;
      localStorage.setItem('purenest_cart_count', cartCount);
      updateCartBadge();
      showToast(`Added "${productName}" to your Diaper Stash wishlist!`);
    }
  });

  // ─── 7. Product Quick View Modal ───
  const modalOverlay = document.getElementById('productModal');
  const modalClose = document.getElementById('modalCloseBtn');
  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalCategory = document.getElementById('modalCategory');
  const modalPrice = document.getElementById('modalPrice');
  const modalDesc = document.getElementById('modalDesc');
  const modalSpecs = document.getElementById('modalSpecs');
  const modalEnquireBtn = document.getElementById('modalEnquireBtn');

  function openProductModal(data) {
    if (!modalOverlay) return;
    if (modalImg) modalImg.src = data.img || 'images/diapers_collection.jpg';
    if (modalImg) modalImg.alt = data.title || 'Product';
    if (modalTitle) modalTitle.textContent = data.title || 'Reusable Diaper Product';
    if (modalCategory) modalCategory.textContent = data.category || 'Cloth Diapers';
    if (modalPrice) modalPrice.textContent = data.price || '$18.50';
    if (modalDesc) modalDesc.textContent = data.desc || 'Gentle on your baby, certified safe materials, and built to last hundreds of washes.';
    
    if (modalSpecs && data.specs) {
      modalSpecs.innerHTML = '';
      data.specs.forEach(spec => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${spec}</span>`;
        modalSpecs.appendChild(li);
      });
    }

    if (modalEnquireBtn) {
      modalEnquireBtn.href = `contact.html?interest=${encodeURIComponent(data.title || 'Product')}`;
    }

    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeProductModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (modalClose) modalClose.addEventListener('click', closeProductModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeProductModal();
    });
  }

  // Trigger quick view from buttons
  document.addEventListener('click', (e) => {
    const quickBtn = e.target.closest('.btn-quick-view');
    if (quickBtn) {
      e.preventDefault();
      const productCard = quickBtn.closest('.product-card');
      if (productCard) {
        const title = productCard.querySelector('.product-title')?.textContent.trim();
        const category = productCard.querySelector('.product-category-label')?.textContent.trim();
        const price = productCard.querySelector('.product-price')?.textContent.trim();
        const desc = productCard.querySelector('.product-desc')?.textContent.trim();
        const img = productCard.querySelector('.product-media img')?.src;
        const features = Array.from(productCard.querySelectorAll('.feature-pill')).map(p => p.textContent.trim());

        openProductModal({
          title,
          category,
          price,
          desc,
          img,
          specs: features.length > 0 ? features : [
            'OEKO-TEX Standard 100 Certified',
            'Double Leak-Proof Leg Gussets',
            'Washable & Tumble-Dry Safe',
            'Hypoallergenic Natural Fibers'
          ]
        });
      }
    }
  });

  // ─── 8. Products Page: Category Filter & Search ───
  const filterBtns = document.querySelectorAll('.filter-pill-btn');
  const productCards = document.querySelectorAll('.product-card[data-category]');
  const searchInput = document.getElementById('productSearchInput');
  const productCountLabel = document.getElementById('productCountDisplay');

  function applyProductFilters() {
    if (!productCards.length) return;
    const activeBtn = document.querySelector('.filter-pill-btn.active');
    const selectedCategory = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    let visibleCount = 0;

    productCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category') || '';
      const titleText = card.querySelector('.product-title')?.textContent.toLowerCase() || '';
      const descText = card.querySelector('.product-desc')?.textContent.toLowerCase() || '';

      const matchesCategory = (selectedCategory === 'all' || cardCategory === selectedCategory);
      const matchesQuery = (!query || titleText.includes(query) || descText.includes(query));

      if (matchesCategory && matchesQuery) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (productCountLabel) {
      productCountLabel.textContent = `Showing ${visibleCount} products`;
    }
  }

  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyProductFilters();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyProductFilters);
  }

  // ─── 9. Contact / Enquiry Form Validation & Submission ───
  const contactForm = document.getElementById('contactEnquiryForm');
  if (contactForm) {
    // Check URL parameters for pre-selected product interest
    const urlParams = new URLSearchParams(window.location.search);
    const interestParam = urlParams.get('interest');
    if (interestParam) {
      const interestSelect = document.getElementById('formProductInterest');
      if (interestSelect) {
        let found = false;
        for (let i = 0; i < interestSelect.options.length; i++) {
          if (interestSelect.options[i].text.toLowerCase().includes(interestParam.toLowerCase())) {
            interestSelect.selectedIndex = i;
            found = true;
            break;
          }
        }
        if (!found) {
          const opt = new Option(`Regarding: ${interestParam}`, interestParam, true, true);
          interestSelect.add(opt);
        }
      }
    }

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('formFullName');
      const emailInput = document.getElementById('formEmail');
      const messageInput = document.getElementById('formMessage');

      if (!nameInput || !nameInput.value.trim()) {
        showToast('Please enter your full name.', 'fa-solid fa-triangle-exclamation');
        nameInput.focus();
        return;
      }

      if (!emailInput || !emailInput.value.includes('@')) {
        showToast('Please provide a valid email address.', 'fa-solid fa-triangle-exclamation');
        emailInput.focus();
        return;
      }

      // Success feedback
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting Enquiry...';
      }

      setTimeout(() => {
        contactForm.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Diaper Consultation Enquiry';
        }
        showToast('Thank you! Your cloth diaper enquiry has been sent. We will respond within 24 hours!', 'fa-solid fa-heart');
      }, 1200);
    });
  }

  // ─── 10. Newsletter Subscription Forms ───
  const newsletterForms = document.querySelectorAll('.footer-subscribe-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value.includes('@')) {
        showToast('Subscribed! Check your inbox for our Free Wash Guide & 10% coupon.', 'fa-solid fa-gift');
        input.value = '';
      } else {
        showToast('Please enter a valid email address.', 'fa-solid fa-circle-exclamation');
      }
    });
  });

  // ─── 11. Diaper Fit Quiz or Tabs on Home 2 / Getting Started ───
  const styleTabs = document.querySelectorAll('.diaper-style-tab');
  const stylePanels = document.querySelectorAll('.diaper-style-panel');
  if (styleTabs.length > 0) {
    styleTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab-target');
        styleTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        stylePanels.forEach(panel => {
          if (panel.id === target) {
            panel.style.display = 'grid';
          } else {
            panel.style.display = 'none';
          }
        });
      });
    });
  }

  // ─── 12. Theme Toggle (Dark / Light) ───
  function updateThemeUI(theme) {
    const isDark = theme === 'dark';
    document.querySelectorAll('.theme-toggle-btn, #themeToggleBtn, #mobileThemeToggleBtn').forEach(btn => {
      if (btn.classList.contains('icon-only')) {
        btn.innerHTML = isDark
          ? '<i class="fa-solid fa-sun" style="color:#FBBF24;"></i>'
          : '<i class="fa-solid fa-moon"></i>';
      } else {
        btn.innerHTML = isDark
          ? '<i class="fa-solid fa-sun" style="color:#FBBF24;"></i> <span>Light</span>'
          : '<i class="fa-solid fa-moon"></i> <span>Dark</span>';
      }
      btn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      btn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    });
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    if (next === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try {
      localStorage.setItem('purenest_theme', next);
    } catch (e) {}
    updateThemeUI(next);
  }

  const initialTheme = (function() {
    try {
      return localStorage.getItem('purenest_theme') || 'light';
    } catch (e) {
      return 'light';
    }
  })();
  if (initialTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  updateThemeUI(initialTheme);

  document.querySelectorAll('.theme-toggle-btn, #themeToggleBtn, #mobileThemeToggleBtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleTheme();
    });
  });

  // ─── 13. RTL Layout Toggle ───
  function updateRtlUI(dir) {
    const isRtl = dir === 'rtl';
    document.querySelectorAll('.rtl-toggle-btn, #rtlToggleBtn, #mobileRtlToggleBtn').forEach(btn => {
      if (btn.classList.contains('icon-only')) {
        btn.innerHTML = '<i class="fa-solid fa-right-left"></i>';
      } else {
        btn.innerHTML = `<i class="fa-solid fa-right-left"></i> <span class="rtl-text-label">${isRtl ? 'LTR' : 'RTL'}</span>`;
      }
      if (isRtl) {
        btn.classList.add('active-rtl');
      } else {
        btn.classList.remove('active-rtl');
      }
      btn.setAttribute('title', isRtl ? 'Switch to LTR Layout' : 'Switch to RTL Layout');
      btn.setAttribute('aria-label', isRtl ? 'Switch to LTR Layout' : 'Switch to RTL Layout');
    });
  }

  function toggleRtl() {
    const current = document.documentElement.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
    const next = current === 'rtl' ? 'ltr' : 'rtl';
    if (next === 'rtl') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.removeAttribute('dir');
    }
    try {
      localStorage.setItem('purenest_direction', next);
    } catch (e) {}
    updateRtlUI(next);
  }

  const initialDir = (function() {
    try {
      return localStorage.getItem('purenest_direction') || 'ltr';
    } catch (e) {
      return 'ltr';
    }
  })();
  if (initialDir === 'rtl') {
    document.documentElement.setAttribute('dir', 'rtl');
  }
  updateRtlUI(initialDir);

  document.querySelectorAll('.rtl-toggle-btn, #rtlToggleBtn, #mobileRtlToggleBtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleRtl();
    });
  });

  // Expose global helpers
  window.toggleTheme = toggleTheme;
  window.toggleRtl = toggleRtl;

});
