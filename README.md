# Task Manager - Fullstack Web Application

Modern, responsive task management application built with Node.js and React.

![Task Manager](https://img.shields.io/badge/Status-Production%20Ready-green)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-5+-green)

## 📱 Demo Screenshots

<div align="center">
  
### 🔐 Authentication
<img src="images/login.png" alt="Login Page" width="45%" />
<img src="images/register.png" alt="Register Page" width="45%" />

### 📊 Dashboard & Task Management
<img src="images/dashboard.png" alt="Dashboard" width="45%" />
<img src="images/task.png" alt="Task Management" width="45%" />

</div>

## 🚀 Features

- **User Authentication**: JWT-based secure login/register
- **Task Management**: Full CRUD operations for tasks
- **Real-time Updates**: Instant task status changes
- **Responsive Design**: Works on desktop and mobile
- **Data Persistence**: MongoDB database with Mongoose ODM
- **Modern UI**: Clean, intuitive interface with Tailwind CSS
- **API Documentation**: RESTful API endpoints
- **Security**: Password encryption, input validation, CORS protection
- **Testing**: Comprehensive test coverage
- **CI/CD**: Automated testing and deployment

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, CORS, input validation
- **Testing**: Jest, Supertest
- **Code Quality**: ESLint, Prettier

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **State Management**: Context API
- **Testing**: Jest, React Testing Library
- **Build Tool**: Create React App

## 📁 Project Structure

```
task-manager-app/
├── backend/
│   ├── models/          # Database models (User, Task)
│   ├── routes/          # API routes (auth, tasks)
│   ├── middleware/      # Custom middleware (auth, validation)
│   ├── config/          # Configuration files
│   ├── tests/           # Test files
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   ├── types/       # TypeScript type definitions
│   │   ├── utils/       # Utility functions
│   │   └── App.tsx      # Main App component
│   └── public/          # Static files
└── .github/
    └── workflows/       # CI/CD pipelines
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Git installed

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/elifnuroksuz/task-manager-fullstack.git
   cd task-manager-fullstack
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Copy environment file and configure
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   
   # Start development server
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   
   # Copy environment file and configure
   cp .env.example .env
   
   # Start development server
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=Task Manager
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile

### Tasks
- `GET /api/tasks` - Get user's tasks (with pagination, filtering)
- `GET /api/tasks/:id` - Get specific task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/status` - Update task status
- `GET /api/tasks/stats/overview` - Get task statistics

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test           # Run all tests
npm run test:watch # Run tests in watch mode
```

### Frontend Tests
```bash
cd frontend
npm test           # Run all tests
npm test -- --coverage # Run with coverage
```

## 🚀 Deployment

### Backend (Render/Heroku)
1. Create new web service
2. Connect your GitHub repository
3. Set environment variables
4. Deploy from main branch

### Frontend (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Set environment variables
5. Deploy

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CORS configuration
- Rate limiting (can be added)
- SQL injection prevention
- XSS protection

## 📊 Performance Optimization

- Database indexing
- Pagination for large datasets
- Image optimization (if implemented)
- Code splitting (React lazy loading)
- Caching strategies
- Minification and bundling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact: elifnuroksuz4@gmail.com
- LinkedIn: [Elif Nur ÖKSÜZ](https://linkedin.com/in/elifnuroksuz)

## 🎉 Acknowledgments

- React.js team for the amazing framework
- Express.js for the backend framework
- MongoDB for the database
- Tailwind CSS for styling utilities
- All open source contributors

---

**Built with ❤️ by Elif Nur ÖKSÜZ**

*Happy coding! 🚀*
