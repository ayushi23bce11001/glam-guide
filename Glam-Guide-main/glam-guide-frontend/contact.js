// Wait for the DOM content to fully load
document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.querySelector(".contact-form");

    // Add a submit event listener to the form
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Prevent the default form submission

        // Retrieve form values
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        // Basic validation
        if (!name || !email || !message) {
            alert("Please fill out all fields before submitting.");
            return;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        // Confirmation message on successful submission
        alert(`Thank you, ${name}! Your message has been successfully sent.`);

        // Optionally, reset the form
        contactForm.reset();
    });
});
