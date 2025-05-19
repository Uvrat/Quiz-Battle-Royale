# Quiz Battle Royale 🎮

A real-time multiplayer quiz platform where users can create, join, and compete in quiz arenas. Test your knowledge against others in an exciting battle royale format!

## 🌟 Features

### Core Features
- **Real-time Quiz Battles**: Compete with other players in live quiz sessions
- **Custom Quiz Creation**: Create your own quiz arenas with custom questions
- **Live Leaderboard**: Watch scores update in real-time during quiz sessions
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Works seamlessly on both desktop and mobile devices
- **Dark/Light Mode**: Toggle between dark and light themes for comfortable viewing

### Quiz Arena Features
- **Host Mode**: Create and manage quiz sessions
- **Participant Tracking**: Monitor who's participating in your quiz
- **Score System**: Real-time scoring based on answer speed and accuracy
- **Question Management**: Add, edit, and organize quiz questions
- **Time Limits**: Set custom time limits for each question

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Modern web browser

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/quiz_battle_royale.git
cd quiz_battle_royale
```

2. Install dependencies:
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables:
   - Create `.env` files in both client and server directories
   - Follow the `.env.example` files for required variables

4. Start the development servers:
```bash
# Start the client (from client directory)
npm run dev

# Start the server (from server directory)
npm run dev
```

## 🎮 How to Play

1. **Create an Account**
   - Register a new account or login with existing credentials
   - Customize your profile

2. **Join or Create an Arena**
   - Browse existing quiz arenas
   - Create your own quiz arena with custom questions
   - Set time limits and scoring rules

3. **Participate in Quizzes**
   - Join a quiz arena
   - Answer questions within the time limit
   - Compete for the highest score
   - Watch the live leaderboard

4. **Host a Quiz**
   - Create your quiz arena
   - Invite participants
   - Monitor progress and scores
   - End the quiz when finished

## 🛠️ Technical Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- Socket.IO Client
- React Router
- Context API for state management

### Backend
- Node.js
- Express
- Socket.IO
- Prisma
- PostgreSQL

## 📱 Supported Platforms

- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers
- Progressive Web App (PWA) support

## 🔒 Security Features

- JWT-based authentication
- Secure password hashing
- Protected routes
- Input validation
- XSS protection
- CSRF protection

## 🎨 UI/UX Features

- Responsive design
- Dark/Light theme support
- Smooth animations
- Interactive elements
- Loading states
- Error handling
- Toast notifications

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) file for details on how to contribute to this project.

## 📞 Support

For support, please:
1. Check the [FAQ](docs/FAQ.md)
2. Open an issue in the GitHub repository
3. Contact the maintainers

## 🙏 Acknowledgments

- Thanks to all contributors
- Inspired by popular quiz and battle royale games
- Built with modern web technologies 