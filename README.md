# SwasthAI Frontend

Modern, responsive React frontend for SwasthAI - An AI-powered fitness and nutrition application.

## Features

- 🎨 Beautiful, modern UI with gradient designs
- 📱 Fully responsive (mobile, tablet, desktop)
- 🔐 User authentication (Login/Register)
- 🏠 Interactive dashboard
- 🥗 AI-powered diet plan generator
- 💬 Real-time AI fitness coach chat
- ⚡ Smooth animations and transitions
- 🎯 Clean, maintainable code structure

## Tech Stack

- React 18
- React Router DOM
- Axios
- Vite
- Pure CSS (No external UI libraries)

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx          # Login page
│   │   ├── Register.jsx       # Registration page
│   │   ├── Dashboard.jsx      # Main dashboard
│   │   ├── Diet.jsx           # Diet plan generator
│   │   └── Chat.jsx           # AI coach chat
│   ├── styles/
│   │   ├── Auth.css           # Login/Register styles
│   │   ├── Dashboard.css      # Dashboard styles
│   │   ├── Diet.css           # Diet page styles
│   │   └── Chat.css           # Chat page styles
│   ├── services/
│   │   └── api.js             # Axios API configuration
│   ├── App.jsx                # Main app component
│   ├── App.css                # Global app styles
│   ├── index.css              # Global CSS variables
│   └── main.jsx               # Entry point
├── public/
├── index.html
└── package.json
```

## Setup & Installation

1. Install dependencies:
```bash
npm install
```

2. Update API base URL in `src/services/api.js` if needed:
```javascript
const API = axios.create({
  baseURL: "http://localhost:5000/api"
});
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Pages Overview

### Login & Register
- Clean, modern authentication forms
- Input validation
- Error handling
- Auto-redirect after successful login/registration

### Dashboard
- Welcome message with user name
- Feature cards for Diet and Chat
- Responsive grid layout
- Quick navigation

### Diet Plan Generator
- BMI input with category indicator
- Food preference selection
- Health conditions input
- AI-generated personalized meal plans
- Beautiful meal cards display

### AI Coach Chat
- Real-time chat interface
- Welcome screen with quick questions
- Typing indicator
- Message history
- Smooth scrolling
- Keyboard shortcuts (Enter to send)

## Design Features

- **Color Scheme**: Purple gradient theme (#667eea to #764ba2)
- **Typography**: Segoe UI font family
- **Animations**: Fade-in, bounce, pulse effects
- **Responsive**: Mobile-first approach
- **Accessibility**: Proper labels, focus states
- **Performance**: Optimized CSS, minimal re-renders

## CSS Variables

Global CSS variables defined in `index.css`:
- `--primary-gradient`: Main purple gradient
- `--secondary-gradient`: Pink gradient
- `--success-color`: Green (#4caf50)
- `--text-dark`: Dark text (#333)
- `--text-light`: Light text (#666)
- `--shadow-sm/md/lg`: Box shadow levels

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Tips

- Use React DevTools for debugging
- Check console for API errors
- Ensure backend is running on port 5000
- Clear localStorage if facing auth issues

## Future Enhancements

- Dark mode toggle
- Profile page with user details
- Progress tracking charts
- Workout plan generator
- Meal history
- Export diet plans as PDF

## License

ISC
