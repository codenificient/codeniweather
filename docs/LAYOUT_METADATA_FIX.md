# Layout Metadata Fix

## Issue

**Error**: `ReactServerComponentsError: You are attempting to export "metadata" from a component marked with "use client", which is disallowed.`

**Root Cause**: The root layout was marked as a client component (`'use client'`) but was trying to export `metadata`, which is only allowed in server components.

## Solution

### 1. Separated Server and Client Components

- **Root Layout**: Server component (can export metadata)
- **ClientLayout**: Client component (handles interactive state)

### 2. Created ClientLayout Component

- **File**: `src/components/ClientLayout.tsx`
- **Type**: Client component (`'use client'`)
- **Purpose**: Handles sidebar state and interactive layout logic
- **Benefits**: Allows root layout to remain a server component

### 3. Updated Root Layout

- **Removed**: `'use client'` directive
- **Kept**: `metadata` export (now allowed)
- **Added**: ClientLayout component for interactive functionality

## Technical Implementation

### 1. Root Layout (Server Component)

```tsx
// src/app/layout.tsx (Server Component)
import ClientLayout from "@/components/ClientLayout";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WeatherProvider } from "@/contexts/WeatherContext";

export const metadata: Metadata = {
  title: "🌤️ CodeniWeather - Your Personal Weather Companion",
  // ... other metadata
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <ThemeProvider>
          <WeatherProvider>
            <ClientLayout>{children}</ClientLayout>
          </WeatherProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 2. ClientLayout Component (Client Component)

```tsx
// src/components/ClientLayout.tsx (Client Component)
"use client";

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br...">
      {/* All interactive layout logic */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      {/* ... rest of layout */}
    </div>
  );
};
```

### 3. Component Hierarchy

```
RootLayout (Server Component)
├── ThemeProvider (Client Component)
│   └── WeatherProvider (Client Component)
│       └── ClientLayout (Client Component)
│           ├── Sidebar
│           ├── Main Content
│           └── Footer
```

## Benefits

### 1. Proper Server/Client Separation

- **Server Component**: Root layout can export metadata
- **Client Component**: Interactive logic in ClientLayout
- **Best Practices**: Follows Next.js App Router patterns

### 2. Metadata Support

- **SEO**: Proper metadata for search engines
- **Social Sharing**: Open Graph and Twitter cards
- **Performance**: Server-side metadata generation

### 3. Interactive Functionality

- **Sidebar State**: Handled in client component
- **Theme Switching**: Works correctly
- **Animations**: Framer Motion works properly

## Key Learnings

### 1. Next.js App Router Rules

- **Server Components**: Can export metadata, cannot use hooks
- **Client Components**: Can use hooks, cannot export metadata
- **Hybrid Approach**: Use both for optimal functionality

### 2. Component Architecture

- **Root Layout**: Should be server component for metadata
- **Interactive Logic**: Move to client components
- **Context Providers**: Can be client components

### 3. State Management

- **Server State**: Static data, metadata
- **Client State**: Interactive state, user interactions
- **Context**: Can bridge server and client components

## What Was Fixed

### 1. Root Layout

- **Before**: Client component with metadata export (error)
- **After**: Server component with metadata export (working)

### 2. Interactive Logic

- **Before**: Mixed in root layout
- **After**: Separated into ClientLayout component

### 3. Component Structure

- **Before**: Single complex component
- **After**: Clean separation of concerns

## Result

The layout now properly separates server and client concerns:

- **Server Component**: Handles metadata and static structure
- **Client Component**: Handles interactive functionality
- **No Errors**: Compiles successfully with proper metadata support
- **Full Functionality**: Theme switching and sidebar work correctly

This approach follows Next.js best practices and resolves the metadata export error while maintaining all interactive functionality.
