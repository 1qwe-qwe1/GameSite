// cart.js - Управление корзиной
class Cart {
    constructor() {
        this.items = this.loadCartFromStorage();
        this.updateCartCount();
    }

    // Загрузка корзины из localStorage
    loadCartFromStorage() {
        const savedCart = localStorage.getItem('boardgamehub-cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    // Сохранение корзины в localStorage
    saveCartToStorage() {
        localStorage.setItem('boardgamehub-cart', JSON.stringify(this.items));
    }

    // Добавление товара в корзину
    addItem(productId, name, price, image, description = '') {
        const existingItem = this.items.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: productId,
                name: name,
                price: price,
                image: image,
                description: description,
                quantity: 1
            });
        }
        
        this.saveCartToStorage();
        this.updateCartCount();
        this.updateCartUI();
        return this.items;
    }

    // Удаление товара из корзины
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCartToStorage();
        this.updateCartCount();
        this.updateCartUI();
        return this.items;
    }

    // Обновление количества товара
    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            return this.removeItem(productId);
        }
        
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCartToStorage();
            this.updateCartCount();
            this.updateCartUI();
        }
        return this.items;
    }

    // Очистка корзины
    clearCart() {
        this.items = [];
        this.saveCartToStorage();
        this.updateCartCount();
        this.updateCartUI();
        return this.items;
    }

    // Получение общего количества товаров
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Получение общей суммы
    getTotalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Получение суммы скидки (15% от общей суммы)
    getDiscount() {
        return Math.round(this.getTotalPrice() * 0.15);
    }

    // Получение итоговой суммы
    getFinalPrice() {
        return this.getTotalPrice() - this.getDiscount();
    }

    // Обновление счетчика в хедере
    updateCartCount() {
        const cartCountElements = document.querySelectorAll('.cart-count');
        const totalItems = this.getTotalItems();
        
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
            if (totalItems === 0) {
                element.style.display = 'none';
            } else {
                element.style.display = 'flex';
            }
        });
    }

    // Обновление интерфейса корзины
    updateCartUI() {
        this.renderCartItems();
        this.updateOrderSummary();
    }

    // Отрисовка товаров в корзине
    renderCartItems() {
        const cartItemsContainer = document.getElementById('cartItemsContainer');
        if (!cartItemsContainer) return;

        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold mb-2">Корзина пуста</h3>
                    <p class="text-gray-600 mb-6">Добавьте товары из каталога</p>
                    <a href="ProductCatalog.html" class="bg-yellow-500 text-black px-6 py-3 rounded font-semibold hover:bg-yellow-400 transition-colors">
                        Перейти в каталог
                    </a>
                </div>
            `;
            return;
        }

        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="flex flex-col md:flex-row gap-6 py-6 border-b border-gray-100" data-item-id="${item.id}">
                <div class="flex-shrink-0">
                    <img src="${item.image}" alt="${item.name}" class="w-24 h-24 rounded-lg object-cover">
                </div>
                <div class="flex-1">
                    <h3 class="text-lg font-semibold mb-2">${item.name}</h3>
                    <p class="text-gray-600 mb-3 text-sm">${item.description}</p>
                    <div class="text-lg font-semibold">${this.formatPrice(item.price)} ₽</div>
                </div>
                <div class="flex flex-col items-end justify-between">
                    <div class="flex items-center border border-gray-300 rounded overflow-hidden">
                        <button class="quantity-minus w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">-</button>
                        <input type="text" class="quantity-input w-12 h-9 text-center border-x border-gray-300" value="${item.quantity}">
                        <button class="quantity-plus w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">+</button>
                    </div>
                    <button class="remove-item text-gray-500 hover:text-red-500 transition-colors duration-300 flex items-center gap-2 text-sm mt-4">
                        <i class="fas fa-times"></i> Удалить
                    </button>
                </div>
            </div>
        `).join('');

        this.attachCartEventListeners();
    }

    // Обновление блока с суммой заказа
    updateOrderSummary() {
        const totalItems = this.getTotalItems();
        const totalPrice = this.getTotalPrice();
        const discount = this.getDiscount();
        const finalPrice = this.getFinalPrice();

        // Обновляем счетчик товаров и сумму
        const itemsCountElement = document.querySelector('.summary-row:first-child .summary-value');
        const itemsLabelElement = document.querySelector('.summary-row:first-child .summary-label');
        
        if (itemsCountElement && itemsLabelElement) {
            itemsCountElement.textContent = `${this.formatPrice(totalPrice)} ₽`;
            itemsLabelElement.textContent = `Товары (${totalItems})`;
        }

        // Обновляем скидку
        const discountElement = document.querySelector('.summary-row:nth-child(2) .summary-value');
        if (discountElement) {
            discountElement.textContent = `-${this.formatPrice(discount)} ₽`;
        }

        // Обновляем итоговую сумму
        const totalElement = document.querySelector('.total-row .summary-value');
        if (totalElement) {
            totalElement.textContent = `${this.formatPrice(finalPrice)} ₽`;
        }

        console.log('Order summary updated:', { totalItems, totalPrice, discount, finalPrice });
    }

    // Форматирование цены
    formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    // Привязка обработчиков событий
    attachCartEventListeners() {
        // Удаление товаров
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemElement = e.target.closest('[data-item-id]');
                const itemId = itemElement.getAttribute('data-item-id');
                this.removeItem(itemId);
            });
        });

        // Увеличение количества
        document.querySelectorAll('.quantity-plus').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemElement = e.target.closest('[data-item-id]');
                const itemId = itemElement.getAttribute('data-item-id');
                const input = itemElement.querySelector('.quantity-input');
                const currentQuantity = parseInt(input.value);
                this.updateQuantity(itemId, currentQuantity + 1);
            });
        });

        // Уменьшение количества
        document.querySelectorAll('.quantity-minus').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemElement = e.target.closest('[data-item-id]');
                const itemId = itemElement.getAttribute('data-item-id');
                const input = itemElement.querySelector('.quantity-input');
                const currentQuantity = parseInt(input.value);
                this.updateQuantity(itemId, currentQuantity - 1);
            });
        });

        // Ручной ввод количества
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const itemElement = e.target.closest('[data-item-id]');
                const itemId = itemElement.getAttribute('data-item-id');
                const newQuantity = parseInt(e.target.value) || 1;
                this.updateQuantity(itemId, newQuantity);
            });
        });
    }

    // Инициализация корзины
    init() {
        this.updateCartUI();
        
        // Очистка корзины
        const clearCartBtn = document.querySelector('.clear-cart-btn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                if (this.items.length > 0 && confirm('Вы уверены, что хотите очистить корзину?')) {
                    this.clearCart();
                }
            });
        }

        console.log('Cart initialized with items:', this.items);
    }
}

// Создаем глобальный экземпляр корзины
window.cart = new Cart();

// Функция для добавления товара в корзину (вызывается из других страниц)
window.addToCart = function(productId, name, price, image, description = '') {
    return window.cart.addItem(productId, name, price, image, description);
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    if (window.cart) {
        window.cart.init();
    }
});