/* ============================================================
   Книжный червь — МОДУЛЬ 1: данные каталога и утилиты
   Отвечает только за данные книг и вспомогательные функции.
   ============================================================ */

(function (global) {
    'use strict';

    /* ---------- Каталог книг ---------- */
    const books = [
        { id: 1,  title: 'Тень ветра', author: 'Карлос Руис Сафон', genre: 'classic', authorType: 'modern', price: 890, cover: 'covers/cover-1.svg' },
        { id: 2,  title: 'Мастер и Маргарита', author: 'Михаил Булгаков', genre: 'classic', authorType: 'classic', price: 720, cover: 'covers/cover-2.svg' },
        { id: 3,  title: 'Игра престолов', author: 'Джордж Р. Р. Мартин', genre: 'fantasy', authorType: 'modern', price: 1190, cover: 'covers/cover-3.svg' },
        { id: 4,  title: 'Ведьмак. Последнее желание', author: 'Анджей Сапковский', genre: 'fantasy', authorType: 'modern', price: 830, cover: 'covers/cover-4.svg' },
        { id: 5,  title: 'Убийство в «Восточном экспрессе»', author: 'Агата Кристи', genre: 'detective', authorType: 'classic', price: 610, cover: 'covers/cover-5.svg' },
        { id: 6,  title: 'Девушка с татуировкой дракона', author: 'Стиг Ларссон', genre: 'detective', authorType: 'modern', price: 780, cover: 'covers/cover-6.svg' },
        { id: 7,  title: 'Виноваты звёзды', author: 'Джон Грин', genre: 'teen', authorType: 'teen', price: 540, cover: 'covers/cover-7.svg' },
        { id: 8,  title: 'Над пропастью во ржи', author: 'Джером Сэлинджер', genre: 'teen', authorType: 'classic', price: 490, cover: 'covers/cover-8.svg' },
        { id: 9,  title: 'Дюна', author: 'Фрэнк Герберт', genre: 'scifi', authorType: 'classic', price: 990, cover: 'covers/cover-9.svg' },
        { id: 10, title: 'Задача трёх тел', author: 'Лю Цысинь', genre: 'scifi', authorType: 'modern', price: 870, cover: 'covers/cover-10.svg' },
        { id: 11, title: 'Sapiens. Краткая история человечества', author: 'Юваль Ной Харари', genre: 'nonfiction', authorType: 'modern', price: 1290, cover: 'covers/cover-11.svg' },
        { id: 12, title: 'Думай медленно… решай быстро', author: 'Даниэль Канеман', genre: 'nonfiction', authorType: 'modern', price: 1090, cover: 'covers/cover-12.svg' },
        { id: 13, title: 'Гарри Поттер и философский камень', author: 'Дж. К. Роулинг', genre: 'teen', authorType: 'teen', price: 890, cover: 'covers/cover-13.svg' },
        { id: 14, title: '451° по Фаренгейту', author: 'Рэй Брэдбери', genre: 'scifi', authorType: 'classic', price: 560, cover: 'covers/cover-14.svg' },
        { id: 15, title: 'Триумфальная арка', author: 'Эрих Мария Ремарк', genre: 'classic', authorType: 'classic', price: 680, cover: 'covers/cover-15.svg' },
        { id: 16, title: 'Чистый код', author: 'Роберт Мартин', genre: 'nonfiction', authorType: 'modern', price: 1490, cover: 'covers/cover-16.svg' }
    ];

    const booksById = Object.fromEntries(books.map((book) => [book.id, book]));

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

    /* Экспорт в глобальную область видимости */
    global.BookstoreData = { books, booksById, esc, plural, formatPrice };
})(window);
