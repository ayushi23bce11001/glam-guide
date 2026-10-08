// Get the wardrobe container
const wardrobe = document.getElementById("wardrobe");

// Initialize wardrobe data structure to store outfits by category
const wardrobeData = {
    'blouses': [],
    'suits': [],
    'dresses': [],
    'skirts': [],
    'trousers': [],
    'accessories': []
};

// Function to display outfits based on selected category
function showCategory(category) {
    wardrobe.innerHTML = ''; // Clear the wardrobe display

    // Get outfits from the selected category
    const outfits = wardrobeData[category];

    // If no outfits in category, show a message
    if (outfits.length === 0) {
        const noOutfitsMessage = document.createElement('p');
        noOutfitsMessage.textContent = 'No outfits in this category yet!';
        wardrobe.appendChild(noOutfitsMessage);
        return;
    }

    // Loop through each outfit and create a card for display
    outfits.forEach(outfit => {
        const outfitCard = document.createElement('div');
        outfitCard.classList.add('outfit-card');
        outfitCard.innerHTML = `
            <p><strong>${outfit.name}</strong></p>
            <p>Color: ${outfit.color}</p>
            <p>Material: ${outfit.material}</p>
            <p>Type: ${outfit.type}</p>
        `;
        wardrobe.appendChild(outfitCard);
    });
}

// Function to add outfit to the wardrobe
function addOutfit() {
    const nameInput = document.getElementById('outfit-name');
    const colorSelect = document.getElementById('outfit-color');
    const typeSelect = document.getElementById('outfit-type');
    const materialSelect = document.getElementById('outfit-material');

    const name = nameInput.value.trim();
    const color = colorSelect.value;
    const type = typeSelect.value;
    const material = materialSelect.value;

    // Ensure all fields are filled out before adding the outfit
    if (!name || !color || !type || !material) {
        alert("Please fill out all fields");
        return;
    }

    // Add the new outfit to the selected category's array
    wardrobeData[type].push({
        name: name,
        color: color,
        type: type,
        material: material
    });

    // Automatically show the category after adding the outfit
    showCategory(type);

    // Clear form fields after adding the outfit
    nameInput.value = '';
    colorSelect.value = '';
    typeSelect.value = '';
    materialSelect.value = '';

    // Show confirmation dialog
    alert("Outfit added to wardrobe!");
}

// Event listener to handle category button clicks
const categoryButtons = document.querySelectorAll('.category-btns button');
categoryButtons.forEach(button => {
    button.addEventListener('click', function() {
        const category = this.textContent.toLowerCase(); // Get category name from button text
        showCategory(category);
    });
});
