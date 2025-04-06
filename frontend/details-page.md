# Details Page Implementation Plan

This document outlines the steps necessary to implement each of the detail pages that have been enabled through feature flags in the `feature-flags.ts` file.

## Overview

The following detail pages are currently enabled:
- ENABLE_DETAILS_ABOUTUS
- ENABLE_DETAILS_ACCOMMODATIONS
- ENABLE_DETAILS_TRAVEL
- ENABLE_DETAILS_ATTIRE
- ENABLE_DETAILS_SCHEDULE
- ENABLE_DETAILS_THINGS_TO_DO

Each of these pages needs to be customized with specific content relevant to its purpose. Currently, all pages share the same template structure derived from the AboutUsCouple component, which needs to be updated.

## Common Structure

All detail pages share the following structure:
- A header section with a title, animated logo, and introductory text
- A scrollable list of sections, each with its own header
- Nested content with subheaders and paragraphs
- Consistent styling using MUI components and themed styling

## Implementation Tasks for Each Page

### 1. About Us Page (`ENABLE_DETAILS_ABOUTUS`) - IMPLEMENTED

**Current state**: New component created at `/src/components/DetailsPages/AboutUs/AboutUs.tsx`

**Tasks**:
- [x] Update page title to "About Us" or "Steph & Topher"
- [x] Replace business content with personal story content
- [x] Add sections for:
  - [x] How we met
  - [x] Our engagement story
  - [x] Interesting facts about the couple
  - [x] Add engagement photos from the assets/engagement-photos directory
- [x] Remove business terminology like "Christephanie LLC" and replace with personal messaging
- [x] Update contact information to be wedding-specific rather than business-focused
- [x] Consider adding a photo gallery component for engagement photos

### 2. Accommodations Page (`ENABLE_DETAILS_ACCOMMODATIONS`) - IMPLEMENTED

**Current state**: New component created at `/src/components/DetailsPages/Accommodations/Accommodations.tsx`

**Tasks**:
- [x] Update page content to focus on accommodation options
- [x] Remove business information
- [x] Add sections for:
  - [x] Recommended hotels with links and contact information
  - [x] Room block details and booking instructions
  - [x] Price ranges and availability information
  - [x] Alternative accommodation options (Airbnb, etc.)
  - [x] Transportation information between accommodations and venue
- [x] Add maps or directions if available
- [x] Include any special accommodation discounts
- [x] Add images of recommended hotels from assets (holiday-inn-express images)

### 3. Travel Page (`ENABLE_DETAILS_TRAVEL`) - IMPLEMENTED

**Current state**: New component created at `/src/components/DetailsPages/Travel/Travel.tsx`

**Tasks**:
- [x] Update page title to "Travel Information"
- [x] Remove all business content
- [x] Add sections for:
  - [x] Directions to the venue from major landmarks
  - [x] Airport information and transportation options
  - [x] Car rental recommendations
  - [x] Parking details
  - [x] Public transportation options
- [x] Consider embedding a Google Map for the venue location
- [x] Add weather information for the wedding date
- [x] Include any local transportation tips or recommended services

### 4. Attire Page (`ENABLE_DETAILS_ATTIRE`) - IMPLEMENTED

**Current state**: New component created at `/src/components/DetailsPages/Attire/Attire.tsx`

**Tasks**:
- [x] Update page title to "Attire Guidelines"
- [x] Remove all business content
- [x] Add sections for:
  - [x] Dress code explanation
  - [x] Suggested attire for different wedding events
  - [x] Weather considerations for outfit planning
  - [x] Special requests (e.g., colors to avoid, themes to embrace)
  - [x] Footwear recommendations for the venue
- [x] Consider adding visual examples or inspiration photos
- [x] Include any cultural attire information if relevant

### 5. Schedule Page (`ENABLE_DETAILS_SCHEDULE`) - IMPLEMENTED

**Current state**: New component created at `/src/components/DetailsPages/Schedule/Schedule.tsx`

**Tasks**:
- [x] Update page title to "Wedding Schedule" or "Event Timeline"
- [x] Remove all business content
- [x] Add sections for each wedding event:
  - [x] Rehearsal dinner details
  - [x] Wedding ceremony timing and location
  - [x] Cocktail hour information
  - [x] Reception details
  - [x] After-party information
  - [x] Next-day activities if applicable
- [x] Consider implementing a timeline visualization
- [x] Add any special instructions for specific events
- [x] Include contact information for day-of coordination questions

### 6. Things To Do Page (`ENABLE_DETAILS_THINGS_TO_DO`) - IMPLEMENTED

**Current state**: New component created at `/src/components/DetailsPages/ThingsToDo/ThingsToDo.tsx`

**Tasks**:
- [x] Update page title to "Things To Do"
- [x] Remove all business content
- [x] Add sections for:
  - [x] Local attractions and points of interest
  - [x] Recommended restaurants and bars
  - [x] Shopping areas
  - [x] Outdoor activities
  - [x] Entertainment options
  - [x] Day trip suggestions
- [x] Group activities by category and distance from wedding venue
- [x] Consider adding a "couple's favorites" section with personal recommendations
- [x] Include approximate costs and time commitments for activities
- [x] Add relevant photos of local attractions if available

## Technical Implementation Notes

1. For each component:
   - Update the component properties and interfaces to match the specific page needs
   - Ensure the aboutUsItems object is renamed to match the specific page (e.g., accommodationItems, scheduleItems)
   - Update the data structure to support the content requirements of each page

2. Common design elements to maintain:
   - Semi-transparent background styling
   - Sticky header behavior
   - Consistent typography using StephsActualFavoriteTypography
   - Box shadow and z-index hierarchy
   - Mobile-friendly layout considerations

3. Performance considerations:
   - Optimize any images added to the pages
   - Ensure that content renders efficiently on mobile devices
   - Maintain the AbortController pattern for any async operations

4. Navigation improvements:
   - Consider adding direct links between related sections (e.g., from Accommodations to Travel)
   - Update the handleTabLink function to support new navigation paths

## Implementation Summary

### Approach

We've implemented the first two details pages (About Us and Accommodations) by following these steps:

1. **Created New Components:**
   - Created new component directories in `/src/components/DetailsPages/`:
     - `/src/components/DetailsPages/AboutUs/AboutUs.tsx`
     - `/src/components/DetailsPages/Accommodations/Accommodations.tsx`
   - Each component follows the same structure as the original components but with updated content

2. **Updated Content:**
   - Replaced business/company content with wedding-specific content
   - Added wedding story sections, engagement photos, accommodation details, etc.
   - Maintained the existing component structure and styling patterns

3. **Integrated with Existing UI:**
   - Updated the main Details page (`/src/pages/Info/Info.tsx`) to use our new components
   - Kept the same tab structure and navigation
   - This allows us to use the existing route without creating new routes

4. **Feature Flags:**
   - All components respect the existing feature flags in `/src/config/feature-flags.ts`
   - Each detail page has its own flag (ENABLE_DETAILS_ABOUTUS, etc.)

### Component Structure

The components follow a consistent structure:
- Semi-transparent background with sticky headers
- Animated logo in the header
- Nested list structure for content
- Z-index hierarchy for headers
- Mobile-friendly layout

## Project Status - ALL COMPLETED ✅

We have successfully implemented all six details pages:

1. **About Us Page** - `/src/components/DetailsPages/AboutUs/AboutUs.tsx`
   - Personal story content with "How We Met" and "Our Engagement" sections
   - Fun facts about the couple
   - Photo gallery with engagement photos
   - Wedding-specific contact information

2. **Accommodations Page** - `/src/components/DetailsPages/Accommodations/Accommodations.tsx`
   - Hotel room blocks with details and photos
   - Alternative accommodation options (B&Bs, vacation rentals)
   - Transportation information
   - Contact information for accommodation questions

3. **Travel Page** - `/src/components/DetailsPages/Travel/Travel.tsx`
   - Directions to venue from airports and major cities
   - Transportation options (car, train, plane)
   - Interactive map for the venue location
   - Weather information and local transportation details

4. **Attire Page** - `/src/components/DetailsPages/Attire/Attire.tsx`
   - Dress code explanations for each event
   - Visual examples of appropriate attire
   - Weather considerations
   - Wedding color palette with visual swatches

5. **Schedule Page** - `/src/components/DetailsPages/Schedule/Schedule.tsx`
   - Complete weekend timeline (Friday through Sunday)
   - Interactive timeline visualization for wedding day
   - Transportation schedule details
   - Day-of contact information

6. **Things To Do Page** - `/src/components/DetailsPages/ThingsToDo/ThingsToDo.tsx`
   - Local attractions with photos, distances, times, and costs
   - Restaurant recommendations
   - Day trip options
   - "Couple's favorites" section with personalized recommendations

All components have been integrated into the existing Info.tsx page and are now displayed when users select the corresponding tab. The content is wedding-specific, removing all previous business-related information while maintaining the same component structure and styling patterns.

### Enhancements Implemented
- Interactive maps for venue locations
- Weather information sections
- Timeline visualization for the schedule
- Photo galleries for engagement photos and attractions
- Interactive cards with detailed information
- Cross-links between related sections
- Wedding color palette visualization