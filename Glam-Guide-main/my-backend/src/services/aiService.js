import { GoogleGenAI } from '@google/genai';

const getAiClient = () => {
    const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        const error = new Error('AI API key is not configured. Please set AI_API_KEY in your environment variables.');
        error.code = 'AI_NOT_CONFIGURED';
        error.statusCode = 503;
        throw error;
    }
    return new GoogleGenAI({ apiKey });
};

const getModelCandidates = () => {
    const configured = process.env.AI_MODEL;
    // Valid Gemini model names in priority order
    const defaults = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
    if (configured) {
        const candidates = [configured];
        for (const m of defaults) {
            if (!candidates.includes(m)) candidates.push(m);
        }
        return candidates;
    }
    return defaults;
};

/**
 * Sleep helper for retry delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Call Gemini with:
 *   - Automatic model fallback on 404 / deprecated / not-found errors
 *   - Up to one retry per model for temporary 503 / UNAVAILABLE errors
 *   - Maximum 3 total attempts across all models combined
 *   - Short 1-second delay before retrying a transient failure
 */
const callGeminiWithFallback = async (ai, requestParams) => {
    const models = getModelCandidates();
    let lastError = null;
    let totalAttempts = 0;
    const MAX_TOTAL_ATTEMPTS = 3;

    for (let i = 0; i < models.length && totalAttempts < MAX_TOTAL_ATTEMPTS; i++) {
        const model = models[i];
        const maxTriesThisModel = 2;

        for (let attempt = 0; attempt < maxTriesThisModel && totalAttempts < MAX_TOTAL_ATTEMPTS; attempt++) {
            totalAttempts++;
            try {
                return await ai.models.generateContent({
                    ...requestParams,
                    model
                });
            } catch (err) {
                lastError = err;
                const errMsg = (err.message || '').toLowerCase();
                const statusCode = err.status || err.statusCode || 0;

                // Model not found / deprecated — skip to next model immediately
                const isModelNotFoundError =
                    statusCode === 404 ||
                    errMsg.includes('not found') ||
                    errMsg.includes('no longer available') ||
                    errMsg.includes('not available') ||
                    errMsg.includes('deprecated');

                if (isModelNotFoundError) {
                    if (i < models.length - 1) {
                        console.warn(`[Glam Guide AI] Model "${model}" unavailable (404/deprecated), falling back to "${models[i + 1]}"...`);
                    }
                    break; // Move to next model
                }

                // Transient / temporary error — retry same model after short delay
                const isTransientError =
                    statusCode === 503 ||
                    statusCode === 429 ||
                    errMsg.includes('unavailable') ||
                    errMsg.includes('service unavailable') ||
                    errMsg.includes('overloaded') ||
                    errMsg.includes('too many requests');

                if (isTransientError && attempt < maxTriesThisModel - 1 && totalAttempts < MAX_TOTAL_ATTEMPTS) {
                    console.warn(`[Glam Guide AI] Model "${model}" transient error (attempt ${attempt + 1}), retrying in 1s...`);
                    await sleep(1000);
                    continue; // Retry same model
                }

                // Non-retriable error or exhausted retries — propagate
                throw err;
            }
        }
    }
    throw lastError;
};

/**
 * Clean AI text output that may contain markdown code fences
 */
const extractJsonFromText = (text) => {
    if (!text) throw new Error('Empty response from AI service');
    
    // Remove markdown code fences like ```json ... ```
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
        const firstNewline = cleaned.indexOf('\n');
        const lastBackticks = cleaned.lastIndexOf('```');
        if (firstNewline !== -1 && lastBackticks !== -1) {
            cleaned = cleaned.substring(firstNewline + 1, lastBackticks).trim();
        }
    }
    
    // In case there is text before or after the JSON object
    const startObj = cleaned.indexOf('{');
    const endObj = cleaned.lastIndexOf('}');
    if (startObj !== -1 && endObj !== -1 && endObj > startObj) {
        cleaned = cleaned.substring(startObj, endObj + 1);
    }
    
    return JSON.parse(cleaned);
};

/**
 * Analyze an uploaded clothing image to detect wardrobe attributes
 * @param {Buffer} imageBuffer - File buffer of clothing image
 * @param {string} mimeType - e.g. 'image/jpeg', 'image/png'
 * @returns {Promise<Object>} Detected clothing attributes
 */
export const analyzeClothingImage = async (imageBuffer, mimeType) => {
    const ai = getAiClient();

    const prompt = `
You are an expert fashion analyst. Analyze this clothing image for a digital wardrobe catalog.
Detect and return the clothing attributes strictly as a valid JSON object with the following fields:
- "name": A concise, descriptive title (e.g. "White Cotton Oxford Shirt", "Blue Slim Jeans", "Black Wool Trench Coat").
- "category": Must be exactly one of: ["top", "bottom", "outerwear", "dress", "footwear", "accessory", "other"].
- "color": The primary color of the item in lowercase (e.g. "white", "black", "navy", "blue", "grey", "beige", "red", "green", "brown", "pink", "yellow").
- "pattern": The pattern style in lowercase (e.g. "solid", "striped", "plaid", "floral", "checkered", "graphic", "polka dot").
- "style": The fashion aesthetic in lowercase (e.g. "casual", "formal", "sporty", "chic", "boho", "vintage").
- "season": The best season for this item, must be exactly one of: ["winter", "spring", "summer", "fall", "all-season"].
- "material": The apparent fabric or material in lowercase (e.g. "cotton", "denim", "wool", "silk", "linen", "leather", "polyester", "chiffon", "velvet", "cashmere").

Do not include any text, explanations, or markdown code fences outside of the JSON object.
`;

    try {
        const base64Data = imageBuffer.toString('base64');
        const response = await callGeminiWithFallback(ai, {
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: mimeType || 'image/jpeg',
                                data: base64Data
                            }
                        }
                    ]
                }
            ],
            config: {
                responseMimeType: 'application/json'
            }
        });

        const rawText = response.text || (response.candidates && response.candidates[0]?.content?.parts[0]?.text);
        const parsed = extractJsonFromText(rawText);

        // Sanitize and normalize attributes
        const validCategories = ['top', 'bottom', 'outerwear', 'dress', 'footwear', 'accessory', 'other'];
        const validSeasons = ['winter', 'spring', 'summer', 'fall', 'all-season'];

        const normalizedCategory = validCategories.includes((parsed.category || '').toLowerCase())
            ? parsed.category.toLowerCase()
            : 'other';

        const normalizedSeason = validSeasons.includes((parsed.season || '').toLowerCase())
            ? parsed.season.toLowerCase()
            : 'all-season';

        return {
            name: parsed.name || 'Wardrobe Item',
            category: normalizedCategory,
            color: (parsed.color || 'unspecified').toLowerCase(),
            pattern: (parsed.pattern || 'solid').toLowerCase(),
            style: (parsed.style || 'casual').toLowerCase(),
            season: normalizedSeason,
            material: (parsed.material || 'cotton').toLowerCase()
        };
    } catch (error) {
        console.error('AI clothing analysis error:', error);
        if (error.code === 'AI_NOT_CONFIGURED') throw error;

        // Transient / capacity errors — give user a helpful message
        const statusCode = error.status || error.statusCode || 0;
        const errMsg = (error.message || '').toLowerCase();
        const isTransient =
            statusCode === 503 ||
            statusCode === 429 ||
            errMsg.includes('unavailable') ||
            errMsg.includes('overloaded') ||
            errMsg.includes('too many requests');

        if (isTransient) {
            const friendlyError = new Error('AI service is temporarily unavailable. Please try again in a moment.');
            friendlyError.statusCode = 503;
            throw friendlyError;
        }

        const aiError = new Error(`AI analysis failed: ${error.message}`);
        aiError.statusCode = 502;
        throw aiError;
    }
};

/**
 * Generate outfit recommendation using ONLY items from user's actual wardrobe
 * @param {Array} userItems - Array of user's wardrobe item documents from MongoDB
 * @param {Object} preferences - User preferences (occasion, style, bodyType, season)
 * @returns {Promise<Object>} Structured recommendation with validated item IDs
 */
export const generateOutfitRecommendation = async (userItems, preferences = {}) => {
    if (!userItems || userItems.length === 0) {
        const emptyError = new Error('Your wardrobe is empty. Add some clothing items first so Glam Guide can create an outfit for you.');
        emptyError.statusCode = 400;
        throw emptyError;
    }

    if (userItems.length < 2) {
        const minError = new Error('You need at least 2 wardrobe items (e.g., a top and a bottom, or a dress and shoes) to generate an outfit recommendation.');
        minError.statusCode = 400;
        throw minError;
    }

    const ai = getAiClient();

    // Map user wardrobe into clean metadata for AI prompt
    const wardrobeCatalog = userItems.map(item => ({
        id: item._id.toString(),
        name: item.name,
        category: item.category,
        color: item.color,
        pattern: item.pattern,
        style: item.style,
        season: item.season,
        material: item.material
    }));

    const occasion = preferences.occasion || 'casual';
    const style = preferences.style || 'casual';
    const bodyType = preferences.bodyType && preferences.bodyType !== 'all' ? preferences.bodyType : 'general';

    const prompt = `
You are Glam Guide's AI personal stylist. Your task is to curate the best outfit combination from the user's ACTUAL wardrobe.

USER REQUEST:
- Occasion: ${occasion}
- Preferred Style: ${style}
- Body Type consideration: ${bodyType}

AVAILABLE WARDROBE ITEMS (YOU MUST ONLY SELECT FROM THIS LIST):
${JSON.stringify(wardrobeCatalog, null, 2)}

STRICT RULES:
1. You MUST select items ONLY from the provided wardrobe list. DO NOT invent items or fabricate item IDs.
2. Select 2 to 4 items that complement each other for a complete outfit (e.g. top + bottom, dress + outerwear, shoes, etc.).
3. Each item in the "outfit" array must specify:
   - "itemId": The exact "id" string from the provided wardrobe list.
   - "role": One of ["top", "bottom", "outerwear", "dress", "footwear", "other"].
4. If there is a suitable accessory in the wardrobe, include it in "accessory" with its exact "itemId" and "role": "accessory". If none is suitable, set "accessory": null.
5. Provide a concise, stylish "reason" (1-2 sentences) explaining why these pieces match well for this occasion.
6. Provide a concise "stylingTip" (1 sentence) on how to style, accessorize, or wear this look.

Return strictly a JSON object matching this structure:
{
  "outfit": [
    { "itemId": "...", "role": "top" },
    { "itemId": "...", "role": "bottom" }
  ],
  "accessory": { "itemId": "...", "role": "accessory" } or null,
  "reason": "...",
  "stylingTip": "..."
}
Do not include any extra text or markdown formatting outside of the JSON object.
`;

    try {
        const response = await callGeminiWithFallback(ai, {
            contents: [
                {
                    role: 'user',
                    parts: [{ text: prompt }]
                }
            ],
            config: {
                responseMimeType: 'application/json'
            }
        });

        const rawText = response.text || (response.candidates && response.candidates[0]?.content?.parts[0]?.text);
        const parsed = extractJsonFromText(rawText);

        // Security & Isolation Validation: Validate every returned ID against user's actual items
        const itemMap = new Map(userItems.map(item => [item._id.toString(), item]));

        const validatedOutfit = [];
        if (Array.isArray(parsed.outfit)) {
            for (const picked of parsed.outfit) {
                if (picked && picked.itemId && itemMap.has(picked.itemId.toString())) {
                    const originalDoc = itemMap.get(picked.itemId.toString());
                    validatedOutfit.push({
                        role: picked.role || originalDoc.category,
                        item: originalDoc
                    });
                }
            }
        }

        let validatedAccessory = null;
        if (parsed.accessory && parsed.accessory.itemId && itemMap.has(parsed.accessory.itemId.toString())) {
            validatedAccessory = {
                role: 'accessory',
                item: itemMap.get(parsed.accessory.itemId.toString())
            };
        }

        if (validatedOutfit.length === 0) {
            throw new Error('AI could not formulate an outfit with the provided wardrobe items.');
        }

        return {
            outfit: validatedOutfit,
            accessory: validatedAccessory,
            reason: parsed.reason || 'This curated combination brings together complementary colors and styles from your wardrobe.',
            stylingTip: parsed.stylingTip || 'Add your favorite personal touches to complete this look.'
        };
    } catch (error) {
        console.error('AI outfit recommendation error:', error);
        if (error.code === 'AI_NOT_CONFIGURED' || error.statusCode === 400) throw error;
        
        const aiError = new Error(`AI recommendation failed: ${error.message}`);
        aiError.statusCode = 502;
        throw aiError;
    }
};

export default {
    analyzeClothingImage,
    generateOutfitRecommendation
};
