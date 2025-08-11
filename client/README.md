# GlobeTrotter - Travel Planning Application

A modern, responsive travel planning application built with React, Vite, and Tailwind CSS. Plan your perfect trip with comprehensive travel planning tools, budget management, and personalized recommendations.

## 🚀 Features

- **User Authentication**: Secure login/signup system with JWT tokens
- **Trip Management**: Create, edit, and organize your travel plans
- **Itinerary Builder**: Build detailed day-by-day itineraries
- **Budget Tracking**: Monitor and manage travel expenses
- **City & Activity Search**: Discover destinations and attractions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Cross-Platform**: Compatible with Windows, macOS, and Linux
- **PWA Ready**: Progressive Web App support for mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router DOM 6
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React
- **Charts**: Chart.js with React Chart.js 2
- **HTTP Client**: Axios
- **State Management**: React Context API + Custom Hooks

## 📱 Cross-Platform Compatibility

- **Desktop**: Windows, macOS, Linux
- **Mobile**: iOS Safari, Android Chrome
- **Tablet**: iPad, Android tablets
- **Touch Support**: Optimized for touch devices
- **Responsive Design**: Adapts to all screen sizes
- **PWA Features**: Installable on mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Navbar, Footer, etc.)
│   └── ui/            # Basic UI components (Button, Input, etc.)
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and API functions
├── screens/            # Page components
└── assets/             # Static assets
```

## 🎨 Design System

### Color Palette
- **Primary**: Midnight (#0f172a), Ocean (#0369a1), Sky (#0ea5e9)
- **Neutral**: 50-900 scale for backgrounds and text
- **Feedback**: Success, Warning, Error states

### Typography
- **Font Family**: Inter (with system font fallbacks)
- **Responsive**: Scales appropriately across devices
- **Accessibility**: High contrast ratios and readable sizes

### Components
- **Buttons**: Multiple variants (primary, secondary, ghost, destructive)
- **Inputs**: Form fields with validation states
- **Cards**: Flexible card system for content display
- **Navigation**: Responsive navbar with mobile menu

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the client directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### Tailwind Configuration
Custom configuration in `tailwind.config.js` with:
- Custom color palette
- Responsive utilities
- Animation classes
- Component variants

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
The app is configured for easy deployment to modern hosting platforms.

## 🧪 Testing

### Manual Testing
- Test on different devices and browsers
- Verify responsive behavior
- Check accessibility features
- Test touch interactions on mobile

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📱 PWA Features

- **Installable**: Add to home screen on mobile devices
- **Offline Ready**: Service worker for offline functionality
- **App-like Experience**: Full-screen mode and native feel
- **Cross-Platform**: Works on iOS and Android

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Protected Routes**: Authentication guards for private pages
- **Input Validation**: Client-side form validation
- **XSS Protection**: Sanitized user inputs

## 🌐 Internationalization Ready

- **Multi-language Support**: Prepared for i18n implementation
- **RTL Support**: Right-to-left language support ready
- **Localized Formatting**: Date, number, and currency formatting

## 📊 Performance

- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Optimized Images**: Responsive image loading
- **Bundle Analysis**: Built-in bundle analyzer

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🎯 Roadmap

- [ ] Backend API integration
- [ ] Real-time collaboration
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] AI-powered recommendations
- [ ] Social features and sharing

---

**Built with ❤️ for travelers around the world**
