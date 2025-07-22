# Agianex

A modern Vue.js web application for administrative user management and role-based access control.

## 📋 Overview

Agianex is a comprehensive user management system built with Vue 3, TypeScript, and Vuetify that provides role-based permissions and administrative controls. The application features a modern responsive design with light/dark theme support and is powered by Supabase for backend services.

## 🛠️ Technology Stack

### Frontend

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vuetify 3** - Material Design component library
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Vite** - Build tool and development server

### Backend & Services

- **Supabase** - Backend-as-a-Service
  - Authentication
  - PostgreSQL database
  - File storage
  - Real-time subscriptions

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Supabase account and project

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/jipenalver/agianex-web.git
   cd agianex-web
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
   ```

4. **Database Setup**

   - Set up your Supabase project
   - Create the necessary tables for users, roles, and permissions
   - Configure Row Level Security (RLS) policies

5. **Start the development server**

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

## 🌐 Deployment

### Production Build

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Environment Variables

Ensure all production environment variables are properly configured:

- Supabase URLs and keys
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
