# Portfolio Website - Static S3 Version

A modern, responsive portfolio website built with TypeScript and Vite, deployed to AWS S3. This is a complete rewrite of the original Flask application as a static site for improved performance and reduced maintenance overhead.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- AWS account with S3 and CloudFront (for deployment)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd personalWebsite_AWS

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🛠️ Tech Stack

### Frontend
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and dev server
- **Bootstrap 5** - Responsive CSS framework
- **AOS** - Animate On Scroll library
- **Particles.js** - Background particle effects

### Deployment
- **AWS S3** - Static file hosting
- **AWS CloudFront** - CDN distribution
- **GitHub Actions** - Automated CI/CD

## 📁 Project Structure

```
portfolio-static/
├── index.html                    # Main landing page
├── pages/                        # Additional HTML pages
│   ├── about.html
│   └── ...
├── src/                          # Source code
│   ├── components/                # TypeScript components
│   │   ├── BackgroundEffects.ts
│   │   └── ProjectGrid.ts
│   ├── utils/                     # Utility modules
│   │   ├── theme.ts
│   │   ├── analytics.ts
│   │   └── journey.ts
│   ├── styles/                    # CSS styles
│   │   ├── main.css
│   │   └── components/
│   ├── types/                     # TypeScript definitions
│   │   └── index.ts
│   └── main.ts                    # Application entry point
├── assets/                        # Static assets
│   ├── data/
│   │   └── projects.json         # Project metadata
│   └── images/
├── dist/                          # Build output
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## ✨ Features

### Core Functionality
- ✅ Responsive design with mobile-first approach
- ✅ Light/dark theme switching with localStorage persistence
- ✅ Project showcase with filtering system
- ✅ Smooth animations and micro-interactions
- ✅ SEO optimization with meta tags and structured data
- ✅ Performance optimized with lazy loading

### Interactive Features
- ✅ Background particle effects
- ✅ Achievement system with unlock notifications
- ✅ User journey tracking and progress visualization
- ✅ Analytics tracking (client-side)
- ✅ Scroll depth tracking
- ✅ Theme customization

### Projects Showcase
- ✅ 10+ featured projects with metadata
- ✅ Interactive project filtering by tags
- ✅ Project cards with hover effects
- ✅ Technology stack display
- ✅ Status indicators (In Progress, Interactive)

## 🎨 Theme System

The site features a comprehensive theming system:

```typescript
// Theme switching
setTheme('dark');   // Dark mode
setTheme('light');  // Light mode

// Theme persistence handled automatically
```

**CSS Variables:**
- Light and dark color schemes
- Consistent spacing and typography
- Smooth transitions between themes

## 📊 Analytics

Built-in client-side analytics tracking:
- Page views and session tracking
- Scroll depth metrics
- Time on page measurement
- User interaction tracking
- Achievement unlock events

**Data Storage:**
- LocalStorage for session persistence
- No external dependencies for basic analytics
- Easy integration with Google Analytics or similar

## 🏆 Achievement System

8 achievements to unlock:
1. **Project Explorer** - View first project
2. **Theme Master** - Switch themes
3. **Filter Expert** - Use project filters
4. **Page Navigator** - Visit 3 pages
5. **Deep Diver** - Scroll to bottom
6. **Interactive User** - Visit interactive project
7. **Night Owl** - Use after 10 PM
8. **Early Bird** - Use before 6 AM

## 🚀 Deployment

### AWS Setup

1. **Create S3 Bucket:**
   ```bash
   aws s3 mb s3://your-portfolio-bucket
   aws s3 website s3://your-portfolio-bucket --index-document index.html
   ```

2. **Configure Bucket Policy:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-portfolio-bucket/*"
       }
     ]
   }
   ```

3. **Set up CloudFront Distribution:**
   - Origin: S3 bucket
   - Viewer Protocol Policy: Redirect to HTTPS
   - Cache Policy: Managed-CachingOptimized

### GitHub Actions

Configure secrets in GitHub:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME`
- `CLOUDFRONT_DISTRIBUTION_ID`

## 🛠️ Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
```

### Component Development

**Adding a new component:**
1. Create component in `src/components/`
2. Add styles in `src/styles/components/`
3. Import and use in `src/main.ts`
4. Add TypeScript types in `src/types/`

**Adding a new page:**
1. Create HTML file in `pages/`
2. Update `vite.config.ts` for new entry point
3. Add navigation link to header

## 📈 Performance

### Optimization Features
- **Code Splitting:** Automatic with Vite
- **Lazy Loading:** Images and components
- **Tree Shaking:** Unused code elimination
- **Minification:** CSS and JS compression
- **Caching:** CloudFront edge caching

### Core Web Vitals
- LCP (Largest Contentful Paint): < 1.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

## 🔧 Configuration

### Vite Configuration
- TypeScript support
- Path aliases (`@/`, `@/components/`, etc.)
- Build optimization
- Development server setup

### TypeScript Configuration
- Strict type checking
- ES2020 target
- Module resolution
- Path mapping

## 📱 Responsive Design

- **Desktop:** 1200px+
- **Tablet:** 768px - 1199px
- **Mobile:** < 768px
- **Touch-friendly:** Mobile-first approach

## 🔒 Security

- **HTTPS Only:** CloudFront SSL termination
- **Security Headers:** CSP, XSS protection
- **No Server-side Dependencies:** Static hosting only
- **Input Validation:** Form sanitization

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Migration Notes

This is a complete rewrite from the Flask application. Key changes:

### What Changed
- Flask → Static HTML/TypeScript
- Server-side rendering → Client-side rendering
- Server analytics → Client-side analytics
- Dynamic routes → Static pages
- Database storage → LocalStorage

### What Was Preserved
- All project content and metadata
- Visual design and user experience
- Interactive features
- Analytics tracking (adapted)
- Achievement system
- Theme switching

### What Was Enhanced
- Performance (2-3x faster load times)
- SEO (better static rendering)
- Maintenance (no server required)
- Scalability (CDN distribution)
- Security (static hosting only)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

© 2025 Jack Van Zeeland. All rights reserved.

---

**Built with ❤️ using TypeScript, Vite, and AWS**