# My Portfolio - Vue.js Application

A modern, responsive portfolio website built with Vue.js 3, Vuetify (Material Design), and Tailwind CSS. The app is data-driven via YAML content and includes dedicated pages for projects, publications, teachings, internships, affiliations, workshops, professional activities, and contact.

## 🚀 Technologies Used

- **Vue.js 3** - Progressive JavaScript framework with Composition API
- **Vue Router 4** - Official router for Vue.js applications
- **Vuetify 3** - Material Design component framework for Vue.js
- **Tailwind CSS 3** - Utility-first CSS framework
- **Vite** - Next-generation frontend build tool
- **YAML Content Source** - Structured profile/content data via `profile_info.yml`
- **Vite Sitemap Plugin** - Automated sitemap generation during build
- **Material Design Icons** - Icon library for Material Design

## 📁 File Structure

```
.
├── CNAME                                          # Custom domain config for GitHub Pages
├── LICENSE                                        # MIT license text
├── README.md                                      # Project documentation
├── eslint.config.js                               # ESLint configuration
├── index.html                                     # HTML template used by Vite
├── package-lock.json                              # Locked npm dependency tree
├── package.json                                   # Project scripts and dependencies
├── postcss.config.js                              # PostCSS plugin configuration
├── public/                                        # Public static assets served as-is
│   ├── CNAME                                      # Domain config copied to production build
│   ├── SamyabrataRoy2.jpg                         # Primary profile image
│   ├── googlef62b25008a7b041d.html                # Google Search Console verification file
│   ├── icons/                                     # Social and platform icons
│   │   ├── Credly.png                             # Credly icon
│   │   ├── GS.png                                 # Google Scholar icon
│   │   ├── Orchid.png                             # Orchid icon
│   │   └── RG.png                                 # ResearchGate icon
│   ├── logo/                                      # Institute logo assets
│   │   ├── CITC.png                               # CITC logo
│   │   ├── COURSERA.png                           # Coursera logo
│   │   ├── IDEAS.png                              # IDEAS logo
│   │   ├── IITM.png                               # IIT Madras logo
│   │   ├── JHU.png                                # Johns Hopkins University logo
│   │   ├── MSRKAV.png                             # MSR KAV logo
│   │   ├── NN.png                                 # NN logo
│   │   └── SNU.png                                # SNU logo
│   ├── profile-icon.png                           # Profile icon used in cards/links
│   └── robots.txt                                 # Robots directives for crawlers
├── src/                                           # Application source code
│   ├── App.vue                                    # Root app layout and route-based chrome
│   ├── assets/                                    # Bundled assets imported by source files
│   │   └── icons/                                 # App icon assets
│   │       └── persons-in-a-class-by-flaticon.png # Teaching/projects icon
│   ├── components/                                # Shared reusable components
│   │   ├── DocumentViewer.vue                     # Embedded document preview component
│   │   ├── Footer/                                # Footer component group
│   │   │   ├── Index.vue                          # Main footer component
│   │   │   └── Logos.vue                          # Footer logos strip
│   │   ├── Header.vue                             # Global navigation header
│   │   └── SmartLink.vue                          # Smart internal/external link component
│   ├── config/                                    # Runtime configuration
│   │   └── featureFlags.js                        # Feature toggles and section visibility
│   ├── main.js                                    # App bootstrap and plugin setup
│   ├── metadata/                                  # Metadata-driven assets and mappings
│   │   ├── hyperlinkMetadata.yml                  # External link metadata map
│   │   ├── logo/                                  # Metadata logos
│   │   │   ├── institute/                         # Institute logos for cards/sections
│   │   │   │   ├── CITC.png                       # CITC logo copy for metadata
│   │   │   │   ├── COURSERA.png                   # Coursera logo copy for metadata
│   │   │   │   ├── IDEAS.png                      # IDEAS logo copy for metadata
│   │   │   │   ├── IITM.png                       # IIT Madras logo copy for metadata
│   │   │   │   ├── JHU.png                        # Johns Hopkins University logo copy
│   │   │   │   ├── MSRKAV.png                     # MSR KAV logo copy for metadata
│   │   │   │   ├── NN.png                         # NN logo copy for metadata
│   │   │   │   └── SNU.png                        # SNU logo copy for metadata
│   │   │   └── society/                           # Society logos for memberships
│   │   │       └── royal-statistics-society.png  # Royal Statistical Society logo
│   │   └── people/                                # Metadata people assets
│   │       └── profile-icon.png                   # Profile icon copy for metadata use
│   ├── profile_info.yml                           # Central portfolio data/content source
│   ├── router/                                    # Vue Router setup
│   │   └── index.js                               # Route definitions and lazy imports
│   ├── style.css                                  # Global CSS and Tailwind directives
│   └── views/                                     # Route-level pages and section modules
│       ├── Affilications/                         # Affiliations/collaborators/memberships page
│       │   ├── components/                        # Affiliation page components
│       │   │   ├── cards/                         # Card UI components for affiliations
│       │   │   │   ├── AffiliationCard.vue        # Affiliation card component
│       │   │   │   ├── CollaboratorCard.vue       # Collaborator card component
│       │   │   │   └── MembershipCard.vue         # Membership card component
│       │   │   └── tabs/                          # Tab components for affiliation page
│       │   │       ├── AffiliationsTab.vue        # Affiliations tab content
│       │   │       ├── CollaboratorsTab.vue       # Collaborators tab content
│       │   │       └── MembershipsTab.vue         # Memberships tab content
│       │   └── index.vue                          # Affiliations page entry component
│       ├── Cocurricular/                          # Co-curricular activities page
│       │   ├── Index.vue                          # Co-curricular page entry
│       │   └── components/                        # Co-curricular section components
│       │       ├── Leadership.vue                 # Leadership experience section
│       │       └── Volunteering.vue               # Volunteering experience section
│       ├── Contact.vue                            # Contact page view
│       ├── Home/                                  # Home/landing page module
│       │   ├── components/                        # Home page section components
│       │   │   ├── HeroSection.vue                # Landing hero section
│       │   │   ├── awards/                        # Awards section module
│       │   │   │   ├── Index.vue                  # Awards section container
│       │   │   │   └── components/                # Awards subcomponents
│       │   │   │       └── AwardCard.vue          # Single award card component
│       │   │   ├── education/                     # Education section module
│       │   │   │   ├── Index.vue                  # Education section container
│       │   │   │   └── components/                # Education subcomponents
│       │   │   │       └── EducationMilestone.vue # Education milestone/timeline item
│       │   │   ├── experience/                    # Experience section module
│       │   │   │   ├── Index.vue                  # Experience section container
│       │   │   │   └── components/                # Experience subcomponents
│       │   │   │       └── TimelineComponent.vue  # Work experience timeline component
│       │   │   └── researchInterests/             # Research interests section module
│       │   │       ├── Index.vue                  # Research interests container
│       │   │       └── components/                # Research interests subcomponents
│       │   │           └── Card.vue               # Research interest card
│       │   └── index.vue                          # Home page entry component
│       ├── InternshipCertification/               # Internship and certification page
│       │   ├── Index.vue                          # Internship/certification page entry
│       │   └── components/                        # Internship/certification components
│       │       ├── CertificationCard.vue          # Certification card component
│       │       └── InternshipCard.vue             # Internship card component
│       ├── OngoingProjects/                       # Ongoing projects page
│       │   ├── components/                        # Ongoing project components
│       │   │   └── ProjectCard.vue                # Ongoing project card component
│       │   └── index.vue                          # Ongoing projects page entry
│       ├── ProfessionalAcitivity/                 # Professional activity page
│       │   ├── components/                        # Professional activity components
│       │   │   ├── cards/                         # Professional activity card components
│       │   │   │   ├── HostedEventCard.vue        # Hosted event card component
│       │   │   │   └── InvitedTalkCard.vue        # Invited talk card component
│       │   │   └── tabs/                          # Professional activity tabs
│       │   │       ├── HostedEventsTab.vue        # Hosted events tab content
│       │   │       └── InvitedTalksTab.vue        # Invited talks tab content
│       │   └── index.vue                          # Professional activity page entry
│       ├── ProjectsPublications/                  # Projects and publications page
│       │   ├── Index.vue                          # Projects/publications page entry
│       │   └── components/                        # Projects/publications tab components
│       │       ├── ArticlesTab.vue                # Articles tab content
│       │       ├── PostersTab.vue                 # Posters tab content
│       │       ├── ProjectTab/                    # Project tab module
│       │       │   ├── Index.vue                  # Project tab entry component
│       │       │   └── components/                # Project tab subcomponents
│       │       │       ├── ResearchProjects.vue   # Research projects list component
│       │       │       └── TechnicalProjects.vue  # Technical projects list component
│       │       └── PublicationsTab.vue            # Publications tab content
│       ├── Teachings/                             # Teaching and mentoring page
│       │   ├── components/                        # Teaching page tab components
│       │   │   ├── CoursesTaughtTab.vue           # Courses taught tab content
│       │   │   ├── OtherTeachingsTab.vue          # Other teaching engagements tab
│       │   │   └── ProjectsMentoredTab.vue        # Mentored projects tab content
│       │   └── index.vue                          # Teachings page entry
│       └── WorkshopsAttended/                     # Workshops, conferences, FDPs, bootcamps page
│           ├── Index.vue                          # Workshops page entry
│           └── components/                        # Workshops page components
│               ├── cards/                         # Workshop card components
│               │   ├── BootcampCard.vue           # Bootcamp card component
│               │   ├── ConferenceCard.vue         # Conference card component
│               │   ├── FDPCard.vue                # FDP card component
│               │   └── WorkshopCard.vue           # Workshop card component
│               └── tabs/                          # Workshops page tab components
│                   ├── BootcampsTab.vue           # Bootcamps tab content
│                   ├── ConferencesTab.vue         # Conferences tab content
│                   ├── FDPsTab.vue                # FDPs tab content
│                   └── WorkshopsTab.vue           # Workshops tab content
├── tailwind.config.js                             # Tailwind theme and content config
├── toggle_branch.sh                               # Helper script for branch switching workflow
└── vite.config.js                                 # Vite build and alias configuration
```

## 🏗️ Architecture Overview

### **Core Components**

#### **App.vue** - Root Component
- **Purpose**: Main application wrapper and global page chrome container
- **Key Features**:
  - Renders shared `Header` and `Footer` around all route views
  - Uses `v-app` + flex layout for stable full-height page structure
  - Central `router-view` area for route content
  - Implements flexbox layout for proper footer positioning

#### **Router Configuration** (`src/router/index.js`)
- **Routes**:
  - `/` - Home page (`Home/index.vue`)
  - `/projects-publications` - Projects and Publications page
  - `/affiliation-memberships` - Affiliations, collaborators, memberships page
  - `/ongoing-projects` - Ongoing projects page
  - `/cocurricular` - Co-curricular activities page
  - `/workshops-bootcamps-attended` - Conferences, workshops, FDPs, bootcamps page
  - `/teachings` - Teachings page
  - `/internships-certifications` - Internships and certifications page
  - `/professional-activity` - Professional activities page
  - `/contact` - Contact page
- **Features**:
  - Uses `createWebHashHistory()` for static hosting compatibility
  - Includes scroll restoration and smooth hash scrolling
  - Supports deep-linking into tabbed pages via query params like `?tab=...`

### **Page Components** (`src/views/`)

#### **Home/index.vue** - Landing Page
- **Layout**: Multi-section landing page with global header/footer
- **Features**:
  - Hero section with call-to-action buttons
  - Education milestones with credentials
  - Work experience timeline
  - Research interests showcase
  - Optional awards section
  - Responsive design with Tailwind CSS

#### **ProjectsPublications/Index.vue** - Projects & Publications
- **Layout**: Tabbed interface
- **Features**:
  - Tabs for Projects, Articles, Publications, and Posters
  - Technical and research project grouping
  - Query-param tab deep-linking (`?tab=projects|articles|publications|posters`)

#### **WorkshopsAttended/Index.vue** - Workshops & Bootcamps
- **Layout**: Tabbed section layout
- **Features**:
  - Separate tabs for Conferences, FDPs, Workshops, and Bootcamps
  - Dedicated card components for each entry type
  - Query-param tab deep-linking for quick access

#### **Cocurricular/Index.vue** - Co-curricular Activities
- **Layout**: Sectioned layout
- **Features**:
  - Leadership experience showcase
  - Volunteering activities
  - Community and engagement highlights

#### **Teachings/index.vue** - Teachings
- **Layout**: Tabbed academic contribution layout
- **Features**:
  - Tabs for Courses Taught, Projects Mentored, and Other Teachings
  - Query-param tab deep-linking (`?tab=courses|projects|others`)

#### **InternshipCertification/Index.vue** - Internships & Certifications
- **Layout**: Tabbed profile section
- **Features**:
  - Training internships and certification tabs
  - Dedicated cards for internship and certification entries
  - Query-param tab deep-linking (`?tab=internships|certifications`)

#### **ProfessionalAcitivity/index.vue** - Professional Activities
- **Layout**: Tabbed professional profile layout
- **Features**:
  - Tabs for invited talks and hosted events
  - Dedicated cards and filters by activity type
  - Query-param tab deep-linking (`?tab=invited-talks|hosted-events`)

#### **Affilications/index.vue** - Affiliations, Collaborators & Memberships
- **Layout**: Tabbed collaboration/network layout
- **Features**:
  - Tabs for affiliations, collaborators, and memberships
  - Merges current and past collaborator data sources
  - Query-param tab deep-linking (`?tab=affiliations|collaborators|memberships`)

#### **OngoingProjects/index.vue** - Ongoing Projects
- **Layout**: Single-list page layout
- **Features**:
  - Active project listing using reusable project cards
  - Data-driven rendering from YAML profile data

#### **Contact.vue** - Contact Page
- **Layout**: Responsive contact card grid
- **Features**:
  - Phone/email/student-email blocks
  - Social and academic profile links
  - Quick links to GitHub, LinkedIn, Kaggle, Google Scholar, ResearchGate, and ORCID

### **Reusable Components** (`src/components/`)

#### **Header.vue** - Navigation Header
- **Features**:
  - Responsive navigation with mobile drawer menu
  - Active route highlighting
  - Brand logo with router link
  - "Hire Me" quick action button

#### **Footer/Index.vue** - Footer Component
- **Features**:
  - Contact information
  - Quick links to extended route set (ongoing projects, internships, affiliations, workshops)
  - Social media buttons
  - Academic profile links
  - Institution logo strip and `lastUpdatedOn` metadata display

### **Specialized Components**

#### **Education Components**
- **EducationMilestone.vue**: Individual education milestone with credentials
- **Index.vue**: Education timeline with degree information

#### **Experience Components**
- **TimelineComponent.vue**: Work experience timeline with detailed information
- **Index.vue**: Experience showcase with company details

#### **Awards Components**
- **AwardCard.vue**: Individual award/recognition card
- **Index.vue**: Awards and honors showcase

#### **Research Components**
- **Card.vue**: Research interest card with details
- **Index.vue**: Research areas and specializations

#### **Project Components**
- **ResearchProjects.vue**: Academic and research projects
- **TechnicalProjects.vue**: Software and technical projects
- **ArticlesTab.vue**: Published articles and papers
- **PublicationsTab.vue**: Academic publications
- **PostersTab.vue**: Posters and presentation artifacts

#### **Workshop Components**
- **ConferenceCard.vue**: Conference participation cards
- **FDPCard.vue**: Faculty development program cards
- **WorkshopCard.vue**: Workshop participation cards
- **BootcampCard.vue**: Bootcamp completion cards with credentials

#### **Co-curricular Components**
- **Leadership.vue**: Leadership experience showcase
- **Volunteering.vue**: Volunteering activities and community service

#### **Teachings Components**
- **CoursesTaughtTab.vue**: Courses taught section
- **ProjectsMentoredTab.vue**: Mentored projects section
- **OtherTeachingsTab.vue**: Other teaching contributions section

#### **Internship & Certification Components**
- **InternshipCard.vue**: Internship entry card
- **CertificationCard.vue**: Certification entry card

#### **Professional Activity Components**
- **InvitedTalkCard.vue**: Invited talk entry card
- **HostedEventCard.vue**: Hosted event entry card

#### **Affiliations Components**
- **AffiliationCard.vue**: Affiliation entry card
- **CollaboratorCard.vue**: Collaborator entry card
- **MembershipCard.vue**: Membership entry card

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
- **YAML Plugin**: Imports YAML portfolio data directly in Vue modules
- **Sitemap Plugin**: Generates sitemap entries for key routes
- **Path Aliases**: `@` maps to `src/` directory
- **Base URL**: `/` for GitHub Pages custom-domain deployment

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
npm run lint         # Run ESLint checks
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

### **Comprehensive Portfolio Sections**
- **Education**: Academic credentials and milestones
- **Experience**: Professional work history with detailed timelines
- **Projects**: Research and technical project showcases
- **Publications**: Academic papers and articles
- **Posters**: Poster and presentation showcase
- **Workshops**: Conferences, FDPs, workshops, and bootcamp participation
- **Teachings**: Courses taught, mentoring, and other contributions
- **Internships & Certifications**: Training and credential highlights
- **Professional Activity**: Invited talks and hosted events
- **Affiliations**: Affiliations, collaborators, and memberships
- **Ongoing Projects**: In-progress project tracker
- **Co-curricular**: Leadership and community involvement
- **Awards**: Recognition and honors

### **Enhanced Contact System**
- **Professional Contact**: Multiple contact methods
- **Academic Profiles**: Google Scholar and ResearchGate integration
- **Social Media**: LinkedIn, GitHub, student GitHub, and Kaggle
- **Research Identity**: ORCID and academic profile links

### **Tabbed Knowledge Sections**
- **Route Query Tabs**: Deep-link to specific tabs via `?tab=...`
- **Sectioned UX**: Multi-topic pages split into focused tabs
- **Reusable Cards**: Consistent card components across sections

### **Shared Layout System**
- **Global Header/Footer**: Common chrome rendered across pages
- **Route Content Region**: Centralized `router-view` for page modules
- **Consistent UX**: Uniform navigation and footer access site-wide

### **Responsive Design**
- **Mobile-First**: Optimized for all screen sizes
- **Breakpoints**: Tailwind's responsive utilities
- **Mobile Menu**: Hamburger menu with navigation drawer

### **Modern UI/UX**
- **Material Design**: Consistent design language
- **Smooth Transitions**: Hover effects and animations
- **Accessibility**: Semantic HTML and ARIA attributes

### **Navigation Behavior**
- **Hash Routing**: GitHub Pages-friendly navigation strategy
- **Scroll Restoration**: Keeps scroll position on navigation history
- **Anchor Support**: Smooth scrolling to hash targets

## 🔄 State Management

### **Reactive Data**
- **Composition API**: Modern Vue.js reactivity system
- **YAML-Driven Content**: Portfolio content sourced from `profile_info.yml`
- **Query-Based Tabs**: Tab state controlled through route query parameters

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

### **Credential Management**
- **Education**: Easy to add new degrees and certifications
- **Experience**: Simple timeline updates
- **Projects**: Modular project showcase system
- **Workshops**: Flexible bootcamp and training display

## 📋 Planned Updates & Improvements

### **Upcoming Enhancements**

The following features and improvements are planned for future development:

#### **1. Enhanced Credential Management**
- **Education Credentials**: Add detailed degree information, GPA, honors, and academic achievements
- **Professional Certifications**: Display industry certifications with verification links
- **Skills Credentials**: Showcase technical skills with proficiency levels and certifications
- **Awards & Recognition**: Expand awards section with detailed descriptions and verification
- **Experience Credentials**: Add company verification, role descriptions, and achievements

#### **2. Contact Page Redesign**
- **Multi-Channel Contact**: Integrate direct messaging, email, and social media platforms
- **Contact Form Enhancement**: Add file upload capabilities for resumes and portfolios
- **Professional Networking**: Integrate LinkedIn messaging and professional networking features
- **Academic Collaboration**: Add research collaboration request forms
- **Response Tracking**: Implement contact form submission tracking and auto-responses
- **Calendar Integration**: Add scheduling capabilities for meetings and consultations

#### **3. Workshop & Bootcamp Section Expansion**
- **Bootcamp Showcase**: Dedicated section for bootcamp completions with certificates
- **Interactive Learning Path**: Visual representation of learning journey and skill progression
- **Certification Verification**: Direct links to verify certifications and credentials
- **Skill Mapping**: Connect bootcamp learnings to specific skills and projects
- **Progress Tracking**: Show learning progress and ongoing education
- **Recommendation System**: Suggest relevant workshops and bootcamps based on interests

#### **4. Comprehensive Credential Integration**
- **Education Credentials**: Add detailed degree information, GPA, honors, and academic achievements to all education items
- **Experience Credentials**: Add company verification, role descriptions, and achievements to all experience items
- **Project Credentials**: Add detailed project descriptions, technologies used, and outcomes to all project items
- **Publication Credentials**: Add detailed publication information, citations, and impact metrics to all publication items
- **Workshop Credentials**: Add detailed workshop information, certificates, and learning outcomes to all workshop items
- **Certification Credentials**: Add detailed certification information, verification links, and validity periods to all certification items

#### **5. Speaker Workshops Section**
- **New Header Tab**: Add "Speaker Workshops" tab in the main navigation header
- **Speaker Workshop Showcase**: Dedicated section to display workshops where you have participated as a speaker
- **Workshop Details**: Include workshop title, organization, date, audience size, and presentation topics
- **Presentation Materials**: Links to slides, recordings, or additional resources from speaking engagements
- **Speaking Portfolio**: Comprehensive showcase of public speaking and presentation experience
- **Impact Metrics**: Track audience engagement, feedback, and speaking opportunities generated

### **Implementation Timeline**

#### **Phase 1: Credential Enhancement**
- [ ] Add detailed education credentials with verification
- [ ] Implement professional certification display
- [ ] Create skills assessment and credential system
- [ ] Enhance awards and recognition showcase

#### **Phase 2: Contact System Overhaul**
- [ ] Redesign contact page with modern UI/UX
- [ ] Implement multi-channel contact integration
- [ ] Add file upload and collaboration features
- [ ] Integrate calendar and scheduling system

#### **Phase 3: Workshop & Bootcamp Integration**
- [ ] Create dedicated bootcamp showcase section
- [ ] Implement interactive learning path visualization
- [ ] Add certification verification system
- [ ] Develop skill mapping and progress tracking

#### **Phase 4: Comprehensive Credential Integration**
- [ ] Add detailed credentials to all education items
- [ ] Enhance experience items with detailed credentials
- [ ] Add comprehensive project credentials and outcomes
- [ ] Implement detailed publication credentials and metrics
- [ ] Add workshop credentials and learning outcomes
- [ ] Enhance certification items with verification and validity

#### **Phase 5: Speaker Workshops Section**
- [ ] Add "Speaker Workshops" tab to main navigation header
- [ ] Create speaker workshop showcase page
- [ ] Implement workshop details and presentation materials
- [ ] Add speaking portfolio and impact metrics
- [ ] Integrate with existing workshop system
- [ ] Add responsive design for speaker workshop content

### **Technical Considerations**

#### **Credential Management**
- **Data Structure**: Design scalable data models for credentials
- **Verification System**: Implement secure verification mechanisms
- **Update Workflow**: Create easy-to-use admin interface for credential updates
- **Performance**: Optimize credential loading and display

#### **Contact System**
- **Security**: Implement secure form handling and data protection
- **Integration**: Connect with external services (email, messaging, calendar)
- **User Experience**: Ensure smooth and intuitive contact flow
- **Analytics**: Track contact form usage and success rates

#### **Workshop Integration**
- **Data Management**: Organize workshop and bootcamp data efficiently
- **Visual Design**: Create engaging visual representations of learning journey
- **Interactivity**: Implement interactive elements for better user engagement
- **Mobile Responsiveness**: Ensure optimal experience across all devices

#### **Credential Integration**
- **Data Structure**: Design comprehensive credential data models for all content types
- **Verification System**: Implement secure verification mechanisms for all credentials
- **Update Workflow**: Create easy-to-use admin interface for credential updates across all sections
- **Performance**: Optimize credential loading and display for all content items
- **Consistency**: Ensure uniform credential display across all pages and sections

#### **Speaker Workshops**
- **Navigation Integration**: Seamlessly integrate new tab into existing header navigation
- **Content Management**: Organize speaker workshop data with presentation materials
- **Media Integration**: Handle slides, recordings, and presentation resources
- **Impact Tracking**: Implement metrics and feedback collection for speaking engagements
- **Responsive Design**: Ensure optimal display across all devices and screen sizes

---

## 📄 Acknowledgements

Few icons used by the developer is created by Freepik from Flaticon

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

### Developer: Samyabrata Roy
