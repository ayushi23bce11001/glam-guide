// Add interactivity to service blocks
document.addEventListener("DOMContentLoaded", () => {
    // Handle clicks on service descriptions
    const serviceLinks = document.querySelectorAll('.click-here');

    serviceLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const serviceName = event.target.parentElement.querySelector('p').textContent;
            alert(`Navigating to: ${serviceName}`);
        });
    });

    // Add hover effects to service blocks
    const serviceBlocks = document.querySelectorAll('.service-block');

    serviceBlocks.forEach(block => {
        block.addEventListener('mouseenter', () => {
            block.style.transform = "scale(1.05)";
        });

        block.addEventListener('mouseleave', () => {
            block.style.transform = "scale(1)";
        });
    });
});

// Example dynamic loading for wardrobe seasonal management (if needed for custom data or external calls)
const loadWardrobeManagement = () => {
    // Simulate loading additional data
    console.log("Loading seasonal wardrobe data...");
    // Example API fetch call
    // fetch('/api/wardrobe/seasonal')
    //     .then(response => response.json())
    //     .then(data => console.log(data))
    //     .catch(error => console.error('Error:', error));
};
