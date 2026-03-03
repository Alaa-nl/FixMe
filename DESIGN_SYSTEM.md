# FixMe Design System

Quick reference guide for maintaining the distinctive design across the application.

## Typography

### Font Classes

```tsx
// Headings - Use Syne font
<h1 className="font-[family-name:var(--font-syne)] text-6xl font-bold">
<h2 className="font-[family-name:var(--font-syne)] text-4xl font-bold">
<h3 className="font-[family-name:var(--font-syne)] text-2xl font-bold">

// Large numbers/stats
<div className="font-[family-name:var(--font-syne)] text-4xl font-bold">

// Body text - Default (DM Sans)
<p className="text-base">  // No font class needed
```

### Scale
- **6xl**: Hero headings (56px+)
- **4xl**: Page titles (36px+)
- **3xl**: Section headings (30px)
- **2xl**: Card titles (24px)
- **xl**: Subheadings (20px)
- **lg**: Large body (18px)
- **base**: Body text (16px)
- **sm**: Small text (14px)
- **xs**: Labels (12px)

### Weights
- **400**: Regular (body text)
- **500**: Medium (emphasis)
- **600**: Semibold (Syne only)
- **700**: Bold (headings)
- **800**: Extrabold (Syne only, major headings)

## Color System

### Primary Colors
```tsx
// Warm Amber/Orange - Main actions, links, stats
className="text-primary"           // Text
className="bg-primary"             // Background
className="border-primary"         // Border
className="hover:text-primary"     // Hover states
```

### Secondary Colors
```tsx
// Deep Teal - Alternative actions, accents
className="text-secondary"
className="bg-secondary"
className="border-secondary"
```

### Status Colors
```tsx
className="text-destructive"  // Errors, disputes, critical
className="text-muted"         // Disabled, inactive
className="text-muted-foreground"  // Supporting text
```

### Opacity Variations
```tsx
className="bg-primary/10"    // 10% opacity - subtle backgrounds
className="bg-primary/20"    // 20% opacity - stat card gradients
className="bg-primary/50"    // 50% opacity - hover borders
className="text-primary/70"  // 70% opacity - muted text
```

## Components

### Cards

#### Basic Card
```tsx
<Card className="border-2">
  <CardContent className="p-6">
    {/* Content */}
  </CardContent>
</Card>
```

#### Interactive Card
```tsx
<Card className="border-2 hover:border-primary/50 hover:shadow-xl
               transition-all duration-300 hover:-translate-y-1 group">
  <CardContent className="p-6">
    {/* Content */}
  </CardContent>
</Card>
```

#### Glass Morphism Card (for stats)
```tsx
<Card className="relative overflow-hidden border-2 hover:border-primary/50
               transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
  {/* Gradient background */}
  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5
                  opacity-50 group-hover:opacity-70 transition-opacity" />

  <CardContent className="p-6 relative">
    {/* Frosted icon container */}
    <div className="p-3 rounded-xl bg-background/80 backdrop-blur-sm">
      <Icon className="w-6 h-6 text-primary" />
    </div>

    {/* Large stat number */}
    <div className="font-[family-name:var(--font-syne)] text-4xl font-bold">
      {value}
    </div>
  </CardContent>
</Card>
```

### Badges

```tsx
// Status badges with variants
<Badge variant="default">Open</Badge>
<Badge variant="secondary">In Progress</Badge>
<Badge variant="outline">Completed</Badge>
<Badge variant="destructive">Disputed</Badge>
```

### Buttons

```tsx
// Using existing Button component
<Button variant="primary" size="lg">
  Primary Action
</Button>

// With icon and animation
<Button variant="primary" className="group">
  Continue
  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
</Button>
```

### Avatars

```tsx
<Avatar className="w-14 h-14 ring-2 ring-background group-hover:ring-primary/50 transition-all">
  <AvatarImage src={url} alt={name} />
  <AvatarFallback className="bg-secondary text-secondary-foreground font-bold">
    {initials}
  </AvatarFallback>
</Avatar>
```

### Icons

```tsx
import { Icon } from "lucide-react";

// Standard size
<Icon className="w-5 h-5 text-primary" />

// With animation
<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
<TrendingUp className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
```

## Animations

### Hover Effects

#### Card Lift
```tsx
className="hover:-translate-y-1 transition-all duration-300"
```

#### Image Zoom
```tsx
className="group-hover:scale-110 transition-transform duration-500"
```

#### Border Glow
```tsx
className="border-2 hover:border-primary/50 transition-all"
```

#### Icon Slide
```tsx
className="group-hover:translate-x-1 transition-transform"
```

#### Opacity Fade
```tsx
className="opacity-0 group-hover:opacity-100 transition-opacity"
```

### Page Transitions

```tsx
// Fade in on mount
<div className="animate-in fade-in duration-700">

// With delay (for staggered items)
<div className="animate-in fade-in duration-500" style={{ animationDelay: '100ms' }}>
```

## Atmospheric Effects

### Blurred Gradient Background
```tsx
<div className="relative">
  <div className="absolute inset-0 bg-gradient-to-br from-primary/10
                  via-transparent to-secondary/10 rounded-3xl blur-3xl -z-10" />
  {/* Content */}
</div>
```

### Text Gradient
```tsx
<h1 className="bg-gradient-to-br from-foreground to-foreground/70
               bg-clip-text text-transparent">
  Gradient Text
</h1>
```

### Glass Morphism Layer
```tsx
<div className="bg-background/80 backdrop-blur-sm">
  {/* Frosted glass effect */}
</div>
```

### Gradient Overlay (on hover)
```tsx
<div className="relative group">
  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity" />
  {/* Content */}
</div>
```

## Layout

### Container
```tsx
<div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
```

### Sections
```tsx
<div className="space-y-10">  // Large vertical spacing
  <section className="space-y-6">  // Section internal spacing
```

### Grid Layouts
```tsx
// Stats grid
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">

// Content grid
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
```

## Loading States

### Skeleton
```tsx
<Skeleton className="h-40 w-full" />
<Skeleton className="h-16 w-3/4" />
<Skeleton className="h-8 w-1/2" />
```

### Loading Grid
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
  {[1, 2, 3, 4].map((i) => (
    <Skeleton key={i} className="h-40" />
  ))}
</div>
```

## Patterns

### Section Header
```tsx
<div className="flex items-center justify-between">
  <h2 className="font-[family-name:var(--font-syne)] text-3xl md:text-4xl font-bold tracking-tight">
    Section Title
  </h2>
  <Link href="/view-all"
        className="text-sm font-medium text-primary hover:underline
                   flex items-center gap-1 group">
    View all
    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
  </Link>
</div>
```

### Empty State
```tsx
<Card className="border-2 border-dashed">
  <CardContent className="flex flex-col items-center justify-center py-16">
    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
      <Icon className="w-10 h-10 text-primary" />
    </div>
    <h3 className="font-[family-name:var(--font-syne)] text-2xl font-bold mb-2">
      No items yet
    </h3>
    <p className="text-muted-foreground mb-6 text-center max-w-md">
      Description text
    </p>
    <Button variant="primary" size="lg">
      Call to Action
    </Button>
  </CardContent>
</Card>
```

### Stat Card
```tsx
<Card className="relative overflow-hidden border-2 hover:border-primary/50
               transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5
                  opacity-50 group-hover:opacity-70 transition-opacity" />

  <CardContent className="p-6 relative">
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 rounded-xl bg-background/80 backdrop-blur-sm">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <TrendingUp className="w-4 h-4 text-muted-foreground
                             opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>

    <div className="space-y-1">
      <div className="font-[family-name:var(--font-syne)] text-4xl font-bold">
        {value}
      </div>
      <div className="text-sm font-medium text-muted-foreground">
        {label}
      </div>
      <div className="text-xs text-muted-foreground/70 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {trend}
      </div>
    </div>
  </CardContent>
</Card>
```

## Color Gradients Library

### Background Gradients
```tsx
// Warm atmospheric (body default)
bg: linear-gradient(135deg, #FEF3E2 0%, #FFFBF5 50%, #FFF7ED 100%)

// Primary glow
from-primary/10 via-transparent to-secondary/10

// Card accents
from-primary/20 to-primary/5
from-secondary/20 to-secondary/5
from-accent/20 to-accent/5
```

### Text Gradients
```tsx
from-foreground to-foreground/70     // Subtle heading gradient
from-primary to-secondary            // Colorful accent
```

## Spacing Scale

```
space-y-2  → 0.5rem  (8px)  - Tight spacing
space-y-4  → 1rem    (16px) - Default spacing
space-y-6  → 1.5rem  (24px) - Section spacing
space-y-8  → 2rem    (32px) - Large spacing
space-y-10 → 2.5rem  (40px) - Page sections
```

## Border Radius

```
rounded-lg    → 0.75rem  (12px)  - Default cards
rounded-xl    → 1rem     (16px)  - Large cards
rounded-2xl   → 1.5rem   (24px)  - Feature cards
rounded-3xl   → 2rem     (32px)  - Atmospheric effects
rounded-full  → 9999px           - Pills, avatars
```

## Shadow Scale

```
shadow-md  - Default card shadow
shadow-lg  - Elevated elements
shadow-xl  - Hover state, modals
shadow-2xl - Hero elements
```

## Responsive Breakpoints

```tsx
// Mobile first approach
className="text-base md:text-lg lg:text-xl"
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
className="p-4 md:p-6 lg:p-8"

// Tailwind breakpoints
sm: 640px   // Small tablets
md: 768px   // Tablets
lg: 1024px  // Laptops
xl: 1280px  // Desktops
2xl: 1536px // Large desktops
```

## Best Practices

### DO ✅
- Use Syne font for all headings and numbers
- Apply hover effects to interactive elements
- Use atmospheric backgrounds for hero sections
- Maintain consistent spacing (space-y-6, space-y-10)
- Add loading skeletons for better UX
- Use Lucide icons instead of emojis
- Layer effects (gradients + shadows + transforms)

### DON'T ❌
- Mix Inter or Arial fonts
- Use flat white backgrounds without gradients
- Apply purple gradients on white (generic AI aesthetic)
- Forget hover states on clickable elements
- Use emojis for functional icons
- Create layouts without hierarchy
- Over-animate (keep it tasteful)

## Code Templates

### New Page Template
```tsx
export default function PageName() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Hero section with atmospheric background */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10
                        via-transparent to-secondary/10 rounded-3xl blur-3xl -z-10" />
        <h1 className="font-[family-name:var(--font-syne)] text-4xl md:text-6xl
                       font-bold tracking-tight">
          Page Title
        </h1>
        <p className="text-lg text-muted-foreground font-medium">
          Subtitle or description
        </p>
      </div>

      {/* Content sections */}
      <div className="space-y-6">
        {/* Section content */}
      </div>
    </div>
  );
}
```

### New Component Template
```tsx
interface ComponentProps {
  // Props
}

export default function ComponentName({ }: ComponentProps) {
  return (
    <Card className="border-2 hover:border-primary/50 hover:shadow-xl
                     transition-all duration-300 hover:-translate-y-1 group">
      <CardContent className="p-6">
        <h3 className="font-[family-name:var(--font-syne)] text-xl font-bold">
          Component Title
        </h3>
        {/* Component content */}
      </CardContent>
    </Card>
  );
}
```

## Quick Reference Cheat Sheet

```tsx
// Headings
font-[family-name:var(--font-syne)] text-4xl font-bold

// Interactive Cards
border-2 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group

// Stat Numbers
font-[family-name:var(--font-syne)] text-4xl font-bold

// Icon with Animation
<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />

// Atmospheric Glow
<div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 rounded-3xl blur-3xl -z-10" />

// Glass Effect
bg-background/80 backdrop-blur-sm

// Image Zoom
group-hover:scale-110 transition-transform duration-500
```

---

**Maintained by**: FixMe Design Team
**Last updated**: 2026-03-03
**Version**: 1.0.0
