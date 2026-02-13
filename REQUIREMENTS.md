
# FundLink Technical Requirements

## 1. Core Stack (Current Implementation)
*   **Runtime**: Node.js v16+ (Recommended: v18 LTS)
*   **Package Manager**: npm v8+ or yarn v1.22+
*   **Frontend**:
    *   HTML5 (Semantic Web Standards)
    *   CSS3 (Tailwind CSS v3.x via CDN for rapid prototyping)
    *   JavaScript (ES6+ Modules, No Build Step required for dev)
    *   Icons: Material Symbols Outlined (Google Fonts)
    *   Fonts: Inter (Google Fonts)
*   **Backend / Simulation**:
    *   Local Storage API (Client-side persistence for simulation)
    *   Node.js (for running verification scripts)

## 2. Infrastructure (Target Production)
*   **Web Server**: Nginx or Apache (Reverse Proxy)
*   **Application Server**: Node.js (Express/NestJS)
*   **Database**: PostgreSQL 14+ (Relational Data)
*   **Vector Database**: Pinecone or Milvus (AI Matching)
*   **Caching**: Redis (Session Management)
*   **CDN**: Cloudflare (Static Assets & Security)

## 3. Development Environment
*   **OS**: Windows 10/11, macOS, or Linux
*   **IDE**: VS Code (Recommended Extensions: Tailwind CSS IntelliSense, Prettier)
*   **Browser**: Chrome 90+, Edge 90+, Firefox 90+ (ES Module support required)

## 4. External Services (Future Integration)
*   **AI/LLM Provider**: OpenAI API (GPT-4) or Google Gemini API
*   **Auth Provider**: Firebase Auth or Auth0
*   **Storage**: AWS S3 or Google Cloud Storage (Secure Document Vault)
