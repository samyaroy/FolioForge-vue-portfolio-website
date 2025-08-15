# My Portfolio - Vue.js Application

A modern, responsive portfolio website built with Vue.js 3, Vuetify (Material Design), and Tailwind CSS. Features conditional layout rendering and beautiful UI components.

## 🚀 Technologies Used

- **Vue.js 3** - Progressive JavaScript framework with Composition API
- **Vue Router 4** - Official router for Vue.js applications
- **Vuetify 3** - Material Design component framework for Vue.js
- **Tailwind CSS 3** - Utility-first CSS framework
- **Vite** - Next-generation frontend build tool
- **Material Design Icons** - Icon library for Material Design

## 📁 File Structure

```
samyabrata.github.io/
├── public/                          # Static assets
│   ├── CNAME                        # Custom domain configuration
│   └── vite.svg                     # Vite logo
├── src/                             # Source code directory
│   ├── assets/                      # Static assets (images, fonts, etc.)
│   │   └── vue.svg                  # Vue.js logo
│   ├── components/                  # Reusable Vue components
│   │   ├── Header.vue              # Navigation header component
│   │   └── Footer.vue              # Footer component with links
│   ├── router/                      # Vue Router configuration
│   │   └── index.js                # Route definitions and router setup
│   ├── views/                       # Page components (route views)
│   │   ├── Home.vue                # Landing page (no header/footer)
│   │   ├── About.vue               # About page with skills & experience
│   │   └── Contact.vue             # Contact page with form
│   ├── App.vue                      # Root component with conditional layout
│   ├── main.js                      # Application entry point
│   └── style.css                    # Global styles with Tailwind directives
├── index.html                       # HTML template
├── package.json                     # Dependencies and scripts
├── package-lock.json                # Locked dependency versions
├── postcss.config.js                # PostCSS configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── vite.config.js                   # Vite build configuration
└── README.md                        # Project documentation
```

## 🏗️ Architecture Overview

### **Core Components**

#### **App.vue** - Root Component
- **Purpose**: Main application wrapper with conditional layout logic
- **Key Features**:
  - Conditional rendering of Header and Footer based on current route
  - Header and Footer are hidden on HomePage (`/`) for a clean landing experience
  - Uses Vue Router's `useRoute()` to determine current page
  - Implements flexbox layout for proper footer positioning

#### **Router Configuration** (`src/router/index.js`)
- **Routes**:
  - `/` - HomePage (Home.vue)
  - `/about` - About page (About.vue)
  - `/contact` - Contact page (Contact.vue)
- **Features**: Lazy loading for About and Contact pages

### **Page Components** (`src/views/`)

#### **Home.vue** - Landing Page
- **Layout**: Full-screen hero section without header/footer
- **Features**:
  - Hero section with call-to-action buttons
  - Feature cards showcasing services
  - Technology stack display
  - Responsive design with Tailwind CSS

#### **About.vue** - About Page
- **Layout**: Standard page with header and footer
- **Features**:
  - Professional bio and story
  - Skills and technologies section
  - Work experience timeline
  - Responsive grid layout

#### **Contact.vue** - Contact Page
- **Layout**: Standard page with header and footer
- **Features**:
  - Contact form with validation
  - Contact information display
  - Social media links
  - Form submission handling

### **Reusable Components** (`src/components/`)

#### **Header.vue** - Navigation Header
- **Features**:
  - Material Design app bar with Vuetify
  - Responsive navigation with mobile hamburger menu
  - Active route highlighting
  - Brand logo with router link
  - Mobile navigation drawer

#### **Footer.vue** - Footer Component
- **Features**:
  - Contact information
  - Quick navigation links
  - Social media buttons
  - Copyright and legal links
  - Responsive grid layout

## 🎨 Styling Architecture

### **Tailwind CSS Integration**
- **Utility Classes**: Used throughout components for spacing, colors, typography
- **Responsive Design**: Mobile-first approach with responsive prefixes
- **Custom Configuration**: Configured in `tailwind.config.js`

### **Vuetify Material Design**
- **Components**: Buttons, cards, forms, navigation, icons
- **Theme**: Material Design color palette and typography
- **Icons**: Material Design Icons (MDI) integration

### **CSS Organization**
- **Global Styles**: `src/style.css` with Tailwind directives
- **Component Styles**: Scoped styles in individual components
- **PostCSS**: Configured for Tailwind and Autoprefixer

## 🔧 Configuration Files

### **Vite Configuration** (`vite.config.js`)
- **Vue Plugin**: Vue.js support
- **Path Aliases**: `@` maps to `src/` directory
- **Base URL**: Configured for deployment

### **Tailwind Configuration** (`tailwind.config.js`)
- **Content Paths**: Scans Vue files for utility classes
- **Theme**: Customizable design tokens
- **Plugins**: Extensible with additional plugins

### **PostCSS Configuration** (`postcss.config.js`)
- **Tailwind CSS**: CSS processing
- **Autoprefixer**: Vendor prefix automation

## 🚀 Development & Deployment

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run deploy       # Deploy to GitHub Pages
```

### **Development Server**
- **URL**: `http://localhost:5173` (or next available port)
- **Hot Reload**: Automatic browser refresh on file changes
- **Error Overlay**: In-browser error display

### **Build Process**
- **Vite**: Fast build tool with ES modules
- **Optimization**: Code splitting and tree shaking
- **Output**: Optimized static files in `dist/` directory

## 🎯 Key Features

### **Conditional Layout System**
- **HomePage**: Clean, full-screen experience without header/footer
- **Other Pages**: Standard layout with navigation and footer
- **Dynamic Rendering**: Based on current route

### **Responsive Design**
- **Mobile-First**: Optimized for all screen sizes
- **Breakpoints**: Tailwind's responsive utilities
- **Mobile Menu**: Hamburger menu with navigation drawer

### **Modern UI/UX**
- **Material Design**: Consistent design language
- **Smooth Transitions**: Hover effects and animations
- **Accessibility**: Semantic HTML and ARIA attributes

### **Form Handling**
- **Validation**: Vuetify form validation rules
- **User Feedback**: Loading states and success messages
- **Responsive Forms**: Mobile-friendly input fields

## 🔄 State Management

### **Reactive Data**
- **Composition API**: Modern Vue.js reactivity system
- **Route-Based Logic**: Dynamic layout based on current route
- **Form State**: Reactive form data and validation

### **Component Communication**
- **Props**: Parent-to-child data flow
- **Events**: Child-to-parent communication
- **Router**: Page navigation and state

## 📱 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **ES6+ Features**: Arrow functions, destructuring, modules
- **CSS Grid/Flexbox**: Modern layout techniques
- **Progressive Enhancement**: Graceful degradation for older browsers

## 🛠️ Customization

### **Theming**
- **Vuetify Theme**: Customizable Material Design theme
- **Tailwind Colors**: Extendable color palette
- **CSS Variables**: Dynamic theming support

### **Content Management**
- **Component-Based**: Easy to modify individual sections
- **Reusable Components**: Consistent design patterns
- **Configuration**: Centralized settings in config files

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ using Vue.js, Vuetify, and Tailwind CSS**
