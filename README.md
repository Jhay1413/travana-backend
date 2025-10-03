# Travana Backend

A modern Express.js backend API built with TypeScript, featuring a clean architecture and comprehensive error handling.

## Features

- 🚀 **Express.js** with TypeScript
- 🛡️ **Security** with Helmet
- 🌐 **CORS** enabled
- 📝 **Request logging** with Morgan
- 🏗️ **Clean architecture** with controllers, routes, and middleware
- 🔧 **Development tools** with nodemon and ts-node
- 📦 **TypeScript** with strict configuration

## Project Structure

```
src/
├── controllers/          # Request handlers
│   ├── authController.ts
│   └── userController.ts
├── middleware/          # Custom middleware
│   ├── errorHandler.ts
│   └── notFound.ts
├── routes/             # API routes
│   ├── authRoutes.ts
│   ├── userRoutes.ts
│   └── index.ts
├── types/              # TypeScript type definitions
│   └── User.ts
├── utils/              # Utility functions
│   └── logger.ts
└── index.ts            # Main application entry point
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file:
   ```bash
   cp env.example .env
   ```

4. Update the `.env` file with your configuration

### Development

Start the development server with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Production

Build the TypeScript code:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run clean` - Clean build directory

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC
