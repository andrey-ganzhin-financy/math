// ===== Math Supply — main.js =====

// --- Данные товаров ---
const PRODUCTS = [
  { id: 'taylor',   title: 'Шпаргалка: ряды Тейлора',  category: 'cheatsheets', level: 'basic',    price: 490,  badge: 'Хит',     badgeClass: 'badge--primary', image: 'images/taylor.jpg',   featured: true,
    description: 'Постер А3: разложения в ряд основных функций, радиусы сходимости, примеры применения.' },
  { id: 'limits',   title: 'Шпаргалка: пределы',        category: 'cheatsheets', level: 'basic',    price: 450,  badge: '',        badgeClass: '',               image: 'images/limits.jpg',
    description: 'Все виды пределов, замечательные пределы и правило Лопиталя на одном листе.' },
  { id: 'deriv',    title: 'Карточки: производные',     category: 'cards',       level: 'basic',    price: 390,  badge: 'Новинка', badgeClass: 'badge--success', image: 'images/deriv.jpg',    featured: true,
    description: '50 двусторонних карточек: формулы, ловушки и типовые ошибки. Формат А6.' },
  { id: 'integ',    title: 'Карточки: интегралы',       category: 'cards',       level: 'advanced', price: 420,  badge: '',        badgeClass: '',               image: 'images/integ.jpg',
    description: 'Табличные интегралы, замены и хитрые приёмы для продвинутых.' },
  { id: 'euler',    title: 'Футболка: e^(iπ) + 1 = 0',  category: 'merch',       level: 'any',      price: 2490, badge: 'Хит',     badgeClass: 'badge--primary', image: 'images/euler.jpg',    featured: true,
    description: 'Хлопок 100%, принт с тождеством Эйлера. За которую не стыдно на паре.' },
  { id: 'notebook', title: 'Блокнот «Докажи это»',      category: 'merch',       level: 'any',      price: 390,  oldPrice: 490, badge: '−20%', badgeClass: 'badge--danger', image: 'images/notebook.jpg',
    description: 'Клетка 5 мм, плотная бумага 100 г/м², 96 страниц. Памятка по индукции на форзаце.' },
  { id: 'poster',   title: 'Постер: константы',         category: 'cheatsheets', level: 'any',      price: 1200, badge: '',        badgeClass: '',               image: 'images/poster.jpg',
    description: 'π, e, φ, γ — красиво и с историей. Формат А2, матовая ламинация.' },
];

const CATEGORY_LABELS = { cheatsheets: 'Шпаргалка', cards: 'Карточки', merch: 'Мерч' };
const LEVEL_LABELS    = { basic: 'базовый', advanced: 'продвинутый', any: 'любой' };

// --- Корзина ---
let cart = [];
try { cart = JSON.parse(localStorage.getItem('mathCart')) || []; }
catch { cart = []; }

function saveCart()        { localStorage.setItem('mathCart', JSON.stringify(cart)); }
function cartTotalQty()    { return cart.reduce((s, i) => s + i.qty, 0); }
function cartTotalPrice()  { return cart.reduce((s, i) => s + i.price * i.qty, 0); }

function updateCartCounter() {
  const counter = document.getElementById('cart-counter');
  if (!counter) return;
  const total = cartTotalQty();
  counter.textContent = total;
  counter.hidden = total === 0;
}

function pulseCartBadge() {
  const counter = document.getElementById('cart-counter');
  if (!counter) return;
  counter.classList.remove('badge-pulse');
  void counter.offsetWidth; // reflow — перезапуск анимации
  counter.classList.add('badge-pulse');
}

function addToCart(id, btn) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty++;
  else cart.push({ id: product.id, title: product.title, price: product.price, qty: 1 });

  saveCart();
  updateCartCounter();
  pulseCartBadge();

  if (btn) {
    const original = btn.innerHTML;
    btn.innerHTML = '✓ Добавлено';
    btn.disabled = true;
    setTimeout(() => { btn.innerHTML = original; btn.disabled = false; }, 1200);
  }
  showToast(`«${product.title}» в корзине`);
}

// --- Рендер карточки ---
function productCardHTML(p) {
  const badge = p.badge ? `<span class="badge ${p.badgeClass}">${p.badge}</span>` : '';
  const priceHTML = p.oldPrice
    ? `<span class="product-card__price"><s>${p.oldPrice} ₽</s>${p.price} ₽</span>`
    : `<span class="product-card__price">${p.price} ₽</span>`;

  // 1. Убрали loading="lazy", чтобы браузер не блокировал загрузку локальных картинок
  // 2. Добавили alt="${p.title}" для скринридеров
  const image = p.image
    ? `<img src="${p.image}" alt="${p.title}" class="product-card__img" width="400" height="250">`
    : '';

  return `
    ${badge}
    <div class="product-card__image">
      ${image}
    </div>
    <div class="product-card__body">
      <h3 class="product-card__title">${p.title}</h3>
      <p class="product-card__description">${p.description}</p>
      <div class="product-card__footer">
        ${priceHTML}
        <!-- 3. Добавили aria-label, чтобы скринридер читал, ЧТО именно мы добавляем -->
        <button class="btn btn-outline-primary product-card__button" type="button" data-add-to-cart="${p.id}" aria-label="Добавить ${p.title} в корзину">В корзину</button>
      </div>
    </div>
  `;
}
function renderProducts(items, gridEl, counterEl) {
  if (!gridEl) return;
  gridEl.innerHTML = '';
  if (counterEl) animateCount(counterEl, items.length);

  if (!items.length) {
    gridEl.innerHTML = '<p class="text-muted text-center py-4">Ничего не найдено. Попробуйте изменить фильтры.</p>';
    return;
  }

  items.forEach(p => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = productCardHTML(p);
    gridEl.appendChild(card);
  });

  revealProductCards(gridEl);
}

// --- Каталог ---
function initCatalog() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  const counter = document.getElementById('products-count');
  const form    = document.getElementById('catalog-filters-form');

  renderProducts(PRODUCTS, grid, counter);

  function applyFilters() {
    const category = form.querySelector('input[name="category"]:checked')?.value || 'all';
    const level    = form.querySelector('input[name="level"]:checked')?.value || 'any';
    const from     = parseInt(form.querySelector('input[name="price-from"]')?.value, 10) || 0;
    const toInput  = parseInt(form.querySelector('input[name="price-to"]')?.value, 10);
    const to       = Number.isNaN(toInput) ? Infinity : toInput;

    const filtered = PRODUCTS.filter(p =>
      (category === 'all' || p.category === category) &&
      (level === 'any' || p.level === level) &&
      p.price >= from && p.price <= to
    );
    renderProducts(filtered, grid, counter);
  }

  form.addEventListener('submit', e => { e.preventDefault(); applyFilters(); });
  form.addEventListener('change', applyFilters);
  form.addEventListener('reset', () => setTimeout(applyFilters, 0));
}

// --- Главная ---
function initFeatured() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  renderProducts(PRODUCTS.filter(p => p.featured), grid, null);
}

// --- Делегирование «В корзину» ---
function initAddToCartDelegation() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-add-to-cart]');
    if (!btn) return;
    addToCart(btn.dataset.addToCart, btn);
  });
}

// --- Диалог корзины ---
function initCartDialog() {
  const dialog = document.createElement('dialog');
  dialog.className = 'cart-dialog';
  dialog.id = 'cart-dialog';
  dialog.innerHTML = `
    <div class="cart-dialog__inner">
      <header class="cart-dialog__header">
        <h2 class="cart-dialog__title">Корзина</h2>
        <button class="cart-dialog__close" type="button" aria-label="Закрыть">×</button>
      </header>
      <div class="cart-dialog__content" id="cart-items"></div>
      <footer class="cart-dialog__footer">
        <div class="cart-dialog__total">Итого: <strong id="cart-total">0</strong> ₽</div>
        <button class="button button--primary" type="button" id="cart-checkout">Оформить заказ</button>
      </footer>
    </div>
  `;
  document.body.appendChild(dialog);

  dialog.querySelector('.cart-dialog__close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

  document.addEventListener('click', e => {
    if (e.target.closest('#cart-button')) {
      e.preventDefault();
      renderCartDialog();
      dialog.showModal();
    }
  });

  dialog.querySelector('#cart-items').addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = btn.closest('.cart-item').dataset.id;
    const action = btn.dataset.action;
    const item = cart.find(i => i.id === id);
    if (!item) return;

    if (action === 'inc') item.qty++;
    if (action === 'dec') {
      item.qty--;
      if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    }
    if (action === 'remove') cart = cart.filter(i => i.id !== id);

    saveCart();
    updateCartCounter();
    renderCartDialog();
  });

  dialog.querySelector('#cart-checkout').addEventListener('click', () => {
    if (!cart.length) return;
    if (confirm('Оформить заказ? (учебный проект)')) {
      cart = [];
      saveCart();
      updateCartCounter();
      renderCartDialog();
      dialog.close();
      showToast('Заказ оформлен! Спасибо 💜');
    }
  });
}

function renderCartDialog() {
  const itemsEl = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  if (!itemsEl || !totalEl) return;

  if (!cart.length) {
    itemsEl.innerHTML = '<p class="cart-dialog__empty">Корзина пока пуста 🛒<br><small>Добавьте что-нибудь из каталога.</small></p>';
    totalEl.textContent = '0';
    return;
  }

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item__info">
        <div class="cart-item__title">${item.title}</div>
        <div class="cart-item__price">${item.price} ₽ × ${item.qty} = ${item.price * item.qty} ₽</div>
      </div>
      <div class="cart-item__controls">
        <button class="cart-item__btn" type="button" data-action="dec" aria-label="Уменьшить">−</button>
        <span class="cart-item__qty">${item.qty}</span>
        <button class="cart-item__btn" type="button" data-action="inc" aria-label="Увеличить">+</button>
        <button class="cart-item__btn cart-item__btn--remove" type="button" data-action="remove" aria-label="Удалить">×</button>
      </div>
    </div>
  `).join('');

  totalEl.textContent = cartTotalPrice();
}

// --- Тост ---
function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast-msg--show'));
  setTimeout(() => {
    toast.classList.remove('toast-msg--show');
    setTimeout(() => toast.remove(), 350);
  }, 2400);
}

// --- Кнопка «наверх» ---
function initScrollTop() {
  const btn = document.querySelector('.scroll-top');
  if (!btn) return;
  const onScroll = () => { btn.hidden = window.scrollY < 400; };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// --- Форма контактов ---
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const statusDiv = document.getElementById('contact-status');

  form.addEventListener('submit', e => {
    e.preventDefault();
    form.classList.add('was-validated');
    if (!form.checkValidity()) return;

    const submitBtn = form.querySelector('#contact-submit');
    const original = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправляем…';

    setTimeout(() => {
      statusDiv.classList.remove('d-none');
      statusDiv.className = 'mt-3 text-center text-success';
      statusDiv.textContent = 'Спасибо! Ваше сообщение принято (в рамках учебного проекта).';
      submitBtn.disabled = false;
      submitBtn.textContent = original;
      form.reset();
      form.classList.remove('was-validated');
    }, 1200);
  });
}

/* ==============================================
   АНИМАЦИИ
   ============================================== */

// --- Появление секций при скролле ---
function initScrollReveal() {
  const selectors = [
    '.section > h2',
    '.section > p',
    '.catalog-layout',
    '.faq__item',
    '.steps li',
    '.contact-info__row',
    '.contact-form-section',
    '.aside-info',
    '.map-wrapper',
    '.row > [class*="col-"] > .card',
  ].join(',');

  const els = [...document.querySelectorAll(selectors)].filter(el => !el.closest('.reveal'));

  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('reveal', 'reveal--visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  els.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${Math.min(i * 40, 320)}ms`;
    io.observe(el);
  });
}

// --- Каскадное появление карточек товаров ---
function revealProductCards(grid) {
  const cards = grid.querySelectorAll('.product-card:not(.reveal)');
  if (!cards.length) return;

  if (!('IntersectionObserver' in window)) {
    cards.forEach(c => c.classList.add('reveal', 'reveal--visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

  cards.forEach((card, i) => {
    card.classList.add('reveal');
    card.style.transitionDelay = `${(i % 8) * 70}ms`;
    io.observe(card);
  });
}

// --- Плавный счётчик ---
function animateCount(el, target) {
  if (!el) return;
  const start = parseInt(el.textContent, 10) || 0;
  if (start === target) { el.textContent = target; return; }

  const duration = 500;
  const t0 = performance.now();

  function tick(now) {
    const p = Math.min(1, (now - t0) / duration);
    // easing easeOutCubic
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(start + (target - start) * eased);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// --- Добавляем декоративные символы в hero ---
function initHeroSymbols() {
  const hero = document.querySelector('.hero');
  if (!hero || hero.querySelector('.hero__symbols')) return;
  const symbols = document.createElement('div');
  symbols.className = 'hero__symbols';
  symbols.setAttribute('aria-hidden', 'true');
  symbols.innerHTML = '<span>π</span><span>∫</span><span>√</span><span>∞</span>';
  hero.appendChild(symbols);
}

// --- Запуск ---
document.addEventListener('DOMContentLoaded', () => {
  updateCartCounter();
  initCartDialog();
  initAddToCartDelegation();
  initFeatured();
  initCatalog();
  initScrollTop();
  initContactForm();
  initHeroSymbols();
  initScrollReveal();
});