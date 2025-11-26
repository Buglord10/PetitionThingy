# UK Government Petitions Dashboard - Design Guidelines

## Design Approach
**Reference-Based Approach**: Direct inspiration from UK Government Digital Service (GDS) Design System and BBC News live updates. This is a utility-focused, government-standard application prioritizing accessibility, clarity, and authoritative presentation.

## Color Palette
- **Primary**: #1D70B8 (gov.uk blue) - Primary actions, links, key UI elements
- **Secondary**: #00703C (gov.uk green) - Success states, positive indicators
- **Accent**: #D4351C (gov.uk red) - Alerts, urgent information, closing soon indicators
- **Background**: #F3F2F1 (warm grey) - Page background
- **Text**: #0B0C0C (near black) - Primary text
- **White**: #FFFFFF - Card backgrounds, content containers

## Typography
- **Font Stack**: GDS Transport, Arial, sans-serif
- **Hierarchy**:
  - Page titles: 48px/bold
  - Section headers: 32px/bold
  - Card titles: 24px/bold
  - Body text: 19px/regular
  - Metadata: 16px/regular
  - Small text: 14px/regular
- **Line Height**: 1.5 for body text, 1.2 for headings
- **Accessible contrast**: All text must meet WCAG AA standards against backgrounds

## Layout System
- **Container**: max-width: 1200px, centered
- **Spacing Scale**: Use consistent 20px base unit (20px, 40px, 60px, 80px)
- **Grid**: Responsive card grid (1 column mobile, 2 columns tablet, 3 columns desktop)
- **Card Spacing**: 20px gap between cards
- **Section Padding**: 60px vertical, 20px horizontal (mobile), 40px horizontal (desktop)

## Component Library

### Navigation Header
- Fixed top position with gov.uk blue background (#1D70B8)
- White text, GDS crown logo left-aligned
- Title: "UK Government Petitions Dashboard"
- Search bar integrated in header (desktop) or below (mobile)
- Auto-refresh indicator showing last update time

### Petition Cards
- White background with subtle border
- 20px padding
- Signature count prominently displayed (32px bold)
- Petition title (24px bold, #0B0C0C)
- Category tag with colored background
- Status badge (open/closed/awaiting response)
- Progress bar showing signatures toward 10k and 100k thresholds
- "View Details" link in gov.uk blue

### Filter & Sort Controls
- Horizontal filter bar below header
- Dropdown filters: Status, Category
- Sort options: Most signatures, Recently created, Closing soon
- Keyword search input with magnifying glass icon
- Active filter badges with remove option

### Detail Pages
- Full petition information with larger typography
- Signature count milestone indicators (visual markers at 10k, 100k)
- Government response section (if available) with green accent border
- Debate information (if threshold reached) with highlighted box
- Signature graph showing growth over time
- Back to dashboard link

### Live Update Indicators
- Signature counts animate when updated
- "Live" badge with pulsing green dot
- Last refreshed timestamp in small grey text
- Loading skeleton states during data fetch

## Images
No hero images needed - this is a data-focused dashboard. Use GDS crown logo in header only.

## Accessibility
- ARIA labels on all interactive elements
- Focus indicators with 3px gov.uk yellow (#FFDD00) outline
- Keyboard navigation support throughout
- Screen reader announcements for live updates
- Sufficient color contrast (WCAG AA minimum)

## Responsive Behavior
- Mobile: Single column, stacked filters, full-width cards
- Tablet: 2-column grid, horizontal filter bar
- Desktop: 3-column grid, all controls visible simultaneously
- Breakpoints: 640px (tablet), 1024px (desktop)

## Key Principles
- Government authority and trustworthiness
- Clear information hierarchy
- Real-time data visibility
- Accessible to all users
- Clean, uncluttered interface following GDS standards