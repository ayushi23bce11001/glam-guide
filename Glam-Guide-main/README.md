# 👗 Glam Guide — Production AI Virtual Wardrobe

> **Production-Ready, AI-Assisted Virtual Wardrobe & Outfit Recommendation Platform**  
> Built with Node.js, Express, MongoDB, and Google Gemini AI.

---

## 🌟 Overview

**Glam Guide** transforms daily styling from a chore into an effortless, intelligent experience. By pairing digital wardrobe management with Google's Gemini Vision & LLM APIs, users can:
- **Digitize their wardrobe effortlessly**: Upload clothing photos and let Gemini AI automatically detect category, primary colors, pattern, style, season, and fabric material.
- **Get personalized, context-aware outfit recommendations**: The AI recommends complete, stylish outfit combinations selected **exclusively** from items the user actually owns, tailored to occasion, style, season, and color harmony.
- **Maintain total privacy and security**: Enterprise-grade data isolation ensures every user's wardrobe and outfit data is strictly confidential, authenticated via secure `HttpOnly` JWT cookies.

The application preserves the original, elegant frontend design and responsive UX while upgrading the entire engine to production quality.

---

## 🏗️ Architecture & Tech Stack

```text
┌─────────────────────────────────────────────────────────────┐
│                 Glam Guide Frontend                         │
│  (Vanilla HTML5, CSS3, Modern JS with Modular API Client)    │
└──────────────────────────────┬──────────────────────────────┘
                               │  HTTPS / HttpOnly Cookie / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Node.js / Express Backend                   │
│  ├── Auth Middleware (JWT HttpOnly + Bearer Token Fallback) │
│  ├── Multer File Upload Filter (JPEG, PNG, WebP ≤ 5MB)      │
│  ├── Rate Limiter & Centralized Error Handler               │
│  └── RESTful Controllers (Auth, Wardrobe, Recommendations)   │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      MongoDB / Mongoose      │ │   Google Gemini AI Engine  │
│  ├── Users (bcrypt hashed)   │ │  ├── Gemini 2.0 Flash /    │
│  └── WardrobeItems (Scoped)  │ │      Gemini 1.5 Flash      │
└──────────────────────────────┘ │  ├── Multimodal Vision     │
                                 │  └── Outfit Reasoning      │
                                 └────────────────────────────┘
```

### Technology Highlights
- **Frontend**: Vanilla HTML5, CSS3 (responsive grid/flexbox), JavaScript (ES6+), `GlamAPI` centralized client. Zero heavy frontend build steps required.
- **Backend API**: Node.js, Express.js with modular MVC architecture.
- **Database**: MongoDB with Mongoose ODM.
- **Authentication**: Stateless JSON Web Tokens (JWT) stored in `HttpOnly`, `SameSite`, `Secure` cookies to defend against XSS, with Bearer header fallback.
- **AI Integration**: Official Google Generative AI SDK (`@google/genai` & `@google/generative-ai`), supporting `gemini-2.0-flash` and `gemini-1.5-flash`.
- **Media Storage**: Dual-mode storage engine supporting Cloudinary for cloud deployments and local disk storage (`/uploads/`) for development.

---

## 🚀 Key Features

### 1. 🤖 AI-Powered Clothing Analysis
- Users can upload any photo of a clothing item (shirt, trousers, dress, shoes, etc.).
- The backend streams the image to Google Gemini Vision.
- The AI extracts:
  - **Category**: Top, Bottom, Full Body, Outerwear, Footwear, or Accessory.
  - **Color**: Dominant and secondary colors.
  - **Pattern**: Solid, Striped, Plaid, Floral, Printed, etc.
  - **Style**: Casual, Formal, Business Casual, Streetwear, Party, etc.
  - **Season**: Summer, Winter, Spring, Fall, or All-Season.
  - **Material**: Cotton, Denim, Wool, Linen, Silk, Leather, etc.
- The attributes automatically pre-fill the wardrobe form so the user can review, edit, or accept before saving to MongoDB.

### 2. 🪄 AI Outfit Combinations from Real Wardrobe
- Eliminates generic or mock suggestions: The AI recommendation engine evaluates **only items that exist in the authenticated user's wardrobe**.
- Considers user-selected occasion (Casual, Work, Party, Date, Sport) and weather/season.
- Returns a cohesive ensemble (Top + Bottom + Footwear + optional Outerwear/Accessory) along with the styling rationale and fashion tips.
- Fallback intelligence: If a user has fewer than 2 items, the system gracefully guides them to add foundational pieces first.

### 3. 🔒 Complete User Isolation & Security
- Every database query (`find`, `findById`, `updateOne`, `deleteOne`) strictly matches `userId: req.user._id`.
- Users cannot access, modify, or delete another user's wardrobe items by tampering with IDs.
- Passwords are salted and hashed with `bcryptjs`.
- Sensitive tokens are stored in `HttpOnly` cookies, preventing malicious JavaScript access.

---

## 📁 Project Directory Structure

```text
Glam-Guide/
├── glam-guide-frontend/           # Production Frontend (HTML/CSS/JS)
│   ├── css/                       # Stylesheets (Home, Wardrobe, Recommendations, Auth)
│   ├── js/                        # Frontend Scripts
│   │   ├── api.js                 # Centralized GlamAPI Client & Auth State Handler
│   │   ├── wardrobemanagement.js  # Wardrobe CRUD + AI Image Analysis Handler
│   │   ├── outfitrecommendation.js# AI Outfit Recommendation Form & Renderer
│   │   ├── login.js               # Login Handler
│   │   ├── signup.js              # Registration Handler
│   │   └── forgot_password.js     # Password Recovery Handler
│   ├── home.html                  # Landing Page
│   ├── wardrobemanagement.html    # Virtual Wardrobe Management
│   ├── outfitrecommendtion.html   # AI Outfit Recommendation Center
│   ├── login.html                 # Login Page
│   ├── signup.html                # Signup Page
│   ├── forgot_password.html       # Forgot Password Page
│   └── images/                    # UI Assets and Photography
│
└── my-backend/                    # Production Backend (Node.js/Express)
    ├── src/
    │   ├── controllers/           # Request Handlers
    │   │   ├── authController.js          # Register, Login, Me, Logout
    │   │   ├── wardrobeController.js      # Wardrobe CRUD & Image Analysis
    │   │   └── recommendationController.js# AI Outfit Recommendation
    │   ├── middleware/            # Custom Middleware
    │   │   ├── auth.js            # JWT Verification (Cookie + Bearer)
    │   │   ├── upload.js          # Multer Memory Storage & File Filter
    │   │   └── errorHandler.js    # Centralized Error Sanitizer
    │   ├── models/                # Mongoose Schemas
    │   │   ├── User.js            # User Schema with Bcrypt Hooks
    │   │   └── WardrobeItem.js    # Wardrobe Schema with User Reference
    │   ├── routes/                # Express Route Declarations
    │   │   ├── authRoutes.js
    │   │   ├── wardrobeRoutes.js
    │   │   └── recommendationRoutes.js
    │   └── services/              # External Integrations
    │       ├── aiService.js       # Google Gemini AI Integration
    │       └── storageService.js  # Cloudinary & Local Storage Provider
    ├── test/                      # Automated Test Suite (Node.js Test Runner)
    │   ├── auth.test.js           # Password hashing & JWT tests
    │   ├── wardrobe.test.js       # Wardrobe model & isolation tests
    │   ├── ai.test.js             # AI validation & edge case tests
    │   └── integration.test.js    # End-to-end API integration tests
    ├── uploads/                   # Local file upload directory
    ├── .env.example               # Environment variable specification
    ├── index.js                   # Application Entry Point & Server Config
    └── package.json               # Backend Dependencies & Scripts
```

---

## 🛠️ Environment Variables Configuration

Copy `my-backend/.env.example` to `my-backend/.env` and configure your settings:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5000

# Database Configuration (MongoDB URI)
MONGO_URL=mongodb://127.0.0.1:27017/glamguide
# For MongoDB Atlas:
# MONGO_URL=mongodb+srv://<user>:<password>@cluster0.mongodb.net/glamguide?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=super_secret_production_jwt_key_glam_guide_2026_change_me
JWT_EXPIRES_IN=7d

# Google Gemini AI Configuration
AI_PROVIDER=gemini
AI_API_KEY=your_google_gemini_api_key_here
AI_MODEL=gemini-3.8-flash

# Media Storage Configuration (Optional Cloudinary setup)
# Set to 'cloudinary' for cloud hosting, or 'local' for local uploads folder
STORAGE_PROVIDER=local
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 🚦 Getting Started & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or newer recommended)
- [MongoDB](https://www.mongodb.com/) (Local Community Server or free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- [Google AI Studio API Key](https://aistudio.google.com/) (Free tier available)

### Step 1: Install Dependencies
```bash
cd my-backend
npm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and GEMINI API KEY
```

### Step 3: Run the Test Suite
Verify that all unit and integration tests pass:
```bash
npm test
```
*Expected: 22 passing tests across 4 suites.*

### Step 4: Start the Server
```bash
npm start
```
The server will start on `http://localhost:5000`.

### Step 5: Access the Application
The backend serves both the REST API and the static frontend simultaneously. Open your browser and navigate to:
```
http://localhost:5000/glam-guide-frontend/home.html
```
You can also launch `glam-guide-frontend/home.html` via VS Code Live Server; `api.js` will automatically detect the backend on port 5000.

---

## 📚 API Endpoint Reference

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user (`name`, `email`, `password`) | No |
| `POST` | `/api/auth/login` | Login user, issues `HttpOnly` token cookie | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated user profile | **Yes** |
| `POST` | `/api/auth/logout` | Clear authentication cookie | **Yes** |
| `POST` | `/api/auth/forgot-password`| Reset password instructions / recovery | No |

### Wardrobe Endpoints (`/api/wardrobe`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/wardrobe` | Retrieve all wardrobe items for the logged-in user | **Yes** |
| `POST` | `/api/wardrobe` | Add a new clothing item (supports `multipart/form-data`) | **Yes** |
| `PUT` | `/api/wardrobe/:id` | Update an existing clothing item | **Yes** |
| `DELETE` | `/api/wardrobe/:id` | Delete a clothing item | **Yes** |
| `POST` | `/api/wardrobe/analyze-image` | Upload clothing image for Gemini AI feature extraction | **Yes** |

### Recommendations Endpoints (`/api/recommendations`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/recommendations/outfit` | Generate an AI outfit using the user's actual items | **Yes** |

### System Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service health status and timestamp | No |

---

## 🧪 Testing

The application includes an automated test suite executed with the native Node.js test runner:

```bash
cd my-backend
npm test
```

### Coverage:
1. **`test/auth.test.js`**: Password hashing verification, JWT creation, token expiry rejection (401), missing token rejection (401), tampered token rejection (401).
2. **`test/wardrobe.test.js`**: WardrobeItem schema constraints, enum validations, query scoping per user ID.
3. **`test/ai.test.js`**: Empty wardrobe handling (400), insufficient items validation (< 2 items, 400), missing `AI_API_KEY` handling (503).
4. **`test/integration.test.js`**: Complete end-to-end lifecycle:
   - User A registers, receives `HttpOnly` cookie.
   - User A profile verified via `/api/auth/me`.
   - User A adds wardrobe items.
   - User B registers and attempts to access or delete User A's items (Strict Isolation verified).
   - User A deletes own item.
   - User A logs out and cookie is invalidated.

---

## 🌐 Production Deployment Guide

### 1. Database (MongoDB Atlas)
1. Create a free shared cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user and whitelist network access (`0.0.0.0/0` or your host IP).
3. Set `MONGO_URL` in your production environment variables.

### 2. Backend Deployment (Render / Railway / AWS)
1. Deploy `my-backend` as a Node web service.
2. Build command: `npm install`
3. Start command: `npm start`
4. Set production environment variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `CLIENT_URL=https://your-frontend-domain.com`
   - `MONGO_URL=mongodb+srv://...`
   - `JWT_SECRET=your_strong_random_secret`
   - `AI_API_KEY=your_gemini_key`
   - `STORAGE_PROVIDER=cloudinary` (plus Cloudinary credentials)

### 3. Media Storage (Cloudinary)
For production environments with ephemeral containers (such as Render or Heroku):
1. Create a free [Cloudinary](https://cloudinary.com) account.
2. Configure `STORAGE_PROVIDER=cloudinary`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
3. Image uploads will automatically be hosted on Cloudinary's global CDN.

---

## 📄 License
This project is licensed under the MIT License.
