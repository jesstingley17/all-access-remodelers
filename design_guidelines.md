# All Access Remodelers - Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from professional service websites like Airbnb (for trust and approachability) and modern SaaS landing pages (for clarity and structure). The design prioritizes credibility, accessibility, and clear communication of services.

## Brand Colors (Gold & Black Theme)
- **Primary Black**: #111418 (headers, primary elements, footer)
- **Secondary Dark**: #1C1C1C / #2C2C2C (gradients, secondary backgrounds)
- **Accent Gold**: #C89B3C (CTAs, highlights, active states)
- **Body Text**: #4a4a4a (secondary text, paragraphs)
- **Supporting Colors**: White (#ffffff), Light Gray backgrounds (#fafafa)

## Typography
- **Font Family**: Inter (primary), fallback to system fonts (-apple-system, BlinkMacSystemFont, Segoe UI)
- **Hierarchy**:
  - H1 (Company Name): 2.5rem, weight 700, uppercase, letter-spacing 4px, Primary Black
  - H2 (Section Titles): 2.75rem, weight 600, letter-spacing -0.5px, Primary Black
  - H3 (Card Titles): 1.5rem, weight 600, Primary Black
  - Hero Title: 3.25rem, weight 600, White
  - Body: 1rem, weight 400, line-height 1.75, Body Text
  - Labels: 0.8rem, weight 600, uppercase, letter-spacing 3px, Accent Gold

## Layout System
**Tailwind Spacing Units**: Primarily use 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64 (e.g., p-4, p-8, py-12, py-16, py-20, py-24, py-32)
- Container: max-width 1200px, centered with px-5
- Section Padding: py-20 mobile, py-24 md, py-32 lg
- Card Spacing: p-10 to p-12
- Grid Gaps: gap-6 to gap-9

## Core Components

### Navigation
- Sticky top navigation with subtle shadow
- Links: uppercase, letter-spacing 1px, weight 500
- Active state: Accent Gold with 2px bottom border
- Hover: Color transition to Accent Gold

### Hero Section
- **Background**: Gradient from Primary Black (#111418) to Secondary Dark (#1C1C1C)
- **Overlay**: Subtle radial gradients with Accent Gold at 8-12% opacity
- **Height**: min-height 650px, vertically centered content
- **Image Strategy**: No hero image - use gradient background with geometric overlay patterns
- **Content**: Centered text with max-width 850px
- **CTAs**: Two buttons side-by-side (Primary Gold, Secondary outline white with backdrop blur)

### Logo Display
- Custom SVG logo (house with split roof, key, broom) - 240px x 180px
- Colors: Primary Black, Secondary Dark, Accent Gold
- Centered in header section with subtle drop shadow
- Company name below logo, uppercase, large tracking
- Tagline in smaller uppercase text below

### Service Cards (3-column grid)
- White background with subtle border and shadow
- 3px gold top border on hover (transform from scaleX 0 to 1)
- Image wrapper 200px height with icon overlay (80px circle, white background)
- Lift animation on hover: translateY(-8px) with increased shadow
- Bulleted lists with gold bullet points
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-9

### Contact Card
- Primary Black background with white text
- Phone/Mail icons in Accent Gold
- Centered, max-width 700px, generous padding (64px)
- Rotating radial gradient overlay (gold at 10% opacity)
- Icon + label + value layout for phone/email
- Large contact values (1.5rem) with hover lift effect

### Gallery Grid
- 6+ items in masonry-style grid
- grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Dark gray placeholder backgrounds (#2C2C2C)
- Image placeholders with overlay text on hover
- Border-radius 8px, subtle shadow

### Client Portal Section
- Accent Gold background (full-width)
- Dark text (#111418) for contrast
- Dark button with white text
- Arrow icon that translates right on hover
- Radial gradient overlays for depth

### Footer
- Primary Black background, white text
- Simple centered layout with copyright and policy links
- Links change to Accent Gold on hover

## Images
**Strategy**: Minimal image usage, focus on placeholders with graceful fallbacks
- **Hero**: NO image - use gradient background with overlays
- **Service Cards**: 200px height placeholder images (construction, property management, cleaning)
- **Gallery**: 12 placeholder images representing project types (kitchen, bathroom, living room, flooring, etc.)
- **About**: Ali's photo (circular, 192px, gold border accent)
- All images have icon fallbacks when missing

## Animations (Minimal)
- Fade-in effects on page load for logo and hero (1-1.2s duration)
- Smooth hover transitions (0.3-0.4s cubic-bezier)
- Card lift effects on hover
- Button hover states with slight translateY
- NO scroll-triggered animations or complex motion

## Accessibility
- Semantic HTML throughout
- Proper heading hierarchy
- Focus states visible for all interactive elements
- High contrast ratios maintained (white on black, black on gold)
- Alt text for all images
- ARIA labels where needed

## Key Interactions
- Smooth scroll for anchor links
- All buttons have 0.3s transitions with cubic-bezier easing
- Cards have hover states: lift + shadow increase + border color change
- Links have color transitions to Accent Gold
- Mobile: hamburger menu NOT needed (only 3 nav items, stack vertically on mobile)
