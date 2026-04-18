# Handcraft Tutorial Platform

## Purpose

The Handcraft Tutorial Platform is designed to help users discover, learn, and manage handcraft projects efficiently. It allows users to browse tutorials, categories, and materials publicly, while authenticated users can create, update, and delete their own content.

Users can organise tutorials into categories, attach required materials, and view detailed step-by-step instructions for creative projects.

---

## API Endpoints

## User Management

- `POST /api/auth/register` – Register a new user.
- `POST /api/auth/login` – Login an existing user.

---

## Tutorial Management

- `GET /api/tutorials` – Retrieve all tutorials (public).
- `GET /api/tutorials/:id` – Retrieve a specific tutorial by ID (public).
- `POST /api/tutorials` – Create a new tutorial (authenticated users only).
- `PUT /api/tutorials/:id` – Update a tutorial by ID (owner only).
- `DELETE /api/tutorials/:id` – Delete a tutorial by ID (owner only).

---

## Category Management

- `GET /api/categories` – Retrieve all categories (public).
- `GET /api/categories/:id` – Retrieve a specific category by ID (public).
- `POST /api/categories` – Create a new category (authenticated users only).
- `PUT /api/categories/:id` – Update a category by ID (owner only).
- `DELETE /api/categories/:id` – Delete a category by ID (owner only).

> Categories cannot be deleted if they are currently used by one or more tutorials.

---

## Material Management

- `GET /api/materials` – Retrieve all materials (public).
- `GET /api/materials/:id` – Retrieve a specific material by ID (public).
- `POST /api/materials` – Create a new material (authenticated users only).
- `PUT /api/materials/:id` – Update a material by ID (owner only).
- `DELETE /api/materials/:id` – Delete a material by ID (owner only).

> Materials cannot be deleted if they are currently used by one or more tutorials.


---

## Features

- **User Authentication:** Secure registration and login using JWT.
- **Tutorial Management:** Create, edit, delete, and view tutorials.
- **Category Management:** Organise tutorials into categories.
- **Material Management:** Manage tools and resources needed for projects.
- **Search & Sort:** Quickly find tutorials, materials, and categories.
- **Pagination:** Clean browsing experience for large datasets.
- **Responsive Design:** Works across desktop, tablet, and smaller windows.
- **Detail Pages:** View full content using GET by ID endpoints.

---

## Dependencies

## Backend (Node.js)

1. **Express** – Web framework for HTTP requests.
2. **MongoDB** – Database storage.
3. **Mongoose** – ODM for MongoDB.
4. **bcryptjs** – Password hashing.
5. **jsonwebtoken** – JWT authentication.
6. **cors** – Cross-origin requests.
7. **dotenv** – Environment variables.

## Frontend (Vite + React)

1. **React** – Frontend framework.
2. **Vite** – Build tool and development server.
3. **Mantine** – UI component library.
4. **React Router DOM** – Client-side routing.

---

## To Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd client
npm install