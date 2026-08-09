# CampusKart Frontend 💻

The frontend of CampusKart is a fast, responsive, and animated Single Page Application (SPA) built with React and Vite.

## 🛠️ Core Technology Stack

- **Framework:** React (Vite)
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Routing:** React Router DOM
- **Authentication:** Clerk (`@clerk/clerk-react`)
- **Real-Time:** Socket.io Client
- **Forms & Validation:** React Hook Form
- **Notifications:** React Hot Toast
- **Icons:** Lucide React

## 📜 Available Scripts

In the frontend directory, you can run:

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the app for production to the `dist` folder.
- `npm run lint`: Runs the Oxlint linter to check for code quality.
- `npm run preview`: Locally previews the production build.

## 🚀 Setup Instructions

1. Ensure you have a `.env` file with the required environment variables:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   VITE_API_URL=http://localhost:5000/api/v1
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```


