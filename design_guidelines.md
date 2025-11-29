# Design Guidelines: Immich Timelapse Creator

## Design Approach
**System:** Material Design with Linear-inspired refinement
**Rationale:** Utility-focused productivity tool requiring clear data visualization, form controls, and process feedback. Material Design provides robust patterns for media handling and progress states, while Linear's typography and spacing add polish.

## Core Design Principles
1. **Workflow Clarity** - Guide users through Connect → Filter → Configure → Preview → Export
2. **Visual Feedback** - Show processing states, selection counts, and progress prominently
3. **Efficient Scanning** - Information-dense layouts with clear hierarchy

## Typography
- **Headings:** Inter/SF Pro Display - Bold 600-700
  - H1: text-2xl to text-3xl
  - H2: text-xl to text-2xl
  - H3: text-lg
- **Body:** Inter/SF Pro Text - Regular 400, Medium 500
  - Base: text-sm to text-base
  - Small: text-xs
- **Monospace (for API endpoints, technical data):** JetBrains Mono - text-sm

## Layout System
**Spacing Primitives:** Use Tailwind units of **2, 4, 6, 8, 12, 16**
- Component padding: p-4 to p-6
- Section spacing: space-y-6 to space-y-8
- Card gaps: gap-4
- Max width container: max-w-7xl with px-4

## Application Structure

### Header (Sticky)
- App title + logo (left)
- Connection status indicator (Immich server connected/disconnected)
- Settings gear icon (right)

### Main Layout (Two-Column on Desktop)
**Left Sidebar (w-80, sticky):**
- Connection panel (collapsible when connected)
  - Server URL input
  - API key input (password type)
  - Connect button
- Filter controls (stacked vertical)
  - Date range picker
  - Album dropdown
  - Tags multi-select
  - Apply Filters button with photo count badge
- Timelapse parameters (stacked vertical)
  - FPS selector (segmented buttons: 10/15/24/30/60)
  - Resolution dropdown (720p/1080p/4K)
  - Format toggle (MP4/WebM)
  - Duration estimate display

**Main Content Area:**
- Photo gallery grid (grid-cols-2 md:grid-cols-4 lg:grid-cols-6)
  - Checkbox selection overlay on hover
  - Selected count badge
  - Thumbnails with aspect ratio preservation
- Preview panel (appears when timelapse generated)
  - Video player (16:9 aspect ratio)
  - Playback controls
  - Download button (primary CTA)
- Progress indicator (during processing)
  - Linear progress bar
  - Percentage + status text
  - Estimated time remaining

## Component Library

### Cards
- Border: border
- Background: bg-white with shadow-sm
- Radius: rounded-lg
- Padding: p-4 to p-6

### Form Controls
- Inputs: h-10, px-3, rounded-md, border focus:ring-2
- Dropdowns: Same as inputs with chevron icon
- Buttons: h-10, px-4, rounded-md, font-medium
  - Primary: Bold CTA for main actions
  - Secondary: Outline style for auxiliary actions

### Photo Grid
- Aspect ratio: aspect-square
- Selection indicator: Checkbox top-right corner with backdrop blur
- Hover state: Slight scale transform (scale-105)

### Video Preview
- Container: aspect-video with rounded-lg overflow
- Controls: Built-in browser controls initially
- Backdrop: bg-black for letterboxing

### Progress Components
- Linear bar: h-2, rounded-full, animated progress
- Status text: text-sm, text-center, mt-2
- Spinner: For indeterminate states

### Status Indicators
- Connected: Green dot + "Connected to [server]"
- Processing: Yellow dot + "Processing..."
- Error: Red dot + error message

## Interaction Patterns
- **Photo Selection:** Click photo to toggle, checkbox appears on hover
- **Batch Actions:** Select all/none buttons above grid
- **Parameter Changes:** Auto-update duration estimate
- **Processing:** Disable all controls, show progress overlay
- **Preview Ready:** Smooth transition to preview panel, auto-scroll into view

## Images
No decorative images needed - this is a functional tool. All images are user-generated photo thumbnails from Immich.

## Animations
Minimal, performance-focused:
- Photo hover scale: transition-transform duration-200
- Progress bar fill: smooth animation
- Panel transitions: Simple fade/slide (duration-300)
- NO complex scroll animations or decorative effects

## Mobile Adaptations
- Single column layout (stack sidebar above content)
- Collapse filter/parameter panels into accordions
- Grid reduces to grid-cols-2
- Sticky header with hamburger menu for controls