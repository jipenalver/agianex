# Agianex

A modern Vue.js web application for administrative user management, role-based access control, and geolocation-based citizen reporting system.

## 📋 Overview

Agianex is a comprehensive administrative platform built with Vue 3, TypeScript, and Vuetify that combines user management, role-based permissions, and real-time GPS tracking capabilities. The application features a modern responsive design with light/dark theme support, powered by Supabase for backend services and Google Maps for location-based features.

## ✨ Features

### 🔐 Authentication System

- User registration and login
- Secure session management
- Password reset functionality
- Protected routes with authentication guards

### 👥 User Management

- Add, edit, and delete user accounts
- Comprehensive user profiles with avatars
- Phone and email management
- Admin dashboard for user oversight

### 🎭 Role-Based Access Control

- Create custom user roles
- Assign specific page permissions per role
- Granular access control system
- Super administrator privileges

### 📍 Geolocation & Mapping

- Real-time GPS tracking using device location
- Interactive Google Maps integration
- Advanced markers with custom content
- Citizen report mapping with location data
- Pause/resume location tracking functionality

### ⚙️ Settings & Profile

- User profile editing
- Avatar/profile picture uploads
- Password change functionality
- Account information management

### 🎨 Modern UI/UX

- Material Design with Vuetify 3
- Responsive design for all devices
- Light and dark theme support
- Intuitive navigation and layout

### 📱 Mobile-Ready

- Capacitor integration for mobile apps
- Camera and filesystem access
- Haptic feedback support
- Status bar and keyboard management

## 🛠️ Technology Stack

### Frontend

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vuetify 3** - Material Design component library
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Vite** - Build tool and development server
- **VueUse** - Composition utilities (geolocation, etc.)

### Maps & Geolocation

- **vue3-google-map** - Google Maps integration
- **Google Maps API** - Maps, markers, and geolocation services
- **VueUse Geolocation** - Device GPS tracking

### Backend & Services

- **Supabase** - Backend-as-a-Service
  - Authentication
  - PostgreSQL database
  - File storage
  - Real-time subscriptions

### Mobile Development

- **Capacitor** - Cross-platform mobile app framework
  - Android support
  - Camera and filesystem access
  - Device APIs (haptics, keyboard, status bar)

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Material Design Icons** - Icon library

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Supabase account and project

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/jipenalver/agianex.git
   cd agianex
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create a `.env` file in the root directory:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Database Setup**

   - Set up your Supabase project
   - Create the necessary tables for users, roles, and permissions
   - Configure Row Level Security (RLS) policies

5. **Google Maps Setup**

   - Create a Google Cloud Platform project
   - Enable the Maps JavaScript API
   - Create an API key and restrict it appropriately
   - Enable Advanced Markers (requires Map ID configuration)

6. **Start the development server**

   ```bash
   npm run dev
   ```

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 📁 Project Structure

```text
src/
├── assets/          # Static assets (images, icons, etc.)
├── components/      # Reusable Vue components
│   ├── common/      # Common UI components
│   ├── layout/      # Layout components
│   └── navigation/  # Navigation components
├── router/          # Vue Router configuration
├── stores/          # Pinia stores for state management
├── utils/           # Utility functions and helpers
├── views/           # Page components
│   ├── auth/        # Authentication pages
│   ├── errors/      # Error pages
│   ├── landing/     # Landing page
│   └── system/      # System/admin pages
└── main.ts          # Application entry point
```

## 🔑 Key Concepts

### User Roles

- **Super Administrator**: Full system access and user management
- **Custom Roles**: Configurable roles with specific page permissions
- **Role Assignment**: Users can be assigned roles that determine their access level

### Permission System

- Page-level access control
- Role-based navigation
- Protected routes with authentication guards
- Granular permission management

### Geolocation Features

- **Real-time GPS Tracking**: Uses device's built-in GPS for high accuracy positioning
- **Interactive Maps**: Google Maps integration with custom markers and controls
- **Citizen Reporting**: Location-based reporting system for administrative purposes
- **Privacy Controls**: Users can pause/resume location tracking as needed

## 🌐 Deployment

### Production Build

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Environment Variables

Ensure all production environment variables are properly configured:

- Supabase URLs and keys
- Google Maps API key with production restrictions
- Any additional API endpoints
- Feature flags (if applicable)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 👨‍💻 Author

**jipenalver** - [GitHub Profile](https://github.com/jipenalver)

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

Built with ❤️ using Vue.js and Supabase
