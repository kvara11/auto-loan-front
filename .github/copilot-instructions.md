# 🧠 Coding Rules (Next.js Project)

## ⚙️ Tech Stack
- Next.js (App Router)
- TypeScript (strict, minimal types)
- shadcn/ui components only for UI
- Tailwind CSS for styling

---

## 🎨 UI/UX Rules
- Always use **shadcn/ui components** for UI elements (Button, Card, Input, Dialog, etc.)
- No custom UI libraries unless explicitly required
- UI must be:
  - minimal
  - modern
  - clean spacing
  - readable
  - consistent design system

---

## 🧱 Component Rules
- Components must be:
  - small
  - reusable when possible
  - single responsibility
- Avoid large files (>150 lines preferred max)
- Prefer composition over complex logic

---

## 🧑‍💻 Code Style
- Use TypeScript with minimal types (avoid over-engineering)
- No unnecessary abstractions
- Keep logic inside hooks or utils when needed
- Avoid deeply nested code

---

## 📄 Page Structure
- Pages must be simple and readable
- Prefer server components unless client is required
- Keep pages as layout + composition of components only

---

## 🧩 shadcn/ui Rules
- Always import from `@/components/ui/*`
- Never recreate shadcn components manually
- Use:
  - Button
  - Input
  - Card
  - Dialog
  - DropdownMenu
  - Tabs
  when applicable

---

## 🚫 Anti-patterns (DO NOT)
- No heavy UI frameworks (MUI, Antd, etc.)
- No long single-file components
- No inline complex CSS
- No duplicated UI logic
- No unnecessary state management libraries

---

## ✨ Design Philosophy
- “Less but better”
- UI should feel like a **modern SaaS dashboard**
- White space > complexity
- Clarity > clever code







## 📱 Responsive Design

- Mobile-first approach (design starts from small screens up)
- Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`)

---

### 📐 Layout Behavior
- Sidebar:
  - Hidden on mobile by default
  - Accessible via hamburger menu (Drawer or Sheet from shadcn)
  - Always visible on desktop
- Content:
  - Use max-width containers (`max-w-7xl mx-auto`)
  - Add consistent padding (`px-4 sm:px-6 lg:px-8`)

---

### 🧱 Components
- Cards stack vertically on mobile
- Use grid with responsive columns:
  - `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Avoid fixed widths — prefer flexible layouts

---

### 🧭 Navigation
- Sidebar → becomes drawer/sheet on small screens
- Topbar → stays minimal (logo + avatar/menu)
- Dropdowns must be touch-friendly

---

### 👆 Interaction
- Buttons and clickable elements must be:
  - Minimum `h-10` height
  - Enough spacing between elements
- Avoid hover-only interactions (must work on touch)

---

### 🔤 Typography
- Use responsive text sizes:
  - `text-sm sm:text-base lg:text-lg`
- Maintain good line spacing and readability

---

### 🚫 Avoid
- Horizontal scrolling
- Overflowing elements
- Tiny clickable areas
- Complex nested layouts on mobile

---

### ✨ Goal
UI should feel:
- clean on desktop 💻
- effortless on mobile 📱
- consistent across all screen sizes

- Every UI must look good on mobile without redesigning the layout later