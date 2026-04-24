/* globals.css - Complete styling system */

@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100..900;1,100..900&family=Lora:ital,wght@0,400..700;1,400..700&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* Light Theme Variables */
  :root {
    /* Backgrounds */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    
    /* UI Elements */
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    
    /* Borders & Rings */
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    
    /* Domain-Specific Colors */
    --profit: 142.1 76.2% 36.3%;
    --profit-foreground: 355.7 100% 97.3%;
    --loss: 0 84.2% 60.2%;
    --loss-foreground: 210 40% 98%;
    --warning: 38 92% 50%;
    --warning-foreground: 210 40% 98%;
    --signal: 271.5 81.3% 55.9%;
    --signal-foreground: 210 40% 98%;
    --even: 210 40% 96.1%;
    --even-foreground: 222.2 47.4% 11.2%;
    --odd: 0 0% 100%;
    --odd-foreground: 222.2 47.4% 11.2%;
    
    /* Sidebar */
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 221.2 83.2% 53.3%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 221.2 83.2% 53.3%;
    
    /* Shadows System */
    --shadow-2xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-xs: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
    
    /* Radius */
    --radius: 0.5rem;
    
    /* Layout */
    --container-padding: 2rem;
    --header-height: 4rem;
    --sidebar-width: 16rem;
  }

  /* Dark Theme Variables */
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
    
    --profit: 142.1 70.6% 45.3%;
    --profit-foreground: 144.9 80.4% 10%;
    --loss: 0 72.2% 50.6%;
    --loss-foreground: 210 40% 98%;
    --warning: 38 92% 50%;
    --warning-foreground: 222.2 47.4% 11.2%;
    --signal: 271.5 81.3% 55.9%;
    --signal-foreground: 210 40% 98%;
    --even: 217.2 32.6% 17.5%;
    --even-foreground: 210 40% 98%;
    --odd: 222.2 84% 4.9%;
    --odd-foreground: 210 40% 98%;
    
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
    
    /* Dark mode shadows */
    --shadow-2xs: 0 1px 2px 0 rgb(0 0 0 / 0.3);
    --shadow-xs: 0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3);
    --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3);
  }

  /* Base Elements */
  * {
    @apply border-border;
  }

  html {
    @apply scroll-smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }

  /* Selection Styling */
  ::selection {
    @apply bg-primary/20 text-primary;
  }

  /* Focus Visible */
  *:focus-visible {
    @apply outline-none ring-2 ring-ring ring-offset-2 ring-offset-background;
  }

  /* Scrollbar Styling */
  ::-webkit-scrollbar {
    @apply w-2 h-2;
  }

  ::-webkit-scrollbar-track {
    @apply bg-muted rounded-full;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-muted-foreground/30 rounded-full hover:bg-muted-foreground/50 transition-colors;
  }
}

@layer components {
  /* Container Component */
  .container-custom {
    @apply container mx-auto px-4 md:px-6 lg:px-8;
    max-width: var(--container-max-width, 1400px);
  }

  /* Card Components */
  .card-hover {
    @apply transition-all duration-300 hover:shadow-lg hover:-translate-y-1;
  }

  .card-glass {
    @apply bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10;
  }

  /* Button Variants */
  .btn-primary {
    @apply bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-secondary {
    @apply bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg transition-all duration-200;
  }

  .btn-ghost {
    @apply hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-lg transition-all duration-200;
  }

  .btn-outline {
    @apply border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-lg transition-all duration-200;
  }

  /* Badge Styles */
  .badge {
    @apply inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors;
  }

  .badge-success {
    @apply bg-profit/10 text-profit border border-profit/20;
  }

  .badge-error {
    @apply bg-loss/10 text-loss border border-loss/20;
  }

  .badge-warning {
    @apply bg-warning/10 text-warning border border-warning/20;
  }

  /* Profit/Loss Indicators */
  .trend-up {
    @apply text-profit font-semibold;
  }

  .trend-down {
    @apply text-loss font-semibold;
  }

  /* Table Row Striping */
  .table-row-even {
    @apply bg-even even:bg-even odd:bg-odd;
  }

  /* Signal Badge */
  .signal-pulse {
    @apply relative inline-flex;
  }

  .signal-pulse::before {
    content: '';
    @apply absolute inset-0 rounded-full bg-signal animate-pulse-glow;
  }

  /* Form Elements */
  .form-input {
    @apply flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;
  }

  .form-label {
    @apply text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70;
  }

  /* Sidebar Navigation */
  .sidebar-link {
    @apply flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-sidebar-accent;
  }

  .sidebar-link-active {
    @apply bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground;
  }

  /* Animation Classes */
  .animate-on-scroll {
    @apply opacity-0 translate-y-4 transition-all duration-700;
  }

  .animate-on-scroll.visible {
    @apply opacity-100 translate-y-0;
  }

  /* Skeleton Loading */
  .skeleton {
    @apply animate-pulse bg-muted rounded-md;
  }

  /* Divider */
  .divider {
    @apply h-px bg-gradient-to-r from-transparent via-border to-transparent my-4;
  }

  /* Tooltip */
  .tooltip {
    @apply invisible absolute z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100;
  }

  /* Keyboard Shortcut */
  .kbd {
    @apply inline-flex items-center justify-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-mono font-medium;
  }

  /* Loading Spinner */
  .spinner {
    @apply inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent;
  }

  /* Progress Bar */
  .progress-bar {
    @apply relative h-2 w-full overflow-hidden rounded-full bg-secondary;
  }

  .progress-bar-fill {
    @apply h-full bg-primary transition-all duration-300 ease-in-out;
  }

  /* Toast/Alert */
  .toast {
    @apply fixed bottom-4 right-4 z-50 transform rounded-lg bg-background px-4 py-3 shadow-lg transition-all duration-300;
  }

  .toast-show {
    @apply translate-x-0 opacity-100;
  }

  .toast-hide {
    @apply translate-x-full opacity-0;
  }
}

@layer utilities {
  /* Custom Text Gradients */
  .text-gradient {
    @apply bg-gradient-to-r from-primary to-signal bg-clip-text text-transparent;
  }

  /* Glassmorphism */
  .glass {
    @apply bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10;
  }

  /* Hide Scrollbar */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  /* Text Truncation */
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Animation Delays */
  .delay-100 {
    animation-delay: 100ms;
  }
  .delay-200 {
    animation-delay: 200ms;
  }
  .delay-300 {
    animation-delay: 300ms;
  }
  .delay-500 {
    animation-delay: 500ms;
  }
  .delay-700 {
    animation-delay: 700ms;
  }
  .delay-1000 {
    animation-delay: 1000ms;
  }

  /* Custom Widths */
  .sidebar-width {
    width: var(--sidebar-width);
  }
  
  /* Responsive Typography */
  .text-balance {
    text-wrap: balance;
  }
  
  /* Focus Ring Custom */
  .focus-ring {
    @apply focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background;
  }
}

/* Print Styles */
@media print {
  .no-print {
    display: none !important;
  }
  
  body {
    @apply bg-white text-black;
  }
  
  a {
    @apply no-underline;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Responsive Breakpoints */
@screen sm {
  .container-custom {
    @apply px-6;
  }
}

@screen md {
  .container-custom {
    @apply px-8;
  }
}

@screen lg {
  .container-custom {
    @apply px-12;
  }
}

/* Dark Mode Transition */
.dark-transition {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

/* Custom Modal/Dialog Backdrop */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

.backdrop-blur-md {
  backdrop-filter: blur(8px);
}

.backdrop-blur-lg {
  backdrop-filter: blur(16px);
}

/* Active State Indicators */
.active-indicator {
  @apply relative;
}

.active-indicator::after {
  content: '';
  @apply absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full;
}

/* Hover Lift Effect */
.hover-lift {
  @apply transition-transform duration-200 hover:-translate-y-1;
}

/* Gradient Borders */
.gradient-border {
  position: relative;
  background: linear-gradient(var(--background), var(--background)) padding-box,
              linear-gradient(to right, var(--primary), var(--signal)) border-box;
  border: 1px solid transparent;
}
