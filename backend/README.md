# CampusKart Backend ⚙️

The backend of CampusKart is a robust, RESTful API built with Node.js and Express, providing real-time capabilities and secure data management.

## 🛠️ Core Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB & Mongoose
- **Authentication:** Clerk (`@clerk/express`)
- **Real-Time:** Socket.io
- **File Uploads:** Multer & Cloudinary (`multer-storage-cloudinary`)
- **Security:** Helmet, CORS, bcrypt, jsonwebtoken
- **Logging:** Morgan

## 📜 Available Scripts

In the backend directory, you can run:

- `npm start`: Starts the production server using `node server.js`.
- `npm run dev`: Starts the development server with `nodemon` for auto-reloading.

## 🚀 Setup Instructions

1. Ensure you have a `.env` file with the required environment variables:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=your_mongodb_connection_string
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   FRONTEND_URL=http://localhost:5173
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

