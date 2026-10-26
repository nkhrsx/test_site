/* ============================================================
   Книжный червь — МОДУЛЬ 3: приложение
   Каталог, фильтры, поиск, корзина (обработчики), модальные окна,
   форма обратной связи, анимации. Запускается после data.js и cart.js.
   ============================================================ */

(function (global) {
    'use strict';

    const DATA = global.BookstoreData;
    const CART = global.BookstoreCart;

    /* ---------- Элементы DOM ---------- */
    const booksGrid = document.getElementById('booksGrid');
    const foundCount = document.getElementById('foundCount');
    const searchInput = document.getElementById('searchInput');
    const genreButtons = [...document.querySelectorAll('[data-genre]')];
    const authorButtons = [...document.querySelectorAll('[data-author]')];

    const cartBadge = document.getElementById('cartBadge');
    const cartBtn = document.getElementById('cartBtn');
    const cartDialog = document.getElementById('cartDialog');
    const cartItemsBox = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartCount = document.getElementById('cartItemsCount');
    const cartNote = document.getElementById('cartNote');
    const cartStatus = document.getElementById('cartStatus');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const clearCartBtn = document.getElementById('clearCartBtn');

    const accountBtn = document.getElementById('accountBtn');
    const accountOpenBtn = document.getElementById('accountOpenBtn');
    const accountDialog = document.getElementById('accountDialog');
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackStatus = document.getElementById('feedbackStatus');

    const yearSpan = document.getElementById('year');
    const toTop = document.getElementById('toTop');
    const header = document.getElementById('header');
    const toast = document.getElementById('toast');

    /* ---------- Состояние каталога ---------- */
    let currentGenre = 'default';
    let currentAuthor = 'all';
    let query = '';

    /* ---------- Тост-уведомление ---------- */
    let toastTimer = null;

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
    }

    /* ---------- Корзина: бейдж и рендер ---------- */
    function updateBadge() {
        const count = CART.getCount();
        cartBadge.hidden = count === 0;
        cartBadge.textContent = count;
        if (count > 0) {
            cartBadge.classList.remove('bump');
            void cartBadge.offsetWidth; /* перезапуск анимации */
            cartBadge.classList.add('bump');
        }
    }

    function refreshCartUI() {
        updateBadge();
        if (cartDialog.open) {
            renderCart();
        }
    }

    function renderCart() {
        CART.renderCart(cartItemsBox, cartTotal, cartCount, cartNote);
    }

    /* ---------- Обработчики корзины ---------- */
    cartBtn.addEventListener('click', () => {
        cartStatus.hidden = true;
        renderCart();
        cartDialog.showModal();
    });

    cartItemsBox.addEventListener('click', (e) => {
        const button = e.target.closest('[data-action]');
        if (!button) return;
        const id = Number(button.dataset.id);
        const action = button.dataset.action;

        if (action === 'inc') CART.changeQty(id, 1);
        if (action === 'dec') CART.changeQty(id, -1);
        if (action === 'remove') CART.removeFromCart(id);
        refreshCartUI();
    });

    clearCartBtn.addEventListener('click', () => {
        if (CART.getCount() === 0) return;
        CART.clearCart();
        refreshCartUI();
        showToast('Корзина очищена');
    });

    checkoutBtn.addEventListener('click', () => {
        if (CART.getCount() === 0) {
            cartStatus.hidden = false;
            cartStatus.textContent = 'Корзина пуста — добавьте книги для заказа.';
            return;
        }
        CART.clearCart();
        refreshCartUI();
        renderCart();
        cartStatus.hidden = false;
        cartStatus.textContent = 'Спасибо! Заказ оформлен. Наши менеджеры свяжутся с вами в ближайшее время.';
        setTimeout(() => { cartStatus.hidden = true; }, 5000);
    });

    /* ---------- Фильтры каталога ---------- */
    function applyFilters() {
        const q = query.toLowerCase();

        return DATA.books.filter((book) => {
            if (currentGenre !== 'default' && book.genre !== currentGenre) return false;
            if (currentAuthor !== 'all' && book.authorType !== currentAuthor) return false;
            if (q && !(book.title.toLowerCase().includes(q) || book.author.toLowerCase().includes(q))) return false;
            return true;
        });
    }

    function renderBooks() {
        const filtered = applyFilters();
        const count = filtered.length;

        foundCount.textContent = `${count} ${DATA.plural(count, 'книга', 'книги', 'книг')}`;

        if (count === 0) {
            booksGrid.innerHTML = `
                <div class="books-empty">
                    <span class="books-empty-emoji" aria-hidden="true">🔍</span>
                    По вашему запросу ничего не найдено. Попробуйте изменить фильтры или поисковый запрос.
                </div>`;
            return;
        }

        booksGrid.innerHTML = filtered.map((book, index) => `
            <article class="book-card reveal" style="--d:${Math.min(index % 6 * 0.06, 0.3)}s">
                <div class="book-cover ${'genre-' + book.genre}">
                    <img src="${book.cover}" alt="Обложка: ${DATA.esc(book.title)}" loading="lazy">
                </div>
                <h3 class="book-title">${DATA.esc(book.title)}</h3>
                <p class="book-author">${DATA.esc(book.author)}</p>
                <div class="book-buy">
                    <span class="book-price">${DATA.formatPrice(book.price)}</span>
                    <button class="btn-add" type="button" data-add="${book.id}"
                            aria-label="Добавить в корзину: ${DATA.esc(book.title)}">В корзину</button>
                </div>
            </article>`).join('');

        observeCards();
    }

    function setPressed(buttons, value) {
        buttons.forEach((btn) => {
            const pressed = btn.dataset.genre === value || btn.dataset.author === value;
            btn.classList.toggle('active', pressed);
            btn.setAttribute('aria-pressed', String(pressed));
        });
    }

    function setGenrePalette(genre) {
        document.body.classList.forEach((cls) => {
            if (cls.startsWith('genre-')) {
                document.body.classList.remove(cls);
            }
        });
        if (genre && genre !== 'default') {
            document.body.classList.add('genre-' + genre);
        }
    }

    genreButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            currentGenre = btn.dataset.genre;
            setGenrePalette(currentGenre);
            setPressed(genreButtons, currentGenre);
            renderBooks();
        });
    });

    authorButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            currentAuthor = btn.dataset.author;
            setPressed(authorButtons, currentAuthor);
            renderBooks();
        });
    });

    /* ---------- Поиск ---------- */
    searchInput.addEventListener('input', (e) => {
        query = e.target.value.trim();
        renderBooks();
    });

    /* ---------- Делегирование: добавление в корзину ---------- */
    booksGrid.addEventListener('click', (e) => {
        const button = e.target.closest('[data-add]');
        if (!button) return;
        const id = Number(button.dataset.add);
        CART.addToCart(id);
        refreshCartUI();
        showToast('📚 «' + DATA.booksById[id].title + '» — в корзине');
    });

    /* ---------- Модальные окна ---------- */
    function openDialog(dialog) {
        if (typeof dialog.showModal === 'function') {
            dialog.showModal();
        } else {
            dialog.setAttribute('open', '');
        }
    }

    function closeDialog(dialog) {
        if (typeof dialog.close === 'function') {
            dialog.close();
        } else {
            dialog.removeAttribute('open');
        }
    }

    document.querySelectorAll('.modal').forEach((dialog) => {
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) closeDialog(dialog);
        });
        dialog.addEventListener('cancel', () => closeDialog(dialog));
    });

    document.querySelectorAll('[data-close-dialog]').forEach((button) => {
        button.addEventListener('click', () => closeDialog(button.closest('.modal')));
    });

    accountBtn.addEventListener('click', () => openDialog(accountDialog));
    accountOpenBtn.addEventListener('click', () => openDialog(accountDialog));

    /* ---------- Форма обратной связи ---------- */
    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!feedbackForm.checkValidity()) {
            feedbackForm.reportValidity();
            return;
        }

        feedbackStatus.hidden = false;
        feedbackStatus.textContent = 'Спасибо! Ваше сообщение отправлено — мы ответим в ближайшее время.';
        setTimeout(() => { feedbackStatus.hidden = true; }, 6000);
        feedbackForm.reset();
    });

    /* ---------- Шапка и кнопка «Наверх» ---------- */
    function onScroll() {
        header.classList.toggle('scrolled', window.scrollY > 40);
        toTop.classList.toggle('show', window.scrollY > 600);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    toTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ---------- Анимация появления карточек ---------- */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    function observeCards() {
        booksGrid.querySelectorAll('.book-card.reveal').forEach((card) => revealObserver.observe(card));
    }

    /* ---------- Автогод ---------- */
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    /* ---------- Инициализация ---------- */
    setGenrePalette('default');
    renderBooks();
    updateBadge();
})(window);
