/* ============================================================
   Книжный червь — МОДУЛЬ 2: корзина
   Состояние корзины, localStorage, подсчёт, отрисовка.
   Не содержит обработчиков событий — только логика и разметка.
   ============================================================ */

(function (global) {
    'use strict';

    const DATA = global.BookstoreData;
    const CART_KEY = 'bookworm-cart';
    const FREE_DELIVERY_FROM = 2000;

    let cart = loadCart();

    /* ---------- Сохранение ---------- */
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

    /* ---------- Операции с корзиной ---------- */
    function addToCart(id) {
        cart[id] = (cart[id] || 0) + 1;
        saveCart();
    }

    function changeQty(id, delta) {
        const next = (cart[id] || 0) + delta;
        if (next <= 0) {
            delete cart[id];
        } else {
            cart[id] = next;
        }
        saveCart();
    }

    function removeFromCart(id) {
        delete cart[id];
        saveCart();
    }

    function clearCart() {
        cart = {};
        saveCart();
    }

    function getCount() {
        return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    }

    function getTotal() {
        return Object.entries(cart).reduce((sum, [id, qty]) => {
            const book = DATA.booksById[id];
            return book ? sum + book.price * qty : sum;
        }, 0);
    }

    function getRemainingForFreeDelivery() {
        const remain = FREE_DELIVERY_FROM - getTotal();
        return remain > 0 ? remain : 0;
    }

    /* ---------- Отрисовка ---------- */
    function renderCart(cartItemsBox, cartTotalEl, cartCountEl, cartNoteEl) {
        const entries = Object.entries(cart);

        if (entries.length === 0) {
            cartItemsBox.innerHTML = '<div class="cart-empty">Корзина пуста — выберите книги в каталоге.</div>';
            cartTotalEl.textContent = '0 ₽';
            if (cartCountEl) cartCountEl.textContent = '0 товаров';
            if (cartNoteEl) cartNoteEl.textContent = '🚚 Бесплатная доставка от 2 000 ₽';
            return;
        }

        cartItemsBox.innerHTML = entries.map(([id, qty]) => {
            const book = DATA.booksById[id];
            if (!book) return '';
            return `
                <div class="cart-item" data-id="${book.id}">
                    <div class="cart-cover ${'genre-' + book.genre}">
                        <img src="${book.cover}" alt="" loading="lazy">
                    </div>
                    <div class="cart-info">
                        <div class="cart-title">${DATA.esc(book.title)}</div>
                        <div class="cart-author">${DATA.esc(book.author)}</div>
                        <div class="cart-price">${DATA.formatPrice(book.price)}</div>
                    </div>
                    <div class="cart-controls">
                        <div class="cart-qty">
                            <button class="qty-btn" type="button" data-action="dec" data-id="${book.id}"
                                    aria-label="Уменьшить количество: ${DATA.esc(book.title)}">−</button>
                            <span class="qty-num" aria-label="Количество: ${qty}">${qty}</span>
                            <button class="qty-btn" type="button" data-action="inc" data-id="${book.id}"
                                    aria-label="Увеличить количество: ${DATA.esc(book.title)}">+</button>
                        </div>
                        <button class="cart-remove" type="button" data-action="remove" data-id="${book.id}"
                                aria-label="Убрать из корзины: ${DATA.esc(book.title)}">✕</button>
                    </div>
                </div>`;
        }).join('');

        const count = getCount();
        const total = getTotal();

        cartTotalEl.textContent = DATA.formatPrice(total);
        if (cartCountEl) {
            cartCountEl.textContent = `${count} ${DATA.plural(count, 'товар', 'товара', 'товаров')}`;
        }
        if (cartNoteEl) {
            const remain = getRemainingForFreeDelivery();
            cartNoteEl.textContent = remain > 0
                ? `🚚 Добавьте ещё на ${DATA.formatPrice(remain)} — доставка будет бесплатной`
                : '🎉 Поздравляем! Доставка бесплатная';
            cartNoteEl.classList.toggle('cart-note--ok', remain === 0);
        }
    }

    /* Экспорт */
    global.BookstoreCart = {
        addToCart,
        changeQty,
        removeFromCart,
        clearCart,
        getCount,
        getTotal,
        renderCart
    };
})(window);
