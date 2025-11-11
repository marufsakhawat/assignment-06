// DOM Elements
const categoryList = document.getElementById('cats-wrap');
const plantList = document.getElementById('plants-wrap');
const cartBox = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');

// Cart array
let cart = [];

// Render plants
function showPlants(plants) {
    plantList.innerHTML = '';
    if (!plants.length) {
        plantList.innerHTML = '<p class="p-4 text-center text-gray-500">No plants found.</p>';
        return;
    }
    plants.slice(0, 9).forEach(plant => {
        const div = document.createElement('div');
        div.className = "w-full bg-white p-3 rounded-md shadow-md flex flex-col";

        div.innerHTML = `
        <div class="image-wrap w-full h-45 overflow-hidden">
            <img class="w-full h-auto rounded-t-lg" src="${plant.image}" alt="${plant.name}">
        </div>
        <div class="p-1 flex flex-col">
            <h3 class="font-bold text-lg mt-2 cursor-pointer text-green-800" data-id="${plant.id}">${plant.name}</h3>
            <p class="text-gray-500 text-sm mt-2 flex-1">${plant.description.slice(0, 8)}...</p>
            <div class="mt-3 flex justify-between items-center">
                <span class="text-green-600 bg-green-100 p-1 text-sm rounded-full">${plant.category}</span>
                <span class="font-bold text-xl"><i class="fa-solid fa-bangladeshi-taka-sign"></i>${plant.price}</span>
            </div>
            <button class="mt-3 w-full text-white bg-green-800 px-5 py-2 rounded-full font-semibold hover:bg-yellow-300 hover:text-green-900 transition">
                Add to Cart
            </button>
        </div>
        `;

        // Add to cart
        div.querySelector('button').addEventListener('click', () => {
            const item = cart.find(i => i.id === plant.id);
            if (item) item.quantity++;
            else cart.push({ ...plant, quantity: 1 });
            updateCart();
        }
    );
        plantList.appendChild(div);
    });
}

// Update cart
function updateCart() {
    cartBox.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;

        const div = document.createElement('div');
        div.className = 'flex justify-between items-center bg-green-50 p-2 gap-2 rounded';
        div.innerHTML = `
        <div>
            <h4 class="font-bold">${item.name}</h4>
            <p class="text-gray-500"><i class="fa-solid fa-bangladeshi-taka-sign"></i>${item.price} x ${item.quantity}</p>
        </div>
        <i class="fa-solid fa-x text-gray-400 cursor-pointer remove-cart-item"></i>
        `;
        div.querySelector('.remove-cart-item').addEventListener('click', () => {
            cart = cart.filter(i => i.id !== item.id);
            updateCart();
        });
        cartBox.appendChild(div);
    });
    cartTotal.innerHTML = `<i class="fa-solid fa-bangladeshi-taka-sign"></i> <span class="font-semibold">${total}</span>`;
}

// Normalize API
function normalizeData(data) {
    if (Array.isArray(data)) return data;
    if (data.plants) return Array.isArray(data.plants) ? data.plants : [data.plants];
    if (data.data) return Array.isArray(data.data) ? data.data : [data.data];
    return [];
}

// Load plants from URL
function loadPlants(url) {
    plantList.innerHTML = `<div class="text-center p-4">Loading...</div>`;
    fetch(url)
        .then(res => res.json())
        .then(data => showPlants(normalizeData(data)));
}

// Load all plants
function loadAllPlants() {
    loadPlants('https://openapi.programming-hero.com/api/plants');
}

// Load category
function loadCategory(id) {
    loadPlants(`https://openapi.programming-hero.com/api/category/${id}`);
}

// Load categories
function loadCategories() {
    fetch('https://openapi.programming-hero.com/api/categories')
        .then(res => res.json())
        .then(json => {
            categoryList.innerHTML = '';
            const allLi = document.createElement('li');
            allLi.textContent = 'All Trees';
            allLi.dataset.id = 'all';
            allLi.className = "hover:bg-green-500 text-black font-semibold px-4 py-2 rounded cursor-pointer";
            categoryList.appendChild(allLi);
            json.categories.forEach(cat => {
                const li = document.createElement('li');
                li.textContent = cat.category_name;
                li.dataset.id = cat.id;
                li.className = "hover:bg-green-500 text-black font-semibold px-4 py-2 rounded cursor-pointer";
                categoryList.appendChild(li);
            });
            categoryList.firstElementChild.classList.add('bg-green-500', 'text-white');
            loadAllPlants();
        });

        categoryList.addEventListener('click', e => {
        const selected = e.target.closest('li');
        if (!selected) return;

        [...categoryList.children].forEach(li => li.classList.remove('bg-green-500', 'text-white'));
        selected.classList.add('bg-green-500', 'text-white');

        selected.dataset.id === 'all' ? loadAllPlants() : loadCategory(selected.dataset.id);
    });
}

// Plant modal
function showModal(id) {
    const dialog = document.getElementById('plant_modal');
    const modalContent = document.getElementById('modal-content-container');
    modalContent.innerHTML = `<div class="p-6 text-center">Loading...</div>`;
    dialog.showModal();

    fetch(`https://openapi.programming-hero.com/api/plant/${id}`)
        .then(res => res.json())
        .then(json => {
            const plant = normalizeData(json)[0];
            modalContent.innerHTML = `
            <div class="p-4">
                <h3 class="text-xl font-bold">${plant.name}</h3>
                <img src="${plant.image}" class="w-full h-44 md:h-56 object-cover rounded-md mt-3" />
                <p class="mt-2 text-sm"><b>Category:</b> ${plant.category}</p>
                <p class="mt-1 text-sm"><b>Price:</b> ৳${plant.price}</p>
                <p class="mt-1 text-sm"><b>Description:</b> ${plant.description}</p>
                <div class="mt-4 text-right">
                    <button class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300" onclick="document.getElementById('plant_modal').close()">Close</button>
                </div>
            </div>
            `;
        }
    );
}

// Click on plant title to open modal
plantList.addEventListener('click', e => {
    const plantEl = e.target.closest('h3[data-id]');
    if (plantEl) showModal(plantEl.dataset.id);
});

// load category
loadCategories();