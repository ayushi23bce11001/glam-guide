// Add event listener to highlight active nav link
document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".nav-links a");
    const currentPage = window.location.pathname.split("/").pop();

    navLinks.forEach(link => {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
        }
    });
});

// Add active class CSS styling dynamically
const style = document.createElement("style");
style.textContent = `
    .nav-links a.active {
        color: #000000;
        background-color: #ffffff;
        border-radius: 5px;
        font-weight: bold;
    }
`;
document.head.appendChild(style);

// Smooth scroll for navigation
document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", event => {
        const targetId = event.target.getAttribute("href").split(".html")[0];
        const targetElement = document.querySelector(`#${targetId}`);
        if (targetElement) {
            event.preventDefault();
            targetElement.scrollIntoView({ behavior: "smooth" });
        }
    });
});

// Animations for fading and scrolling
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll(".about, footer").forEach(section => {
    observer.observe(section);
});

// Lazy load any future images or additional content (optional)
const lazyLoad = target => {
    const io = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                observer.disconnect();
            }
        });
    });
    io.observe(target);
};

// Example: Lazy load for images
document.querySelectorAll("img[data-src]").forEach(img => {
    lazyLoad(img);
});
