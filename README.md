# FutureReady - AI Career OS Dashboard

A production-ready, dark futuristic dashboard built with Next.js 15, Tailwind CSS, and shadcn/ui. Designed as an AI-powered career companion with sophisticated visualizations, analytics, and career planning tools.

## Features

✨ **Complete Dashboard Implementation**
- Responsive sidebar navigation with 8 main sections
- Dynamic header with search, notifications, and system status
- Welcome hero section with career readiness gauge
- Advanced dashboard cards with neural network visualization
- Career roadmap timeline with 6 milestone stages
- Opportunity engine with 6 personalized opportunities
- Analytics & Growth section with charts

🎨 **Design System**
- Dark futuristic theme with slate and cyan color palette
- Modern gradients and glassmorphism effects
- Responsive grid layouts
- Smooth transitions and hover effects
- Professional spacing and typography

📱 **Responsive Design**
- Mobile-first approach
- Hamburger menu for mobile navigation
- Optimized layouts for all screen sizes
- Adaptive header with hidden elements on mobile

📊 **Visualizations**
- Neural network skill diagrams
- Radar charts for multi-dimensional analysis
- Career readiness circular progress gauge
- Trend line charts with Recharts
- Progress bars with gradient fills
- Career roadmap timeline with status indicators

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts
- **TypeScript**: Full type safety
- **Analytics**: Vercel Analytics

## Project Structure

```
components/
├── sidebar.tsx           # Navigation sidebar with logo
├── header.tsx            # Top header with search & notifications
├── responsive-layout.tsx # Mobile-responsive wrapper
├── welcome-hero.tsx      # Welcome section & career readiness
├── dashboard-cards.tsx   # 3 main cards (Twin, Radar, Simulation)
├── career-roadmap.tsx    # Timeline roadmap visualization
├── opportunity-engine.tsx # 6 opportunity cards grid
└── analytics-section.tsx # Charts & analytics

app/
├── page.tsx              # Main dashboard page
├── layout.tsx            # Root layout with dark theme
└── globals.css           # Global styles & theme config
```

## Getting Started

### Installation

1. **Clone & Install Dependencies**
```bash
git clone <repo-url>
cd v0-project
pnpm install
```

2. **Run Development Server**
```bash
pnpm dev
```

3. **Open in Browser**
- Desktop: `http://localhost:3000`
- Mobile: Test with device emulation or use `set viewport 375 812`

### Available Scripts

```bash
pnpm dev      # Start dev server
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## Key Components

### Sidebar Navigation
- 8 navigation items with active state indicator
- User profile section with settings
- Responsive collapse on mobile with overlay

### Welcome Hero
- Personalized greeting with career readiness score
- Career stats: Target role, Current year, Streak
- Action buttons: Explore Dashboard, Ask AI Mentor

### Dashboard Cards (3-Column Grid)
1. **Career Twin** - Neural network skill visualization
2. **Career Radar** - Multi-dimensional skill analysis
3. **Future Simulation** - Career path projections

### Career Roadmap
- 6 milestone stages (1st Year → Placement Dream Job)
- Status indicators: Completed, Current, Upcoming
- Horizontal scrollable timeline
- Connected progress line

### Opportunity Engine
- 6 personalized opportunities with:
  - Match percentage with color-coded tags
  - Deadline information
  - Progress bar visualization
  - Apply buttons with external link icon

### Analytics & Growth
- **Readiness Trend**: Line chart showing career readiness over 6 months
- **Career Momentum**: Progress bars for Projects, GitHub, Interviews, Learning
- **Skill Growth**: Bar chart showing skill proficiency (DSA, Dev, AI, Cloud)

## Color Palette

| Color | Usage | Values |
|-------|-------|--------|
| Primary | Cyan/Blue accents | `#06b6d4`, `#0ea5e9` |
| Background | Dark slate | `#0f172a` |
| Card | Slightly lighter | `#1e293b` |
| Border | Subtle dividers | `#334155` |
| Text | Light text | `#e2e8f0` |
| Success | Green elements | `#10b981` |
| Warning | Amber elements | `#f59e0b` |
| Danger | Red elements | `#ef4444` |

## Responsive Breakpoints

- **Mobile**: Full-width with hamburger menu (< 768px)
- **Tablet**: Sidebar visible, adjusted padding (768px - 1024px)
- **Desktop**: Full layout with all features (> 1024px)

## Performance Optimizations

- Client components use `'use client'` directive where needed
- Server components for static content
- Optimized re-renders with state management
- Lazy-loaded charts with Recharts
- CSS classes optimized with Tailwind
- No unnecessary animations on mobile

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Mobile

## Deployment

### Vercel (Recommended)
```bash
# Connect GitHub repo to Vercel dashboard
# Auto-deploys on push to main branch
vercel deploy
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
CMD ["pnpm", "start"]
```

## Development Notes

### Adding New Features

1. **New Navigation Item**
   - Add to `navItems` array in `sidebar.tsx`
   - Update styling as needed

2. **New Dashboard Card**
   - Create component in `components/`
   - Import in `page.tsx`
   - Add to main layout

3. **New Analytics Chart**
   - Use Recharts components
   - Add data array above chart
   - Import in `analytics-section.tsx`

### Customization

**Theme Colors**
- Edit color values in `globals.css`
- Update Tailwind color classes throughout
- Use CSS custom properties for consistency

**Typography**
- Modify font imports in `layout.tsx`
- Adjust sizes in individual components
- Use Tailwind text utilities

**Spacing**
- Leverage Tailwind spacing scale (p-4, gap-6, etc.)
- Maintain consistency with existing patterns
- Use responsive prefixes (md:, lg:)

## Known Limitations

- Charts are static (not connected to real data)
- Navigation links are placeholder hrefs (#)
- Sidebar navigation currently shows single active state
- Mobile menu doesn't persist across page loads

## Future Enhancements

- Real data integration with API
- Interactive chart interactions
- Dark/light mode toggle
- Customizable dashboard widgets
- Real-time notifications
- AI mentor chatbot integration
- User profile settings page
- Export analytics to PDF

## License

MIT License - Feel free to use this dashboard in your projects.

## Credits

Built with ❤️ using:
- Next.js 15
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- Recharts

---

**Version**: 1.0.0  
**Last Updated**: June 2026  
**Status**: Production Ready ✅
