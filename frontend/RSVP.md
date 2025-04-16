# RSVP Page Conversion Tracker

## Overview
This document tracks our progress in converting the Save-the-Date page components into RSVP-specific components. The current RSVP page is a copy of the Save-the-Date page but will be customized to handle the RSVP functionality while reusing data from the Save-the-Date responses.

## Documentation
Detailed implementation plans and technical specifications are available in the documentation directory:
- [Phase 1: State Management Setup](/documentation/RSVP-Phase1-State-Management.md)
- [Phase 3.1: Wedding Attendance Pre-filling](/documentation/RSVP-Wedding-Attendance-Prefilling.md)

## Current Status
- ✅ Refactored stepper file structure for better organization
- ✅ Created RSVP-specific state management
- ✅ Updated RSVPStepper to use RSVP-specific state
- ✅ Updated RSVPPage to use RSVPStepper
- ✅ Fixed navigation to use /rsvp routes

The basic RSVP page infrastructure is now in place with its own state management and route handling.

## Required Changes

### Component Renaming
- [x] Create RSVPStepper component based on SaveTheDateStepper
- [x] Update component imports to use RSVP-specific components

### State Management
- [x] Create RSVP-specific state in store/steppers/rsvpStepper.ts
- [x] Define RSVP-specific steps (different from save-the-date steps)
- [x] Create rsvpTabIndex recoil atom 
- [x] Create rsvpStepsState recoil atom
- [x] Create rsvpStepperState selector

### Route Management
- [x] Update handleNavigateToStep to use /rsvp routes instead of /save-the-date
- [ ] Create useQueryParamRsvpStep hook (similar to useQueryParamInvitationCode)

### RSVP-Specific Steps and Content
- [x] Define new steps for RSVP process
- [ ] Update content to reflect final RSVP vs initial interest
- [ ] Add wedding-specific questions not in save-the-date
- [ ] Add rehearsal dinner attendance option for selected guests
- [x] Add foodAllergies step after foodPreferences
- [ ] Create WeddingAttendanceSlider component with StickFigureIcon for explicit attendance confirmation
- [ ] Update SummaryView to show RSVP-specific information

### Data Handling
- [ ] Initialize RSVP form with previously saved Save-the-Date responses
- [ ] Add API endpoints for saving final RSVP information
- [ ] Update backend to handle RSVP status changes

### Visual Updates
- [ ] Update MTV title or other visual elements to be RSVP-specific
- [ ] Consider different background or theme for RSVP vs Save-the-Date

## Implementation Plan

### Phase 1: State Management Setup ✅
1. Create rsvpStepper.ts file with:
   - Define RSVP-specific step interfaces
   - Create rsvpTabIndex atom
   - Create rsvpStepsState atom with RSVP-specific steps
   - Create rsvpStepperState selector
2. Export all state from store/steppers/index.ts

### Phase 2: Basic Stepper Component ✅
1. Create RSVPStepper component based on SaveTheDateStepper
2. Update RSVPPage to use RSVPStepper
3. Fix navigation to use /rsvp routes instead of /save-the-date

### Phase 3: RSVP-Specific Step Components 🔄
1. Create WeddingAttendanceSlider component with StickFigureIcon for explicit attendance confirmation
2. Create RehearsalDinnerAttendance component
3. Update SummaryView to show RSVP-specific information
4. Add any wedding-specific question components

### Phase 4: API Integration
1. Add API endpoints for saving RSVP information
2. Update data initialization to use save-the-date responses
3. Add handlers for RSVP status changes

### Phase 5: Visual Enhancements
1. Update MTV title or other visual elements to be RSVP-specific
2. Add RSVP-specific styles and themes
3. Improve mobile responsive design

### Phase 6: Testing & Refinement
1. Test full RSVP flow
2. Fix any discovered issues
3. Gather feedback and make adjustments

## Notes
- Maintain accessibility features throughout conversion
- Keep mobile-first approach for all components
- Reuse save-the-date user responses when appropriate
- Consider how to handle changes in attendance between save-the-date and final RSVP