/**
 * Glam Guide - Centralized API Configuration & Client
 * Handles authenticated API requests using HttpOnly cookies with Bearer fallback
 */

(function (window) {
    // Determine API Base URL dynamically
    let detectedBaseUrl = '';
    const hostname = window.location.hostname;
    const port = window.location.port;

    if (window.GLAM_API_BASE_URL) {
        detectedBaseUrl = window.GLAM_API_BASE_URL;
    } else if (window.location.protocol === 'file:') {
        detectedBaseUrl = 'http://localhost:5000';
    } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // If served from backend port 5000, use relative paths; otherwise use localhost:5000
        detectedBaseUrl = port === '5000' ? '' : 'http://localhost:5000';
    } else {
        // Production: Default to custom backend or window origin
        detectedBaseUrl = window.GLAM_API_BACKEND_URL || (window.location.origin.includes('github.io') ? '' : window.location.origin);
    }

    const GlamAPI = {
        baseUrl: detectedBaseUrl,

        /**
         * Generic authenticated API fetch wrapper
         * Sends credentials (HttpOnly cookie) with every request
         */
        async request(endpoint, options = {}) {
            const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
            const headers = {
                ...(options.headers || {})
            };

            // If not FormData, default to application/json
            if (!(options.body instanceof FormData) && !headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }

            // Fallback authorization header if token exists in localStorage (e.g., cross-origin environments)
            const fallbackToken = localStorage.getItem('glam_token');
            if (fallbackToken && !headers['Authorization']) {
                headers['Authorization'] = `Bearer ${fallbackToken}`;
            }

            const fetchOptions = {
                ...options,
                headers,
                credentials: 'include' // Mandatory for HttpOnly cookies
            };

            const response = await fetch(url, fetchOptions);

            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                data = { message: text };
            }

            if (!response.ok) {
                const error = new Error(data.message || `Request failed with status ${response.status}`);
                error.status = response.status;
                error.data = data;
                throw error;
            }

            return data;
        },

        // Authentication Methods
        async register(name, email, password) {
            const data = await this.request('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({ name, email, password })
            });
            if (data.token) {
                localStorage.setItem('glam_token', data.token);
            }
            if (data.user) {
                localStorage.setItem('glam_user', JSON.stringify(data.user));
            }
            return data;
        },

        async login(email, password) {
            const data = await this.request('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            if (data.token) {
                localStorage.setItem('glam_token', data.token);
            }
            if (data.user) {
                localStorage.setItem('glam_user', JSON.stringify(data.user));
            }
            return data;
        },

        async getMe() {
            try {
                const data = await this.request('/api/auth/me', {
                    method: 'GET'
                });
                if (data.user) {
                    localStorage.setItem('glam_user', JSON.stringify(data.user));
                }
                return data.user;
            } catch (err) {
                localStorage.removeItem('glam_token');
                localStorage.removeItem('glam_user');
                return null;
            }
        },

        async logout() {
            try {
                await this.request('/api/auth/logout', { method: 'POST' });
            } catch (err) {
                console.warn('Logout request completed with notice:', err.message);
            } finally {
                localStorage.removeItem('glam_token');
                localStorage.removeItem('glam_user');
            }
        },

        // Wardrobe Methods
        async getWardrobe(filters = {}) {
            let query = '';
            const params = new URLSearchParams();
            if (filters.season && filters.season !== 'all') params.append('season', filters.season);
            if (filters.category && filters.category !== 'all') params.append('category', filters.category);
            const qs = params.toString();
            if (qs) query = `?${qs}`;

            return this.request(`/api/wardrobe${query}`, { method: 'GET' });
        },

        async addWardrobeItem(itemData) {
            return this.request('/api/wardrobe', {
                method: 'POST',
                body: JSON.stringify(itemData)
            });
        },

        async updateWardrobeItem(id, itemData) {
            return this.request(`/api/wardrobe/${id}`, {
                method: 'PUT',
                body: JSON.stringify(itemData)
            });
        },

        async deleteWardrobeItem(id) {
            return this.request(`/api/wardrobe/${id}`, {
                method: 'DELETE'
            });
        },

        async analyzeImage(file) {
            const formData = new FormData();
            formData.append('image', file);

            return this.request('/api/wardrobe/analyze', {
                method: 'POST',
                body: formData
            });
        },

        // Outfit Recommendation
        async getOutfitRecommendation(preferences) {
            return this.request('/api/recommendations/outfit', {
                method: 'POST',
                body: JSON.stringify(preferences)
            });
        },

        /**
         * Update navigation bar to show user state without modifying existing layout or styling
         */
        async setupNavbar() {
            const user = await this.getMe();
            const navLinks = document.querySelectorAll('.nav-links a');

            navLinks.forEach(link => {
                const text = link.textContent.trim().toLowerCase();
                if (text === 'login' || text === 'sign up') {
                    if (user) {
                        link.textContent = `Logout (${user.name.split(' ')[0]})`;
                        link.href = '#';
                        link.addEventListener('click', async (e) => {
                            e.preventDefault();
                            if (confirm('Are you sure you want to log out?')) {
                                await GlamAPI.logout();
                                window.location.href = 'login.html';
                            }
                        });
                    } else {
                        link.textContent = 'Login';
                        link.href = 'login.html';
                    }
                }
            });
        }
    };

    window.GlamAPI = GlamAPI;

    // Run setupNavbar automatically on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        GlamAPI.setupNavbar();
    });
})(window);
