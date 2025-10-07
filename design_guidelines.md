# Amazonas Biophilic Tour Booking Platform - Design Guidelines

## Design Approach
**Reference-Based with Biophilic Principles**: Drawing inspiration from Airbnb's immersive travel experience combined with nature-first biophilic design theory. This creates an emotional connection to the Amazon rainforest through digital design.

## Core Design Principles
1. **Nature Immersion**: Every element should evoke the living, breathing Amazon ecosystem
2. **Organic Flow**: Avoid rigid grids; embrace natural, flowing layouts
3. **Visual Storytelling**: Use imagery to transport users into the rainforest experience
4. **Calm Engagement**: Design should feel restorative, not overwhelming

## Color Palette

**Primary Colors (Dark Mode)**
- Deep Forest Green: 145 40% 25% - primary backgrounds and headers
- Canopy Green: 140 50% 35% - interactive elements, CTAs
- Earth Brown: 25 35% 30% - secondary backgrounds, cards

**Primary Colors (Light Mode)**
- Soft Leaf Green: 140 45% 95% - page backgrounds
- Vibrant Jungle: 145 60% 45% - primary CTAs and accents
- Warm Earth: 25 40% 85% - card backgrounds

**Accent Colors**
- Sunset Orange: 20 75% 55% - highlights, featured tours (use sparingly)
- Water Blue: 195 65% 50% - informational elements, river/water references

**Neutrals**
- Bark Gray: 30 8% 20% (dark) / 30 8% 98% (light) - text
- Mist: 140 15% 90% - subtle borders and dividers

## Typography

**Font Families**
- Headers: 'Playfair Display' (serif) - elegant, flowing, organic feel
- Body: 'Inter' (sans-serif) - clean readability
- Accents: 'Caveat' (handwritten) - for highlights and special callouts

**Type Scale**
- Hero Headline: text-6xl to text-8xl, font-bold
- Section Headers: text-4xl to text-5xl, font-semibold
- Subsections: text-2xl to text-3xl, font-medium
- Body Text: text-base to text-lg, font-normal
- Small Text: text-sm, font-light

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 8, 12, 16, 20, and 32
- Micro spacing: p-2, gap-4
- Component spacing: p-8, m-12
- Section spacing: py-16 to py-32

**Container Strategy**
- Full-width hero sections with inner max-w-7xl
- Content sections: max-w-6xl
- Text-heavy areas: max-w-4xl

## Component Library

**Navigation**
- Floating transparent header with blur backdrop (backdrop-blur-md bg-forest/80)
- Logo with subtle leaf illustration
- Navigation items with hover underline animation (forest green)
- Search icon and user profile with rounded organic shapes

**Homepage Hero**
- Full-viewport immersive hero (min-h-screen) with Amazon rainforest canopy image
- Organic search card overlay with rounded-3xl, soft shadow, and frosted glass effect
- Search inputs with nature-inspired icons (leaf for location, calendar with vine motif)
- CTA button with canopy green background and sunset orange hover
- Floating review badges ("4.9★ Trusted by 50,000+ explorers") with subtle backdrop blur

**Tour Cards**
- Rounded-2xl cards with nature texture overlays (subtle leaf patterns)
- Image aspect ratio 4:3 with organic rounded corners
- Hover effect: subtle lift (scale-105) and enhanced shadow
- Plant motif corner accents (small illustrated leaves)
- Price display with earth-toned badge
- Difficulty indicator with organic icons (gentle leaf vs. dense jungle)

**Filtering System**
- Horizontal scroll on mobile, grid on desktop
- Nature-inspired filter chips (rounded-full with leaf/flower icons)
- Duration: Tree growth stages icons
- Difficulty: Canopy density icons
- Type: Animal silhouettes (bird, jaguar, dolphin)
- Price: Seed-to-tree growth metaphor

**Tour Detail Page**
- Hero image gallery with 60% main + 40% multi-image grid layout
- Organic flowing content sections (no rigid columns)
- Itinerary displayed as a winding river path visual
- Reviews in conversational bubble layouts (speech bubble shapes with soft corners)
- "What's Included" section with illustrated icons (backpack, binoculars, hammock)
- Booking sidebar with sticky positioning, natural card styling

**Forms & Inputs**
- Rounded-xl input fields with subtle leaf icon prefixes
- Focus state: canopy green border with gentle glow
- Date picker with Amazon-themed calendar (rainy/dry season indicators)
- Guest selector with organic +/- buttons (circular)

**Buttons**
- Primary: Rounded-xl, canopy green bg, white text, sunset orange hover
- Secondary: Rounded-xl, outline with forest green border, forest green text
- Ghost: Text only with gentle underline animation
- On hero images: outline variant with backdrop-blur-md bg-white/10

## Images

**Homepage Hero Image**
- Description: Sunlight streaming through dense Amazon canopy, lush green foliage, morning mist
- Placement: Full-screen background with darkened overlay (gradient from transparent to deep forest green)

**Tour Card Images**
- Wildlife encounters (jaguars, macaws, pink dolphins)
- River scenes (sunset on Amazon River, canoe tours)
- Cultural experiences (indigenous communities, traditional crafts)
- Adventure activities (canopy walkways, kayaking)

**Tour Detail Gallery**
- Primary: Immersive landscape shot of specific tour location
- Secondary: Day-by-day activity preview images
- Include authentic guide photos for trust

**Decorative Elements**
- Scattered botanical illustrations: monstera leaves, orchids, bromeliads
- Subtle animated elements: floating leaves, gentle water ripples
- Textured backgrounds: bark patterns, leaf veins (at 5-10% opacity)

## Animations (Minimal)
- Smooth scroll reveals for sections (fade-up)
- Hover lifts on cards (translate-y and shadow)
- Gentle parallax on hero images (slow scroll)
- Loading states: organic pulsing (like breathing)

## Accessibility & Dark Mode
- Maintain WCAG AA contrast ratios
- Dark mode uses deeper forest tones with reduced saturation
- All interactive elements have clear focus states with nature-inspired outlines
- Form inputs maintain readability in both modes with appropriate backgrounds