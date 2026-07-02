const STORAGE_KEY = 'cinemavista-cart';

function getCart() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('No se pudo leer el carrito', error);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value);
}

function updateCartCounts() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('[data-cart-count]').forEach((element) => {
    element.textContent = totalItems;
  });
}

function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'alert alert-dark shadow-sm border-0';
  toast.innerHTML = `<i class="fa-solid fa-check me-2"></i>${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2200);
}

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find((entry) => entry.id === item.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }

  saveCart(cart);
  updateCartCounts();
  renderCart();
  showToast(`${item.name} agregado al carrito`);
}

function updateQuantity(id, delta) {
  const cart = getCart();
  const item = cart.find((entry) => entry.id === id);

  if (!item) return;

  item.quantity = Math.max(0, item.quantity + delta);

  if (item.quantity === 0) {
    const filtered = cart.filter((entry) => entry.id !== id);
    saveCart(filtered);
  } else {
    saveCart(cart);
  }

  updateCartCounts();
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const subtotalEl = document.getElementById('subtotal');
  const serviceEl = document.getElementById('service');
  const totalEl = document.getElementById('total');

  if (!container) return;

  const cart = getCart();

  if (!cart.length) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-film mb-3" style="font-size: 2rem; color: var(--accent);"></i>
        <h3 class="h5">Tu carrito está vacío</h3>
        <p class="mb-3">Elegí una película para comenzar tu experiencia.</p>
        <a href="index.html#cartelera" class="btn btn-cinema">Explorar cartelera</a>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = formatCurrency(0);
    if (serviceEl) serviceEl.textContent = formatCurrency(0);
    if (totalEl) totalEl.textContent = formatCurrency(0);
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const service = Math.round(subtotal * 0.08);
  const total = subtotal + service;

  container.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
          <div class="d-flex align-items-center gap-3">
            <img src="${item.image}" alt="${item.name}">
            <div>
              <h3>${item.name}</h3>
              <p>${formatCurrency(item.price)} por entrada</p>
              <div class="qty-controls mt-2">
                <button type="button" data-action="decrease" data-id="${item.id}">−</button>
                <span>${item.quantity}</span>
                <button type="button" data-action="increase" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
          <div class="text-end">
            <strong>${formatCurrency(item.price * item.quantity)}</strong>
            <button type="button" class="btn btn-link text-danger p-0 mt-2 d-block" data-action="remove" data-id="${item.id}">Eliminar</button>
          </div>
        </div>
      `
    )
    .join('');

  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
  if (serviceEl) serviceEl.textContent = formatCurrency(service);
  if (totalEl) totalEl.textContent = formatCurrency(total);

  container.querySelectorAll('[data-action="decrease"]').forEach((button) => {
    button.addEventListener('click', () => updateQuantity(button.getAttribute('data-id'), -1));
  });

  container.querySelectorAll('[data-action="increase"]').forEach((button) => {
    button.addEventListener('click', () => updateQuantity(button.getAttribute('data-id'), 1));
  });

  container.querySelectorAll('[data-action="remove"]').forEach((button) => {
    button.addEventListener('click', () => updateQuantity(button.getAttribute('data-id'), -999));
  });
}

function initializeHome() {
  document.querySelectorAll('.add-to-cart').forEach((button) => {
    button.addEventListener('click', () => {
      addToCart({
        id: button.dataset.id,
        name: button.dataset.name,
        price: Number(button.dataset.price),
        image: button.dataset.image,
      });
    });
  });

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      showToast('Consulta enviada. Nos pondremos en contacto pronto.');
      contactForm.reset();
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  updateCartCounts();
  initializeHome();
  renderCart();
});
