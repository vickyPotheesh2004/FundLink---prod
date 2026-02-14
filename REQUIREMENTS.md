
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

## 2. Module Dependencies

### Core Modules
| Module | Purpose | Dependencies |
| :--- | :--- | :--- |
| `js/main.js` | Application bootstrap & routing | All page modules |
| `js/modules/auth.js` | Authentication & RBAC | None |
| `js/modules/AIClient.js` | AI simulation & API client | None |
| `js/modules/renderStatic.js` | Static HTML loader | None |

### Page Modules
| Module | Purpose | Route |
| :--- | :--- | :--- |
| `js/pages/founderDashboard.js` | Founder main dashboard | `#founder-dashboard` |
| `js/pages/founderProfile.js` | Founder profile management | `#founder-profile` |
| `js/pages/founderReceived.js` | Founder received requests | `#founder-received` |
| `js/pages/investorRequests.js` | Investor connection requests | `#investor-requests` |
| `js/pages/acceptedWorkspace.js` | **NEW**: Accepted connections workspace | `#accepted-workspace` |
| `js/pages/workspace.js` | Secure negotiation workspace | `#workspace` |
| `js/pages/dealClosure.js` | Deal closure module | `#deal-closure` |

### New Module: Accepted Connections Workspace
The `acceptedWorkspace.js` module provides:
- **Connection List**: Displays all accepted connections in a sidebar
- **Partner Selection**: Click to select and view partner details
- **Talk Tab**: Secure messaging interface
- **Deal Disclosure Tab**: Deal summary and shared information status
- **Documents Tab**: Shared documents viewer
- **AI Report Generation**: Partnership analysis reports

## 3. Infrastructure (Target Production)
*   **Web Server**: Nginx or Apache (Reverse Proxy)
*   **Application Server**: Node.js (Express/NestJS)
*   **Database**: PostgreSQL 14+ (Relational Data)
*   **Vector Database**: Pinecone or Milvus (AI Matching)
*   **Caching**: Redis (Session Management)
*   **CDN**: Cloudflare (Static Assets & Security)

## 4. Development Environment
*   **OS**: Windows 10/11, macOS, or Linux
*   **IDE**: VS Code (Recommended Extensions: Tailwind CSS IntelliSense, Prettier)
*   **Browser**: Chrome 90+, Edge 90+, Firefox 90+ (ES Module support required)

## 5. External Services (Future Integration)
*   **AI/LLM Provider**: OpenAI API (GPT-4) or Google Gemini API
*   **Auth Provider**: Firebase Auth or Auth0
*   **Storage**: AWS S3 or Google Cloud Storage (Secure Document Vault)

## 6. Storage Keys (Local Storage Simulation)

| Key | Purpose |
| :--- | :--- |
| `fundlink_role` | Current user role (FOUNDER/INVESTOR) |
| `fundlink_user_profile` | User profile data |
| `fundlink_connection_requests` | All connection requests |
| `fundlink_workspace_connections` | Active workspace connections |
| `fundlink_workspace_messages` | Messages per connection |
| `fundlink_selected_connection` | Currently selected connection ID |

## 7. Routing Structure

```
#landing                    → Public landing page
#role-select               → Role selection
#investor-auth             → Investor authentication
#investor-feed             → Investor evaluation feed
#investor-requests         → Investor connection requests
#investor-portfolio        → Investor portfolio
#investor-thesis           → Investment thesis
#investor-profile          → Investor profile
#founder-auth              → Founder authentication
#founder-dashboard         → Founder dashboard
#founder-profile           → Founder profile
#founder-received          → Founder received requests
#accepted-workspace        → NEW: Accepted connections workspace
#workspace                 → Secure negotiation workspace
#deal-closure              → Deal closure
```
