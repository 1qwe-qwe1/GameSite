// Импорт необходимых модулей Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-analytics.js";
import {getDatabase, ref, get, remove, update} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";

// Конфигурация Firebase для веб-приложения
const firebaseConfig = {
    apiKey: "AIzaSyDuYb4O0s7accu6T5MSbJ6WUiSpwnJI6gk",
    authDomain: "gamestore-8a2a3.firebaseapp.com",
    databaseURL: "https://gamestore-8a2a3-default-rtdb.firebaseio.com",
    projectId: "gamestore-8a2a3",
    storageBucket: "gamestore-8a2a3.firebasestorage.app",
    messagingSenderId: "630285121213",
    appId: "1:630285121213:web:6cc7f2cc0350e0f020e9d4",
    measurementId: "G-3EXSGX4EWJ"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function loadProducts() {
    try {
        const productsRef = ref(db, 'Products');
        const snapshot = await get(productsRef);
        const collectionGrid = document.querySelector('.productsGrid');
        
        // Очищаем только если элемент существует
        if (collectionGrid) {
            collectionGrid.innerHTML = '';
        } else {
            console.error("Collection grid element not found");
            return;
        }

        if (snapshot.exists()) {
            const products = snapshot.val();
            
            const productsArray = Object.entries(products)
                .sort(([id1], [id2]) => id1 - id2)
                .map(([id, product]) => ({ id, ...product }));

            for (const product of productsArray) {
                await createProductCard(product, collectionGrid);
            }
            
            // Добавляем обработчики после создания всех карточек
            addEventListenersToButtons();
        } else {
            console.log("No products available");
        }
    } catch (error) {
        console.error("Error loading products:", error);
        alert("Error loading products. See console for details.");
    }
}

async function createProductCard(product, container) {
    try {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Локальный путь к изображению
        const imageUrl = product.Image ? `image/${product.Image}` : 'images/placeholder.jpg';

        productCard.innerHTML = `
            <img src="${imageUrl}" 
                 alt="${product.Name || 'Product'}" 
                 class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.Name || 'No Name'}</h3>
                <p class="product-price">$${product.Price || '0'}</p>
                <div class="product-actions">
                    <button class="edit-btn" data-id="${product.id}">Edit</button>
                    <button class="delete-btn" data-id="${product.id}">Delete</button>
                </div>
            </div>
        `;

        container.appendChild(productCard);
    } catch (error) {
        console.error("Error creating product card:", error);
    }
}

function addEventListenersToButtons() {
    // Обработчики для кнопок удаления
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const productId = e.target.getAttribute('data-id');
            await deleteProduct(productId);
        });
    });
    
    // Обработчики для кнопок редактирования
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const productId = e.target.getAttribute('data-id');
            const productRef = ref(db, `Products/${productId}`);
            const snapshot = await get(productRef);
            if (snapshot.exists()) {
                openEditModal({ id: productId, ...snapshot.val() });
            } else {
                console.error("Product not found");
                alert("Product not found");
            }
        });
    });
}

async function deleteProduct(productId) {
    try {
        const confirmDelete = confirm("Are you sure you want to delete this product?");
        if (!confirmDelete) return;
        
        const productRef = ref(db, `Products/${productId}`);
        await remove(productRef);
        
        alert("Product deleted successfully!");
        await loadProducts(); // Обновляем список товаров
    } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product. See console for details.");
    }
}

function openEditModal(product) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Edit Product</h2>
            <form id="edit-product-form">
                <input type="hidden" id="edit-product-id" value="${product.id}">
                <div class="form-group">
                    <label for="edit-name">Name:</label>
                    <input type="text" id="edit-name" value="${product.Name || ''}" required>
                </div>
                <div class="form-group">
                    <label for="edit-price">Price:</label>
                    <input type="number" id="edit-price" value="${product.Price || ''}" required>
                </div>
                <div class="form-group">
                    <label for="edit-image">Image filename (in image/ folder):</label>
                    <input type="text" id="edit-image" value="${product.Image || ''}">
                    <small>Example: product1.jpg</small>
                </div>
                <button type="submit">Save Changes</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Обработчик закрытия модального окна
    const closeModal = () => modal.remove();
    
    modal.querySelector('.close-modal').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    modal.querySelector('#edit-product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await updateProduct(product.id);
            closeModal();
        } catch (error) {
            console.error("Error updating product:", error);
            alert("Failed to update product. See console for details.");
        }
    });
}

async function updateProduct(productId) {
    try {
        const name = document.getElementById('edit-name').value;
        const price = document.getElementById('edit-price').value;
        const image = document.getElementById('edit-image').value;

        const productRef = ref(db, `Products/${productId}`);
        await update(productRef, {
            Name: name,
            Price: price,
            Image: image
        });

        alert("Product updated successfully!");
        await loadProducts(); // Обновляем список товаров
    } catch (error) {
        console.error("Error updating product:", error);
        throw error; // Пробрасываем ошибку для обработки в вызывающем коде
    }
}

// Загружаем продукты при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadProducts().catch(error => {
        console.error("Initial load error:", error);
    });
});