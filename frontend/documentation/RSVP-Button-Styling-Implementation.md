# RSVP Button Styling Implementation Plan

## Overview

This document outlines the specific implementation details for improving the RSVP page buttons and creating a consistent visual language across all RSVP sections.

## Inspiration and Reference Components

The following components provide good examples for our styling approach:

1. **FourthOfJulyButton** - Located at `/src/components/WeddingAttendanceRadios/FourthOfJulyButton.tsx`
   - Uses custom styled buttons with icons
   - Includes text shadow effects for selected state
   - Provides responsive design with size adjustments

2. **RehearsalDinnerSection** - Located at `/src/pages/RSVP/components/RehearsalDinnerSection.tsx`
   - Uses the FourthOfJulyButton for consistent styling
   - Shows good container styling for button groups

## Design Requirements

### Button Component Design

All attendance buttons across RSVP sections should have:

1. **Visual States:**
   - Unselected state: Outlined style with transparent background
   - Selected state: Filled background with text shadow
   - Hover state: Subtle background color change
   - Disabled state: Reduced opacity

2. **Elements:**
   - Icon on left side
   - Text with consistent size and style
   - Visual indicators for selection state (shadow, background color)
   - Proper spacing and padding

3. **Color Scheme:**
   - Success/Yes/Attending: Navy blue (#0F52BA) or theme.palette.success.main
   - Decline/No: theme.palette.error.main
   - Pending/Not sure: White/Gray or theme.palette.info.main

4. **Typography:**
   - Use StephsStyledTypography for text
   - Apply text shadow for selected state
   - Ensure proper text contrast in all states

### Container Design

Button containers should have:

1. **Backgrounds:**
   - Dark, semi-transparent background (rgba(0,0,0,0.6))
   - Blur effect for depth (backdropFilter: 'blur(20px)')
   - Subtle border (1px dashed or solid)

2. **Layout:**
   - Responsive grid layout (horizontal on desktop, vertical on mobile)
   - Proper spacing between items
   - Centered content
   - Consistent width constraints

3. **Effects:**
   - Subtle shadows for depth
   - Transition animations for hover/selection states

## Implementation Steps

### 1. Create Common Button Component

Create a shared button component that can be reused across all RSVP sections:

```typescript
// Interface for the common button component
interface CommonRsvpButtonProps {
  value: string | number | boolean; // The value this button represents
  currentValue: string | number | boolean; // Currently selected value
  color: 'success' | 'error' | 'info' | 'warning' | 'primary'; // Button color theme
  icon: React.ReactNode; // Icon element to display
  label: string; // Button text
  onClick: (value: string | number | boolean) => void; // Click handler
  disabled?: boolean; // Disabled state
  size?: 'small' | 'medium' | 'large'; // Optional size variant
}

// Component implementation with styled elements and proper states
const CommonRsvpButton: React.FC<CommonRsvpButtonProps> = ({
  value,
  currentValue,
  color,
  icon,
  label,
  onClick,
  disabled = false,
  size = 'medium'
}) => {
  const theme = useTheme();
  const isSelected = value === currentValue;
  
  // Custom styling based on status...
  
  return (
    <Button
      variant={isSelected ? 'contained' : 'outlined'}
      color={color}
      onClick={() => onClick(value)}
      disabled={disabled}
      sx={{
        // Custom styling here...
      }}
    >
      {/* Button content */}
    </Button>
  );
};
```

### 2. Update WelcomeSection Component

Modify the WelcomeSection component to use the consistent styling:

1. Replace current button implementation with the new common button component
2. Update the container styling to match the RehearsalDinnerSection
3. Improve responsive layout handling
4. Add proper feedback messages for selection

### 3. Ensure Consistent Container Styling

Create a common container style that can be used across all sections:

```typescript
const CommonRsvpContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 600,
  margin: '0 auto',
  padding: theme.spacing(1),
  marginBottom: theme.spacing(2),
  background: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(20px)',
  border: `1px dashed ${theme.palette.secondary.main}`,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));
```

### 4. Apply Styling to All RSVP Sections

Apply the common styling to all remaining section components:
- FoodPreferencesSection
- TransportationSection
- AccommodationSection
- SummarySection

## Visual Inspiration

### Button States

```
+-------------------+  +-------------------+
|                   |  |                   |
| ○ Not Attending   |  | ● YES, ATTENDING  |
|                   |  |                   |
+-------------------+  +-------------------+
      Unselected            Selected
```

### Section Layout

```
+----------------------------------------+
|                                        |
|          Guest Name                    |
|                                        |
| +------------------------------------+ |
| |                                    | |
| |  +-------------+  +-------------+  | |
| |  |             |  |             |  | |
| |  |     YES     |  |     NO      |  | |
| |  |             |  |             |  | |
| |  +-------------+  +-------------+  | |
| |                                    | |
| +------------------------------------+ |
|                                        |
|  Feedback message based on selection   |
|                                        |
+----------------------------------------+
```

## Mobile Optimization

On mobile devices:
1. Stack buttons vertically
2. Reduce icon and text sizes
3. Maintain padding for touch targets
4. Ensure feedback messages are clearly visible

## Accessibility Considerations

1. Ensure sufficient color contrast in all states
2. Use proper ARIA attributes for interactive elements
3. Maintain touch target sizes of at least 44x44px
4. Provide clear visual feedback for all interactions

## Testing Plan

1. Test all components on mobile and desktop viewports
2. Verify proper visual states (selected, unselected, hover, disabled)
3. Ensure proper data binding to state
4. Test with keyboard navigation
5. Verify proper focus states and tab order