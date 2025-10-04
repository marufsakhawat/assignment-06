



// DOM Elements
const catsWrap = document.getElementById('cats-wrap');
const plantsWrap = document.getElementById('plants-wrap');
const cartContainer = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');

// Shopping cart array
let cart = [];

// Render Plant Cards
function renderPlants(plants) {
    plantsWrap.innerHTML = '';

    if (plants.length === 0) {
        plantsWrap.innerHTML = '<p class="p-4 text-center text-gray-500">No plants found.</p>';
        return;
    }

    // Show up to 9 plants
    plants.slice(0, 3).forEach(plant => {
        
        const card = document.createElement('div');
        card.className = "w-full bg-white p-3 rounded-md shadow-md flex flex-col";

        card.innerHTML = `
        <div class="image-wrap w-[100%] h-45 overflow-hidden">
            <img class="w-[100%] h-[auto] rounded-t-lg" src="${plant.image}" alt="${plant.name}">
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

        // Add to cart functionality
        card.querySelector('button').addEventListener('click', () => {
            const existingItem = cart.find(item => item.id === plant.id);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({
                    ...plant,
                    quantity: 1
                });
            }
            updateCartUI();
        });

        plantsWrap.appendChild(card);
    });
}

// Update Cart UI
function updateCartUI() {
    cartContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;

        const cartItem = document.createElement('div');
        cartItem.className = 'flex justify-between items-center bg-green-50 p-2 gap-2 rounded';

        cartItem.innerHTML = `
        <div>
          <h4 class="font-bold">${item.name}</h4>
          <p class="text-gray-500"><i class="fa-solid fa-bangladeshi-taka-sign"></i>${item.price} <span>x ${item.quantity}</span></p>
        </div>
        <i class="fa-solid fa-x text-gray-400 cursor-pointer remove-cart-item"></i>
      `;

        // Remove item from cart
        cartItem.querySelector('.remove-cart-item').addEventListener('click', () => {
            cart = cart.filter(product => product.id !== item.id);
            updateCartUI();
        });

        cartContainer.appendChild(cartItem);
    });

    cartTotalEl.innerHTML = `<i class="fa-solid fa-bangladeshi-taka-sign"></i> <span class="font-semibold">${total}</span>`;
}

// Normalize API Response
function normalizePlantsResponse(data) {
    if (Array.isArray(data)) return data;
    if (data.plants) return Array.isArray(data.plants) ? data.plants : [data.plants];
    if (data.data) return Array.isArray(data.data) ? data.data : [data.data];
    return [];
}

// Load All Plants
function loadAllPlants() {
    plantsWrap.innerHTML = `<div class="text-center p-4">Loading...</div>`;
    fetch('https://openapi.programming-hero.com/api/plants')
        .then(res => res.json())
        .then(data => renderPlants(normalizePlantsResponse(data)));
}

// Load Plants by Category
function loadCategory(categoryId) {
    plantsWrap.innerHTML = `<div class="text-center p-4">Loading...</div>`;
    fetch(`https://openapi.programming-hero.com/api/category/${categoryId}`)
        .then(res => res.json())
        .then(data => renderPlants(normalizePlantsResponse(data)));
}

// Load Categories
function loadCategories() {
    fetch('https://openapi.programming-hero.com/api/categories')
        .then(res => res.json())
        .then(json => {
            catsWrap.innerHTML = '';

            // Add "All Trees" option
            const allOption = document.createElement('li');
            allOption.textContent = 'All Trees';
            allOption.dataset.id = 'all';
            allOption.className = "hover:bg-green-500 text-black font-semibold px-4 py-2 rounded cursor-pointer";
            catsWrap.appendChild(allOption);

            // Add each category
            json.categories.forEach(category => {
                const li = document.createElement('li');
                li.textContent = category.category_name;
                li.dataset.id = category.id;
                li.className = "hover:bg-green-500 text-black font-semibold px-4 py-2 rounded cursor-pointer";
                catsWrap.appendChild(li);
            });

            // Highlight first category and load plants
            catsWrap.firstElementChild.classList.add('bg-green-500', 'text-white');
            loadAllPlants();
        });

    // Handle category click
    catsWrap.addEventListener('click', event => {
        const selected = event.target.closest('li');
        if (!selected) return;

        // Remove highlight from all
        [...catsWrap.children].forEach(li => li.classList.remove('bg-green-500', 'text-white'));

        // Highlight selected
        selected.classList.add('bg-green-500', 'text-white');

        // Load plants based on category
        selected.dataset.id === 'all' ? loadAllPlants() : loadCategory(selected.dataset.id);
    });
}

// Show Plant Details in Modal
function openPlantModal(plantId) {
    const dialog = document.getElementById('plant_modal');
    const modalContent = document.getElementById('modal-content-container');

    modalContent.innerHTML = `<div class="p-6 text-center">Loading...</div>`;
    dialog.showModal();

    fetch(`https://openapi.programming-hero.com/api/plant/${plantId}`)
        .then(res => res.json())
        .then(json => {
            const plant = normalizePlantsResponse(json)[0];

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

// Event Listener for Plant Details
plantsWrap.addEventListener('click', event => {
    const plantTitle = event.target.closest('h3[data-id]');
    if (plantTitle) openPlantModal(plantTitle.dataset.id);
});

// Initialize App
loadCategories();