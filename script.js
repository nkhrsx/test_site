/* ============================================================
   Книжный червь — интерактив сайта книжного магазина
   Каталог, фильтры, поиск, корзина, модальные окна
   ============================================================ */

(function () {
    'use strict';

    /* ---------- Данные книг ---------- */
    const books = [
        { id: 1,  title: 'Тень ветра', author: 'Карлос Руис Сафон', genre: 'classic', authorType: 'modern', price: 890, cover: '📖' },
        { id: 2,  title: 'Мастер и Маргарита', author: 'Михаил Булгаков', genre: 'classic', authorType: 'classic', price: 720, cover: '📘' },
        { id: 3,  title: 'Игра престолов', author: 'Джордж Р. Р. Мартин', genre: 'fantasy', authorType: 'modern', price: 1190, cover: '🐉' },
        { id: 4,  title: 'Ведьмак. Последнее желание', author: 'Анджей Сапковский', genre: 'fantasy', authorType: 'modern', price: 830, cover: '⚔️' },
        { id: 5,  title: 'Убийство в «Восточном экспрессе»', author: 'Агата Кристи', genre: 'detective', authorType: 'classic', price: 610, cover: '🔍' },
        { id: 6,  title: 'Девушка с татуировкой дракона', author: 'Стиг Ларссон', genre: 'detective', authorType: 'modern', price: 780, cover: '🕵️' },
        { id: 7,  title: 'Виноваты звёзды', author: 'Джон Грин', genre: 'teen', authorType: 'teen', price: 540, cover: '💫' },
        { id: 8,  title: 'Над пропастью во ржи', author: 'Джером Сэлинджер', genre: 'teen', authorType: 'classic', price: 490, cover: '🌾' },
        { id: 9,  title: 'Дюна', author: 'Фрэнк Герберт', genre: 'scifi', authorType: 'classic', price: 990, cover: '🏜️' },
        { id: 10, title: 'Задача трёх тел', author: 'Лю Цысинь', genre: 'scifi', authorType: 'modern', price: 870, cover: '🌌' },
        { id: 11, title: 'Sapiens. Краткая история человечества', author: 'Юваль Ной Харари', genre: 'nonfiction', authorType: 'modern', price: 1290, cover: '📚' },
        { id: 12, title: 'Думай медленно… решай быстро', author: 'Даниэль Канеман', genre: 'nonfiction', authorType: 'modern', price: 1090, cover: '🧠' },
        { id: 13, title: 'Гарри Поттер и философский камень', author: 'Дж. К. Роулинг', genre: 'teen', authorType: 'teen', price: 890, cover: '⚡' },
        { id: 14, title: '451° по Фаренгейту', author: 'Рэй Брэдбери', genre: 'scifi', authorType: 'classic', price: 560, cover: '🔥' },
        { id: 15, title: 'Триумфальная арка', author: 'Эрих Мария Ремарк', genre: 'classic', authorType: 'classic', price: 680, cover: '💭' },
        { id: 16, title: 'Чистый код', author: 'Роберт Мартин', genre: 'nonfiction', authorType: 'modern', price: 1490, cover: '💻' }
    ];

    const booksById = Object.fromEntries(books.map((book) => [book.id, book]));

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
    const cartStatus = document.getElementById('cartStatus');
    const checkoutBtn = document.getElementById('checkoutBtn');

    const accountBtn = document.getElementById('accountBtn');
    const accountOpenBtn = document.getElementById('accountOpenBtn');
    const accountDialog = document.getElementById('accountDialog');
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackStatus = document.getElementById('feedbackStatus');

    const yearSpan = document.getElementById('year');
    const toTop = document.getElementById('toTop');
    const header = document.getElementById('header');

    /* ---------- Состояние каталога ---------- */
    let currentGenre = 'default';
    let currentAuthor = 'all';
    let query = '';

    /* ---------- Утилиты ---------- */
    function esc(value) {
        return String(value)
            .replaceAll('&', '&')
            .replaceAll('<', '<')
            .replaceAll('>', '>')
            .replaceAll('"', '"')
            .replaceAll("'", '&#039;');
    }

    function plural(n, one, few, many) {
        const m10 = n % 10;
        const m100 = n % 100;
        if (m10 === 1 && m100 !== 11) return one;
        if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
        return many;
    }

    function formatPrice(value) {
        return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
    }

    /* ---------- Корзина (localStorage) ---------- */
    const CART_KEY = 'bookworm-cart';
    let cart = loadCart();

    function loadCart() {
        try {
            const raw = localStorage.getItem(CART_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (err) {
            return {};
        }
    }

    function saveCart() {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
        } catch (err) {
            /* localStorage недоступен — корзина живёт только в памяти */
        }
    }

    function addToCart(id) {
        cart[id] = (cart[id] || 0) + 1;
        saveCart();
        updateCartUI();
    }

    function changeQty(id, delta) {
        const next = (cart[id] || 0) + delta;
        if (next <= 0) {
            delete cart[id];
        } else {
            cart[id] = next;
        }
        saveCart();
        updateCartUI();
    }

    function removeFromCart(id) {
        delete cart[id];
        saveCart();
        updateCartUI();
    }

    function cartCount() {
        return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    }

    function cartTotalSum() {
        return Object.entries(cart).reduce((sum, [id, qty]) => {
            const book = booksById[id];
            return book ? sum + book.price * qty : sum;
        }, 0);
    }

    function updateBadge() {
        const count = cartCount();
        cartBadge.hidden = count === 0;
        cartBadge.textContent = count;
    }

    function renderCart() {
        const entries = Object.entries(cart);

        if (entries.length === 0) {
            cartItemsBox.innerHTML = '<div class="cart-empty">Корзина пуста — выберите книги в каталоге.</div>';
            cartTotal.textContent = '0 ₽';
            return;
        }

        cartItemsBox.innerHTML = entries.map(([id, qty]) => {
            const book = booksById[id];
            if (!book) return '';
            return `
                <div class="cart-item" data-id="${book.id}">
                    <div class="cart-cover ${'genre-' + book.genre}">${book.cover}</div>
                    <div class="cart-info">
                        <div class="cart-title">${esc(book.title)}</div>
                        <div class="cart-author">${esc(book.author)}</div>
                        <div class="cart-price">${formatPrice(book.price)}</div>
                    </div>
                    <div class="cart-controls">
                        <div class="cart-qty">
                            <button class="qty-btn" type="button" data-action="dec" data-id="${book.id}"
                                    aria-label="Уменьшить количество: ${esc(book.title)}">−</button>
                            <span class="qty-num" aria-label="Количество: ${qty}">${qty}</span>
                            <button class="qty-btn" type="button" data-action="inc" data-id="${book.id}"
                                    aria-label="Увеличить количество: ${esc(book.title)}">+</button>
                        </div>
                        <button class="cart-remove" type="button" data-action="remove" data-id="${book.id}"
                                aria-label="Убрать из корзины: ${esc(book.title)}">✕</button>
                    </div>
                </div>`;
        }).join('');

        cartTotal.textContent = formatPrice(cartTotalSum());
    }

    function updateCartUI() {
        updateBadge();
        if (cartDialog.open) {
            renderCart();
        }
    }

    function showStatus(element, message, timeout = 4000) {
        element.textContent = message;
        element.hidden = false;
        if (timeout) {
            setTimeout(() => {
                element.hidden = true;
            }, timeout);
        }
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

        if (action === 'inc') changeQty(id, 1);
        if (action === 'dec') changeQty(id, -1);
        if (action === 'remove') removeFromCart(id);
    });

    checkoutBtn.addEventListener('click', () => {
        if (cartCount() === 0) {
            showStatus(cartStatus, 'Корзина пуста — добавьте книги для заказа.');
            return;
        }
        cart = {};
        saveCart();
        updateCartUI();
        renderCart();
        showStatus(cartStatus, 'Спасибо! Заказ оформлен. Наши менеджеры свяжутся с вами в ближайшее время.', 5000);
    });

    /* ---------- Фильтры каталога ---------- */
    function applyFilters() {
        const q = query.toLowerCase();

        return books.filter((book) => {
            if (currentGenre !== 'default' && book.genre !== currentGenre) return false;
            if (currentAuthor !== 'all' && book.authorType !== currentAuthor) return false;
            if (q && !(book.title.toLowerCase().includes(q) || book.author.toLowerCase().includes(q))) return false;
            return true;
        });
    }

    function renderBooks() {
        const filtered = applyFilters();
        const count = filtered.length;

        foundCount.textContent = `${count} ${plural(count, 'книга', 'книги', 'книг')}`;

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
                <div class="book-cover ${'genre-' + book.genre}" aria-hidden="true">${book.cover}</div>
                <h3 class="book-title">${esc(book.title)}</h3>
                <p class="book-author">${esc(book.author)}</p>
                <div class="book-buy">
                    <span class="book-price">${formatPrice(book.price)}</span>
                    <button class="btn-add" type="button" data-add="${book.id}"
                            aria-label="Добавить в корзину: ${esc(book.title)}">В корзину</button>
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
        addToCart(id);
        renderCart();
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

        showStatus(feedbackStatus, 'Спасибо! Ваше сообщение отправлено — мы ответим в ближайшее время.', 6000);
        feedbackForm.reset();
    });

    /* ---------- Шапка и кнопка «Наверх» ---------- */
    function onScroll() {
        const scrolled = window.scrollY > 40;
        header.classList.toggle('scrolled', scrolled);
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
})();