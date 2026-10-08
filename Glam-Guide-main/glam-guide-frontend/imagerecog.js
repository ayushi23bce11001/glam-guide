document.addEventListener("DOMContentLoaded", () => {
    // Handle image preview
    const fileInput = document.querySelector('input[type="file"]');
    const form = document.querySelector("form");
    const uploadContainer = document.querySelector(".upload-container");

    // Create an image preview element dynamically
    const previewContainer = document.createElement("div");
    previewContainer.style.marginTop = "20px";
    previewContainer.style.textAlign = "center";

    const previewImage = document.createElement("img");
    previewImage.style.maxWidth = "100%";
    previewImage.style.maxHeight = "200px";
    previewImage.style.border = "1px solid #ccc";
    previewImage.style.borderRadius = "5px";

    const previewText = document.createElement("p");
    previewText.style.marginTop = "10px";
    previewText.style.fontSize = "0.9rem";
    previewText.style.color = "#555";
    previewText.textContent = "No image selected.";

    previewContainer.appendChild(previewImage);
    previewContainer.appendChild(previewText);
    uploadContainer.appendChild(previewContainer);

    // Update preview when file is selected
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];

        if (file) {
            // Validate file type
            const validTypes = ["image/jpeg", "image/png", "image/gif"];
            if (!validTypes.includes(file.type)) {
                alert("Please upload a valid image file (JPEG, PNG, GIF).");
                fileInput.value = ""; // Reset the input
                previewImage.src = "";
                previewText.textContent = "No image selected.";
                return;
            }

            // Validate file size (optional, e.g., max 5 MB)
            const maxSizeMB = 5;
            if (file.size > maxSizeMB * 1024 * 1024) {
                alert(`File size exceeds ${maxSizeMB} MB. Please upload a smaller file.`);
                fileInput.value = ""; // Reset the input
                previewImage.src = "";
                previewText.textContent = "No image selected.";
                return;
            }

            // Show preview
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.src = e.target.result;
                previewText.textContent = `Selected: ${file.name}`;
            };
            reader.readAsDataURL(file);
        } else {
            // Reset preview if no file is selected
            previewImage.src = "";
            previewText.textContent = "No image selected.";
        }
    });

    // Form submission confirmation (optional)
    form.addEventListener("submit", (event) => {
        const file = fileInput.files[0];
        if (!file) {
            event.preventDefault();
            alert("Please select an image before submitting.");
        }
    });
});
