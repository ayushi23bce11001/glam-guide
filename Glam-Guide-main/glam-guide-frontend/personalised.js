// Extended product data covering all combinations of occasion, style, and color
const products = [
    { name: "Red Elegant Party Dress", occasion: "party", style: "elegant", color: "#ff0000", image: "https://via.placeholder.com/250/FF0000" },
    { name: "Blue Formal Blazer", occasion: "formal", style: "classic", color: "#0000ff", image: "https://via.placeholder.com/250/0000FF" },
    { name: "Green Casual Sporty Jacket", occasion: "casual", style: "sporty", color: "#00ff00", image: "https://via.placeholder.com/250/00FF00" },
    { name: "Black Modern Office Suit", occasion: "work", style: "modern", color: "#000000", image: "https://via.placeholder.com/250/000000" },
    { name: "Yellow Modern Casual Top", occasion: "casual", style: "modern", color: "#ffff00", image: "https://via.placeholder.com/250/FFFF00" },
    { name: "Pink Elegant Party Gown", occasion: "party", style: "elegant", color: "#ff69b4", image: "https://via.placeholder.com/250/FF69B4" },
    { name: "White Classic Formal Shirt", occasion: "formal", style: "classic", color: "#ffffff", image: "https://via.placeholder.com/250/FFFFFF" },
    { name: "Grey Sporty Casual Hoodie", occasion: "casual", style: "sporty", color: "#808080", image: "https://via.placeholder.com/250/808080" },
    { name: "Brown Modern Work Pants", occasion: "work", style: "modern", color: "#8b4513", image: "https://via.placeholder.com/250/8B4513" },
    { name: "Orange Elegant Party Skirt", occasion: "party", style: "elegant", color: "#ffa500", image: "https://via.placeholder.com/250/FFA500" },
    { name: "Navy Blue Formal Suit", occasion: "formal", style: "classic", color: "#000080", image: "https://via.placeholder.com/250/000080" },
    { name: "Purple Casual Sporty Tracksuit", occasion: "casual", style: "sporty", color: "#800080", image: "https://via.placeholder.com/250/800080" },
    { name: "Teal Modern Work Dress", occasion: "work", style: "modern", color: "#008080", image: "https://via.placeholder.com/250/008080" },
    { name: "Coral Casual Modern Blouse", occasion: "casual", style: "modern", color: "#ff7f50", image: "https://via.placeholder.com/250/FF7F50" },
    { name: "Gold Elegant Party Saree", occasion: "party", style: "elegant", color: "#ffd700", image: "https://via.placeholder.com/250/FFD700" },
];

function generateRecommendations() {
    const occasion = document.getElementById("occasion").value;
    const style = document.getElementById("style").value;
    const color = document.getElementById("color").value.toLowerCase();
    const productContainer = document.getElementById("product-container");

    // Clear previous recommendations
    productContainer.innerHTML = "";

    // Filter products based on preferences
    const filteredProducts = products.filter(product => 
        product.occasion === occasion &&
        product.style === style &&
        product.color === color
    );

    // If no products match, show a message
    if (filteredProducts.length === 0) {
        productContainer.innerHTML = "<p>No recommendations found! Try adjusting your preferences.</p>";
        return;
    }

    // Display filtered products
    filteredProducts.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
        `;
        productContainer.appendChild(productCard);
    });
}
