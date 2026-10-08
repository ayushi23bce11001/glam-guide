/**
 * Glam Guide - Real AI Outfit Recommendation
 * Curates outfits using ONLY the authenticated user's actual wardrobe items from MongoDB
 */

document.addEventListener('DOMContentLoaded', () => {
    const outfitForm = document.getElementById('outfit-form');
    const resultDiv = document.getElementById('outfit-results');

    if (!outfitForm || !resultDiv) return;

    outfitForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const bodyType = document.getElementById('body-type').value;
        const style = document.getElementById('style-preference').value;
        const occasion = document.getElementById('occasion').value;

        const submitBtn = outfitForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.textContent : 'Find My Look';

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = '✨ Curating Look with AI...';
        }

        resultDiv.innerHTML = `
            <div style="padding: 30px; text-align: center;">
                <h2 style="color: #0c0c0c;">🤖 AI is curating your personalized outfit...</h2>
                <p style="color: #666; font-size: 1.05rem;">Selecting the best combination from your actual wardrobe.</p>
            </div>
        `;

        try {
            const data = await GlamAPI.getOutfitRecommendation({
                bodyType,
                style,
                occasion
            });

            const recommendation = data.recommendation;

            if (!recommendation || (!recommendation.outfit || recommendation.outfit.length === 0)) {
                resultDiv.innerHTML = `
                    <div style="padding: 20px; text-align: center;">
                        <h2 style="color: #e63946;">No Matching Combination Found</h2>
                        <p style="color: #666;">Try adding more versatile items to your wardrobe or adjusting your style preferences.</p>
                    </div>
                `;
                return;
            }

            let cardsHtml = '';

            // Render outfit pieces from user's wardrobe
            recommendation.outfit.forEach(piece => {
                const item = piece.item;
                const role = piece.role || item.category || 'Piece';

                cardsHtml += `
                    <div class="outfit">
                        <div style="position: relative;">
                            <img src="${item.imageUrl}" alt="${item.name}" onerror="this.src='home.png'" style="width: 100%; height: 220px; object-fit: cover; border-radius: 8px;">
                            <span style="position: absolute; top: 8px; right: 8px; background: #0c0c0c; color: #fff; padding: 3px 8px; border-radius: 12px; font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">${role}</span>
                        </div>
                        <p style="font-weight: 600; margin-top: 10px; font-size: 1.05rem;">${item.name}</p>
                        <p style="color: #666; font-size: 0.9rem; text-transform: capitalize;">${item.color} • ${item.season} • ${item.material || 'Standard'}</p>
                    </div>
                `;
            });

            // Render accessory if recommended
            if (recommendation.accessory && recommendation.accessory.item) {
                const acc = recommendation.accessory.item;
                cardsHtml += `
                    <div class="outfit">
                        <div style="position: relative;">
                            <img src="${acc.imageUrl}" alt="${acc.name}" onerror="this.src='home.png'" style="width: 100%; height: 220px; object-fit: cover; border-radius: 8px;">
                            <span style="position: absolute; top: 8px; right: 8px; background: #5e72eb; color: #fff; padding: 3px 8px; border-radius: 12px; font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">Accessory</span>
                        </div>
                        <p style="font-weight: 600; margin-top: 10px; font-size: 1.05rem;">${acc.name}</p>
                        <p style="color: #666; font-size: 0.9rem; text-transform: capitalize;">${acc.color} • ${acc.season}</p>
                    </div>
                `;
            }

            resultDiv.innerHTML = `
                <h2>Recommended Outfit for You:</h2>
                <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; margin-top: 20px;">
                    ${cardsHtml}
                </div>
                <div style="margin-top: 35px; padding: 25px; background: #ffffff; border: 1.5px solid #e0e0e0; border-left: 6px solid #e63946; border-radius: 10px; text-align: left; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <h3 style="color: #e63946; margin-bottom: 8px; font-size: 1.25rem;">✨ Why This Outfit Works</h3>
                    <p style="color: #333; font-size: 1.05rem; line-height: 1.6; margin-bottom: 16px;">${recommendation.reason}</p>
                    <h4 style="color: #111; margin-bottom: 6px; font-size: 1.1rem;">💡 Styling Tip</h4>
                    <p style="color: #555; font-size: 1rem; line-height: 1.5; font-style: italic;">${recommendation.stylingTip}</p>
                </div>
            `;
        } catch (error) {
            console.error('Recommendation error:', error);
            if (error.status === 401) {
                resultDiv.innerHTML = `
                    <div style="padding: 30px; text-align: center; background: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                        <h2 style="color: #333; margin-bottom: 12px;">Authentication Required</h2>
                        <p style="color: #666; font-size: 1.05rem; margin-bottom: 20px;">Please log in to receive AI outfit recommendations curated directly from your virtual wardrobe.</p>
                        <a href="login.html" style="display: inline-block; background: #0c0c0c; color: #fff; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">Log In Now</a>
                    </div>
                `;
            } else if (error.status === 400 && (error.data?.code === 'EMPTY_WARDROBE' || error.data?.code === 'INSUFFICIENT_ITEMS' || error.message.includes('wardrobe'))) {
                resultDiv.innerHTML = `
                    <div style="padding: 30px; text-align: center; background: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                        <h2 style="color: #333; margin-bottom: 12px;">Your Wardrobe Needs Clothes First</h2>
                        <p style="color: #666; font-size: 1.05rem; margin-bottom: 20px;">${error.message}</p>
                        <a href="wardrobemanagement.html" style="display: inline-block; background: #28a745; color: #fff; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">Go to Virtual Wardrobe</a>
                    </div>
                `;
            } else {
                resultDiv.innerHTML = `
                    <div style="padding: 25px; text-align: center; background: #fff3f3; border: 1px solid #f5c6cb; border-radius: 8px;">
                        <h3 style="color: #721c24; margin-bottom: 8px;">Error Generating Recommendation</h3>
                        <p style="color: #721c24;">${error.message || 'Could not connect to the recommendation service. Please check your backend.'}</p>
                    </div>
                `;
            }
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        }
    });
});
