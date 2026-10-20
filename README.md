# OutboxLive Backend

A minimal Node.js/Express REST API for managing posts, users, and comments.

## Features
- JWT authentication
- Role‑based access (admin/user)
- CRUD operations for posts and comments
- Soft delete for posts
- Input validation with Joi
- MongoDB via Mongoose

## Setup
1. Install dependencies: `npm install`
2. Set environment variables (`DATABASE_URL`, `ACCESS_TOKEN_SECRET`) in `.env`
3. Start server: `npm run dev` (development) or `npm start` (production)

## API Endpoints

### Authentication (`/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register a new regular user |
| POST | `/login` | Login for regular users; returns access + refresh JWT tokens |

### Admin Authentication (`/admins`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Admin-only login; validates admin role before issuing tokens |

### Posts (`/api/posts`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List paginated posts with content previews |
| GET | `/:id` | Retrieve single post by ID (authenticated users/admins) |
| POST | `/` | Create a new post (regular users only; author from token) |
| PUT | `/:id` | Update post (admins or post owner only) |
| DELETE | `/:id` | Soft delete post (admins any; users own only) |

### Users (`/api/users` — requires auth + admin role except `/me/profile`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all users (admin only) |
| GET | `/:id` | Get user by ID (admin only) |
| POST | `/` | Create new user with role (admin only) |
| PUT | `/:id` | Update user details (admin only) |
| DELETE | `/:id` | Delete user (admin only) |
| GET | `/me/profile` | Get current authenticated user's profile |

### Comments (`/api/posts/:postId/comments`, `/api/comments/:id`)
| Method | Endpoint | Status |
|--------|----------|--------|
| GET | `/api/posts/:postId/comments` | Not implemented |
| POST | `/api/posts/:postId/comments` | Not implemented |
| PATCH | `/api/comments/:id` | Not implemented |
| DELETE | `/api/comments/:id` | Not implemented |

### System (`/api`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/status` | Health check endpoint |

*(See source code for full details and middleware protections.)*