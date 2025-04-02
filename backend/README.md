
---

# 🚜 AgriCart Multivendor Backend API

<div align="center">
  
![MERN Stack](https://img.shields.io/badge/Stack-MERN-00f?style=flat&logo=mongoDB&logoColor=white)
![JWT Auth](https://img.shields.io/badge/Security-JWT%20Auth-ff69b4?style=flat&logo=jsonwebtokens)
![WebSockets](https://img.shields.io/badge/Realtime-Socket.io-black?style=flat&logo=socket.io)
![Payment](https://img.shields.io/badge/Payment-MPesa%20%2F%20PayPal-003087?style=flat&logo=paypal)

</div>

## 🌐 Complete Project Flow

```mermaid
%%{init: {'theme':'neutral'}}%%
flowchart TD
    A[Client] --> B[API Routes]
    B --> C{authRoutes.js}
    B --> D{productRoutes.js}
    B --> E{orderRoutes.js}
    B --> F{paymentRoutes.js}
    B --> G{adminRoutes.js}
    
    C --> H[authController.js]
    D --> I[productController.js]
    E --> J[orderController.js]
    F --> K[paymentController.js]
    G --> L[adminController.js]
    
    H --> M[(User Model)]
    I --> N[(Product Model)]
    J --> O[(Order Model)]
    
    J --> P[Socket.io]
    K --> Q[Payment Gateways]
    
    style A fill:#4CAF50,stroke:#388E3C
    style B fill:#2196F3,stroke:#0D47A1
```

## 📂 Exact File Structure (Your Project)

```
backend/
├── 📜 server.js                 # Entry point with Socket.io
│
├── 📁 controllers/              # Business logic
│   ├── authController.js        # User auth (JWT)
│   ├── productController.js     # Product management
│   ├── orderController.js       # Order processing
│   ├── paymentController.js     # PayPal/MPesa
│   └── adminController.js       # Admin operations
│
├── 📁 middleware/               # Request processing
│   ├── authMiddleware.js        # JWT protection
│   └── errorMiddleware.js       # Error handling
│
├── 📁 models/                   # MongoDB Schemas
│   ├── User.js                  # User accounts
│   ├── Product.js               # Vendor products
│   └── Order.js                 # Transactions
│
├── 📁 routes/                   # API Endpoints
│   ├── authRoutes.js            # /api/auth
│   ├── productRoutes.js         # /api/products
│   ├── orderRoutes.js           # /api/orders
│   ├── paymentRoutes.js         # /api/payment
│   └── adminRoutes.js           # /api/admin
│
└── 📜 .env                      # Configuration
```

## 🔗 Endpoint Flow Visualization

```mermaid
sequenceDiagram
    participant Client
    participant Route
    participant Controller
    participant Model
    participant Socket
    
    Client->>+Route: HTTP Request
    Route->>+Controller: Process Logic
    Controller->>+Model: DB Operation
    Model-->>-Controller: Data
    Controller->>+Socket: Real-time Event
    Socket-->>-Client: Notification
    Controller-->>-Route: Response
    Route-->>-Client: JSON Data
```

## 🗃️ Enhanced Database Schema

```mermaid
erDiagram
    USER ||--o{ PRODUCT : "Sells"
    USER ||--o{ ORDER : "Purchases"
    PRODUCT ||--o{ ORDER_ITEM : "Included_In"
    ORDER ||--|{ ORDER_ITEM : "Contains"
    
    USER {
        string _id PK
        string name
        string email "Unique"
        string password "Hashed"
        enum role "admin|farmer|buyer"
        string avatar "URL"
        timestamp createdAt
    }
    
    PRODUCT {
        string _id PK
        string name
        number price
        number stock
        string farmer FK
        string imageURL
    }
    
    ORDER {
        string _id PK
        string user FK
        string paymentMethod
        boolean isPaid
        boolean isDelivered
        number totalPrice
    }
    
    ORDER_ITEM {
        string product FK
        number quantity
        number price
    }
```

## 🔄 System Workflows

### 1. Order Processing Flow
```mermaid
journey
    title Order Lifecycle
    section Create Order
      Client->API: POST /orders : 20%
      API->DB: Validate Products : 30%
      DB-->API: Stock Status : 40%
      API->DB: Create Order : 60%
      API->Socket: Notify Farmer : 80%
      API-->Client: 201 Created : 100%
    section Payment
      Client->API: POST /payment : 20%
      API->Gateway: Process Payment : 50%
      Gateway-->API: Confirmation : 80%
      API->DB: Update Order : 90%
      API-->Client: Receipt : 100%
```

## 💻 Development Setup

1. **Install dependencies** (exact from your project):
   ```bash
   npm install express mongoose dotenv bcryptjs jsonwebtoken cors socket.io
   ```

2. **Configure environment** (your `.env` structure):
   ```ini
   MONGO_URI="mongodb://localhost:27017/agriCart"
   JWT_SECRET="your_secure_key_here"
   PORT=5000
   CLIENT_URL="http://localhost:5173"
   ```

3. **Run the server** (as per your setup):
   ```bash
   npm run dev
   ```

## 🌟 Key Features (From Your Codebase)

| Module          | Key Methods                          | Tech Used          |
|-----------------|--------------------------------------|--------------------|
| **Auth**        | `register()`, `login()`, `getMe()`   | JWT, bcrypt        |
| **Products**    | `createProduct()`, `searchProducts()`| MongoDB Text Search|
| **Orders**      | `createOrder()`, `updateToDelivered` | Socket.io          |
| **Payments**    | `processPayPal()`, `processMpesa()`  | Payment Gateways   |
| **Admin**       | `getStats()`, `updateUserRole()`     | RBAC               |

