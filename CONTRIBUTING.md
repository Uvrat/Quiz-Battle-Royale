# Contributing to Quiz Battle Royale 🚀

Thank you for your interest in contributing to Quiz Battle Royale! This document provides detailed guidelines and technical information for contributors.

## 📋 Table of Contents

1. [Development Setup](#development-setup)
2. [Project Structure](#project-structure)
3. [Coding Standards](#coding-standards)
4. [Testing Guidelines](#testing-guidelines)
5. [Pull Request Process](#pull-request-process)
6. [Technical Architecture](#technical-architecture)
7. [State Management](#state-management)
8. [Styling Guidelines](#styling-guidelines)
9. [Performance Considerations](#performance-considerations)
10. [Security Guidelines](#security-guidelines)

## 🛠️ Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git
- PostgreSQL
- VS Code (recommended) or your preferred IDE

### Environment Setup

1. **Clone and Install**
```bash
git clone https://github.com/yourusername/quiz_battle_royale.git
cd quiz_battle_royale
```

2. **Environment Variables**
Create `.env` files in both client and server directories:

Client (.env):
```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=ws://localhost:3000
```

Server (.env):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/quiz_battle_royale"
JWT_SECRET=your_jwt_secret
PORT=3000
```

3. **Database Setup**
```bash
cd server
npx prisma migrate dev
```

## 📁 Project Structure

```
quiz_battle_royale/
├── client/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React context providers
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── types/         # TypeScript type definitions
│   │   ├── utils/         # Utility functions
│   │   └── App.tsx        # Main application component
│   └── public/            # Static assets
└── server/
    ├── src/
    │   ├── controllers/   # Route controllers
    │   ├── models/        # Database models
    │   ├── routes/        # API routes
    │   ├── services/      # Business logic
    │   ├── utils/         # Utility functions
    │   └── app.ts         # Express application
    └── prisma/            # Database schema and migrations
```

## 💻 Coding Standards

### TypeScript Guidelines
- Use strict type checking
- Avoid `any` type
- Use interfaces for object shapes
- Use type guards when necessary
- Document complex types

### React Best Practices
- Use functional components
- Implement proper error boundaries
- Use React hooks effectively
- Follow the React component lifecycle
- Implement proper cleanup in useEffect

### Code Style
- Use ESLint and Prettier
- Follow the Airbnb style guide
- Use meaningful variable names
- Write self-documenting code
- Add comments for complex logic

## 🧪 Testing Guidelines

### Frontend Testing
- Use Jest and React Testing Library
- Write unit tests for components
- Write integration tests for features
- Test user interactions
- Mock API calls and WebSocket connections

### Backend Testing
- Use Jest for unit tests
- Test API endpoints
- Test database operations
- Test WebSocket events
- Implement proper error handling

## 🔄 Pull Request Process

1. **Branch Naming**
   - feature/feature-name
   - bugfix/bug-description
   - hotfix/issue-description

2. **Commit Messages**
   - Use conventional commits
   - Be descriptive and concise
   - Reference issue numbers

3. **PR Description**
   - Describe changes
   - Link related issues
   - Include screenshots if UI changes
   - List testing performed

## 🏗️ Technical Architecture

### Frontend Architecture
- React for UI components
- TypeScript for type safety
- Context API for state management
- React Router for navigation
- Socket.IO for real-time communication
- Tailwind CSS for styling

### Backend Architecture
- Node.js with Express
- Prisma for database operations
- Socket.IO for real-time features
- JWT for authentication
- PostgreSQL for data storage

## 📊 State Management

### Context Structure
- AuthContext: User authentication
- ThemeContext: UI theme preferences
- SocketContext: WebSocket connections
- QuizContext: Quiz state management

### State Updates
- Use proper state immutability
- Implement optimistic updates
- Handle loading states
- Manage error states

## 🎨 Styling Guidelines

### Tailwind CSS
- Use utility classes
- Follow mobile-first approach
- Maintain consistent spacing
- Use design tokens
- Implement dark mode support

### Component Styling
- Use consistent class ordering
- Implement responsive design
- Follow accessibility guidelines
- Use semantic HTML
- Implement proper animations

## ⚡ Performance Considerations

### Frontend Optimization
- Implement code splitting
- Use proper lazy loading
- Optimize images
- Minimize bundle size
- Use proper caching

### Backend Optimization
- Implement proper indexing
- Use connection pooling
- Implement caching
- Optimize database queries
- Handle rate limiting

## 🔒 Security Guidelines

### Authentication
- Implement proper JWT handling
- Use secure password hashing
- Implement proper session management
- Use HTTPS
- Implement proper CORS

### Data Protection
- Validate user input
- Sanitize data
- Implement proper error handling
- Use secure headers
- Follow OWASP guidelines

## 📚 Additional Resources

- [React Documentation](https://reactjs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Socket.IO Documentation](https://socket.io/)
- [Prisma Documentation](https://www.prisma.io/)

## 🤝 Need Help?

- Open an issue
- Join our Discord community
- Check the documentation
- Review existing PRs
- Contact maintainers

Thank you for contributing to Quiz Battle Royale! 🎉 