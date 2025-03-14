# Semi-Ecommerce Project

This project is a semi-ecommerce application with a backend built using Node.js, Express, and Prisma, and a frontend built using React and Vite.

## Backend

The backend is responsible for handling API requests, managing the database, and processing file uploads.

### Technologies Used

- Node.js
- Express
- Prisma
- PostgreSQL
- Multer
- dotenv

### Setup

1. Install dependencies:
    ```sh
    cd backend
    npm install
    ```

2. Create a `.env` file based on `.env.example` and configure your environment variables.

3. Run the Prisma migrations to set up the database:
    ```sh
    npx prisma migrate dev
    ```

4. Start the backend server:
    ```sh
    node src/server.js
    ```

## Frontend

The frontend is a React application built with Vite, providing a fast and modern development experience.

### Technologies Used

- React
- Vite
- Chakra UI
- Axios
- Framer Motion

### Setup

1. Install dependencies:
    ```sh
    cd frontend
    npm install
    ```

2. Create a `.env` file based on `.env.example` and configure your environment variables.

3. Start the development server:
    ```sh
    npm run dev
    ```
