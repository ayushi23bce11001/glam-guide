/**
 * Glam Guide - Wardrobe Management
 * Powered by JWT authentication and real Gemini AI clothing analysis
 */

let currentSeasonFilter = 'all';

// Image file selection & instant preview
const clothingFileInput = document.getElementById('clothing-file');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const aiStatus = document.getElementById('ai-status');

if (clothingFileInput) {
    clothingFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imagePreview.src = event.target.result;
                imagePreviewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            imagePreviewContainer.style.display = 'none';
        }
    });
}

/**
 * Upload image to backend and run AI clothing analysis
 */
async function analyzeClothingWithAI() {
    const file = clothingFileInput ? clothingFileInput.files[0] : null;

    if (!file) {
        alert('Please choose a clothing image file first.');
        return;
    }

    const analyzeBtn = document.getElementById('analyze-btn');
    const originalText = analyzeBtn.textContent;
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '✨ Analyzing with AI...';

    if (aiStatus) {
        aiStatus.style.display = 'block';
        aiStatus.style.color = '#5e72eb';
        aiStatus.textContent = '🤖 Analyzing clothing image with Gemini AI... Please wait.';
    }

    try {
        const result = await GlamAPI.analyzeImage(file);

        // Store persistent image URL
        document.getElementById('outfit-image-url').value = result.imageUrl;
        imagePreview.src = result.imageUrl;
        imagePreviewContainer.style.display = 'block';

        // Auto-populate form fields with detected attributes
        if (result.attributes) {
            const attrs = result.attributes;

            if (attrs.name) document.getElementById('outfit-name').value = attrs.name;
            if (attrs.category) {
                const catSelect = document.getElementById('outfit-category');
                if (catSelect) catSelect.value = attrs.category;
            }
            if (attrs.color) {
                const colorSelect = document.getElementById('outfit-color');
                // Check if detected color is in dropdown, otherwise select or keep
                let matched = false;
                for (let i = 0; i < colorSelect.options.length; i++) {
                    if (colorSelect.options[i].value.toLowerCase() === attrs.color.toLowerCase()) {
                        colorSelect.selectedIndex = i;
                        matched = true;
                        break;
                    }
                }
                if (!matched) {
                    // Add temporary option if not in preset list
                    const opt = new Option(attrs.color.charAt(0).toUpperCase() + attrs.color.slice(1), attrs.color.toLowerCase(), true, true);
                    colorSelect.add(opt);
                }
            }
            if (attrs.season) {
                const seasonSelect = document.getElementById('outfit-season');
                for (let i = 0; i < seasonSelect.options.length; i++) {
                    if (seasonSelect.options[i].value.toLowerCase() === attrs.season.toLowerCase()) {
                        seasonSelect.selectedIndex = i;
                        break;
                    }
                }
            }
            if (attrs.material) {
                const matSelect = document.getElementById('outfit-material');
                let matched = false;
                for (let i = 0; i < matSelect.options.length; i++) {
                    if (matSelect.options[i].value.toLowerCase() === attrs.material.toLowerCase()) {
                        matSelect.selectedIndex = i;
                        matched = true;
                        break;
                    }
                }
                if (!matched) {
                    const opt = new Option(attrs.material.charAt(0).toUpperCase() + attrs.material.slice(1), attrs.material.toLowerCase(), true, true);
                    matSelect.add(opt);
                }
            }
            if (attrs.pattern) {
                const patternInput = document.getElementById('outfit-pattern');
                if (patternInput) patternInput.value = attrs.pattern;
            }
            if (attrs.style) {
                const styleInput = document.getElementById('outfit-style');
                if (styleInput) styleInput.value = attrs.style;
            }
        }

        if (aiStatus) {
            aiStatus.style.color = '#28a745';
            aiStatus.textContent = '✅ Analysis complete! Review and edit the detected attributes below, then click "Add to Wardrobe".';
        }
    } catch (error) {
        console.error('AI analysis error:', error);
        if (aiStatus) {
            aiStatus.style.color = '#dc3545';
            aiStatus.textContent = `❌ ${error.message || 'AI analysis failed'}`;
        }
        alert(error.message || 'AI analysis failed. Please ensure you are logged in and your backend AI key is set.');
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = originalText;
    }
}

/**
 * Display outfits in cards and table
 */
function displayOutfits(outfits) {
    const wardrobe = document.getElementById('wardrobe');
    const tableBody = document.querySelector('#outfit-table tbody');

    wardrobe.innerHTML = '';
    tableBody.innerHTML = '';

    if (!outfits || outfits.length === 0) {
        const filterMsg = currentSeasonFilter !== 'all' ? ` for ${currentSeasonFilter}` : '';
        wardrobe.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                <p style="font-size: 1.15rem; color: #666; margin-bottom: 8px;">No wardrobe items found${filterMsg}.</p>
                <p style="font-size: 0.95rem; color: #888;">Upload a photo of your clothing item above to add it to your virtual wardrobe!</p>
            </div>
        `;
        return;
    }

    outfits.forEach(item => {
        // Wardrobe Card
        const outfitCard = document.createElement('div');
        outfitCard.classList.add('outfit-card');
        outfitCard.innerHTML = `
            <div style="position: relative; overflow: hidden; border-radius: 6px; height: 210px; background: #eee;">
                <img src="${item.imageUrl}" alt="${item.name}" onerror="this.src='home.png'" style="width: 100%; height: 100%; object-fit: cover;">
                <span style="position: absolute; top: 10px; right: 10px; background: rgba(0, 123, 255, 0.9); color: #fff; padding: 3px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 600; text-transform: uppercase;">${item.category || 'Item'}</span>
            </div>
            <p style="font-size: 1.1rem; margin-top: 12px;"><strong>${item.name}</strong></p>
            <div style="text-align: left; margin: 10px 0; font-size: 0.92rem; color: #555; line-height: 1.6;">
                <p><strong>Color:</strong> ${item.color}</p>
                <p><strong>Season:</strong> ${item.season}</p>
                <p><strong>Material:</strong> ${item.material || 'N/A'}</p>
                ${item.style ? `<p><strong>Style:</strong> ${item.style}</p>` : ''}
                ${item.pattern ? `<p><strong>Pattern:</strong> ${item.pattern}</p>` : ''}
            </div>
            <button style="margin-top: 10px; background: #dc3545; color: #fff; border: none; padding: 8px 18px; border-radius: 5px; cursor: pointer; font-weight: 500; width: 100%;" onclick="deleteOutfit('${item._id}')">Delete</button>
        `;
        wardrobe.appendChild(outfitCard);

        // Table Row
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="${item.imageUrl}" alt="${item.name}" onerror="this.src='home.png'" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
            </td>
            <td><strong>${item.name}</strong></td>
            <td style="text-transform: capitalize;">${item.category || '-'}</td>
            <td style="text-transform: capitalize;">${item.color}</td>
            <td style="text-transform: capitalize;">${item.season}</td>
            <td style="text-transform: capitalize;">${item.material || '-'}</td>
            <td><button style="background: #dc3545; color: #fff; border: none; padding: 6px 14px; border-radius: 5px; cursor: pointer;" onclick="deleteOutfit('${item._id}')">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Filter outfits by season
 */
async function showCategory(season) {
    currentSeasonFilter = season;

    // Highlight active season button
    const buttons = document.querySelectorAll('.category-btns button');
    buttons.forEach(btn => {
        if (btn.textContent.trim().toLowerCase() === season.toLowerCase() || (season === 'all' && btn.textContent.trim().toLowerCase() === 'all')) {
            btn.style.backgroundColor = '#0056b3';
        } else {
            btn.style.backgroundColor = '#007bff';
        }
    });

    try {
        const response = await GlamAPI.getWardrobe({ season });
        displayOutfits(response.items);
    } catch (error) {
        console.error('Error fetching season outfits:', error);
        if (error.status === 401) {
            showUnauthenticatedPrompt();
        } else {
            alert(error.message || 'Failed to fetch outfits');
        }
    }
}

/**
 * Add a new outfit to wardrobe
 */
async function addOutfit() {
    const name = document.getElementById('outfit-name').value.trim();
    const category = document.getElementById('outfit-category').value;
    const color = document.getElementById('outfit-color').value;
    const season = document.getElementById('outfit-season').value;
    const material = document.getElementById('outfit-material').value;
    const pattern = document.getElementById('outfit-pattern') ? document.getElementById('outfit-pattern').value.trim() : 'solid';
    const style = document.getElementById('outfit-style') ? document.getElementById('outfit-style').value.trim() : 'casual';
    let imageUrl = document.getElementById('outfit-image-url').value;

    if (!name || !category || !color || !season) {
        alert('Please fill out Outfit Name, Category, Color, and Season.');
        return;
    }

    // If no uploaded image URL, check if user chose a file without analyzing
    if (!imageUrl && clothingFileInput && clothingFileInput.files[0]) {
        try {
            if (aiStatus) {
                aiStatus.style.display = 'block';
                aiStatus.style.color = '#5e72eb';
                aiStatus.textContent = 'Uploading clothing image...';
            }
            const res = await GlamAPI.analyzeImage(clothingFileInput.files[0]);
            imageUrl = res.imageUrl;
            document.getElementById('outfit-image-url').value = imageUrl;
        } catch (err) {
            alert('Failed to upload clothing image: ' + err.message);
            return;
        }
    }

    if (!imageUrl) {
        alert('Please upload an image of your clothing item first.');
        return;
    }

    const payload = {
        name,
        category,
        color,
        season,
        material: material || 'cotton',
        pattern: pattern || 'solid',
        style: style || 'casual',
        imageUrl
    };

    try {
        const result = await GlamAPI.addWardrobeItem(payload);
        alert(result.message || 'Wardrobe item added successfully!');

        // Reset form
        document.getElementById('outfit-name').value = '';
        document.getElementById('outfit-category').value = '';
        document.getElementById('outfit-color').value = '';
        document.getElementById('outfit-season').value = '';
        document.getElementById('outfit-material').value = '';
        if (document.getElementById('outfit-pattern')) document.getElementById('outfit-pattern').value = '';
        if (document.getElementById('outfit-style')) document.getElementById('outfit-style').value = '';
        document.getElementById('outfit-image-url').value = '';
        if (clothingFileInput) clothingFileInput.value = '';
        if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';
        if (aiStatus) aiStatus.style.display = 'none';

        // Reload wardrobe
        await loadAllOutfits();
    } catch (error) {
        console.error('Error saving outfit:', error);
        alert(error.message || 'Failed to save wardrobe item.');
    }
}

/**
 * Fetch and display all outfits
 */
async function loadAllOutfits() {
    try {
        const response = await GlamAPI.getWardrobe({ season: currentSeasonFilter });
        displayOutfits(response.items);
    } catch (error) {
        console.error('Error loading outfits:', error);
        if (error.status === 401) {
            showUnauthenticatedPrompt();
        }
    }
}

/**
 * Delete outfit by ID
 */
async function deleteOutfit(id) {
    if (!confirm('Are you sure you want to delete this wardrobe item?')) return;

    try {
        const result = await GlamAPI.deleteWardrobeItem(id);
        alert(result.message || 'Item deleted successfully.');
        await loadAllOutfits();
    } catch (error) {
        console.error('Error deleting outfit:', error);
        alert(error.message || 'Failed to delete outfit.');
    }
}

function showUnauthenticatedPrompt() {
    const wardrobe = document.getElementById('wardrobe');
    wardrobe.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px; background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <h3 style="margin-bottom: 12px; color: #333;">Welcome to Virtual Wardrobe</h3>
            <p style="font-size: 1.05rem; color: #666; margin-bottom: 24px;">Please log in or create an account to organize your personal virtual wardrobe.</p>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <a href="login.html" style="background: #007bff; color: #fff; padding: 10px 24px; text-decoration: none; border-radius: 5px; font-weight: 600;">Log In</a>
                <a href="signup.html" style="background: #28a745; color: #fff; padding: 10px 24px; text-decoration: none; border-radius: 5px; font-weight: 600;">Sign Up</a>
            </div>
        </div>
    `;
}

// Initial load
document.addEventListener('DOMContentLoaded', async () => {
    // Setup Hamburger
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');
    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
        document.addEventListener('click', (e) => {
            if (!hamburgerBtn.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('open');
            }
        });
    }

    await loadAllOutfits();
});
