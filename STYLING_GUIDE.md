# Styling Guide: Tailwind CSS & Shadcn/ui

This project uses **Tailwind CSS** for styling and **shadcn/ui** for component patterns. This guide explains how to add your own styles following the established practices.

## 1. The "Utility-First" Workflow
In this project, **we do not write separate `.css` files** for components. Instead, we apply styles directly to JSX elements using Tailwind's utility classes.

**❌ Avoid:**
```css
/* Button.css */
.my-button {
  background-color: blue;
  padding: 10px 20px;
  border-radius: 5px;
}
```

**✅ Do:**
```jsx
// Button.jsx
<button className="bg-blue-500 px-5 py-2.5 rounded-md text-white hover:bg-blue-600">
  Click Me
</button>
```

## 2. Common Patterns

### Layout (Flexbox)
- `flex`: Enables flexbox.
- `flex-col`: Stacks items vertically.
- `items-center`: Centers items vertically (cross-axis).
- `justify-between`: Spreads items apart (main-axis).
- `gap-4`: Adds 1rem (16px) gap between items.

### Spacing
- `p-4`: Padding of 1rem on all sides.
- `px-4`: Horizontal padding (left/right).
- `py-2`: Vertical padding (top/bottom).
- `m-4`, `mt-4`, `mx-auto`: Margins.

### Responsive Design
Use prefixes to apply styles only at certain breakpoints. The style applies to that breakpoint **and larger**.
- `md:flex-row`: On medium screens and up, use flex-row.
- `lg:p-8`: On large screens and up, use padding 2rem.

```jsx
// Stacks vertically on mobile, side-by-side on desktop
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/2">Left</div>
  <div className="w-full md:w-1/2">Right</div>
</div>
```

## 3. Customizing Colors & Theme
We use CSS variables in `src/index.css` mapped to Tailwind config.

### Step 1: Define the Variable
Open `src/index.css` and add your color to the `:root` (light mode) and `.dark` (dark mode) blocks. We use HSL values (Hue Saturation Lightness) **without** the `hsl()` wrapper.

```css
/* src/index.css */
:root {
  /* ... existing vars ... */
  --my-custom-color: 200 50% 50%; /* A nice blue */
}

.dark {
  --my-custom-color: 200 50% 30%; /* Darker blue for dark mode */
}
```

### Step 2: Add to Tailwind Config
Open `tailwind.config.js` and extend the theme.

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Now you can use 'bg-brand' or 'text-brand'
        brand: "hsl(var(--my-custom-color))", 
      },
    },
  },
}
```

### Step 3: Use It
```jsx
<div className="bg-brand text-white">
  Custom Brand Color
</div>
```

## 4. Arbitrary Values
If you need a specific pixel value that isn't in the theme, use square brackets `[]`.

```jsx
<div className="w-[350px] top-[15%] z-[100]">
  Specific width and positioning
</div>
```

## 5. Conditional Styling (`cn` helper)
For reusable components where you want to merge default styles with props, use the `cn` utility (imported from `@/lib/utils`).

```jsx
import { cn } from "@/lib/utils";

function Card({ className, children }) {
  return (
    <div className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}>
      {children}
    </div>
  );
}

// Usage: The 'p-8' here will merge with the default styles
<Card className="p-8 border-red-500">Content</Card>
```
