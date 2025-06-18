import { RoleEnum } from '@/types/api';
import { hasRole } from '@/utils/roles';
import { isFeatureEnabled } from '@/config';

// Define icons as string identifiers
export type IconType = 
  | 'FOREST' 
  | 'SUPERVISOR_ACCOUNT' 
  | 'STREAM' 
  | 'BAKERY_DINING' 
  | 'FACE4' 
  | 'DRY_CLEANING' 
  | 'PHOTOGRAPHY'
  | 'AIRPORT_SHUTTLE' 
  | 'LIQUOR' 
  | 'CELEBRATION' 
  | 'LOCAL_BAR' 
  | 'RESTAURANT' 
  | 'MUSIC_NOTE' 
  | 'NIGHTLIFE' 
  | 'CLEANING_SERVICES' 
  | 'CIRCLE_NOTIFICATIONS' 
  | 'DIRECTIONS_BUS';

export interface EventItem {
  id: string;
  name: string;
  time: string;
  location: string;
  description: string;
  details: string[];
  icon: IconType;
  restricted?: boolean;
  visible?: boolean;
  customContent?: boolean;
}

export interface DayEvents {
  title: string;
  subtitle: string;
  events: EventItem[];
}

export interface EventsData {
  friday: DayEvents;
  saturday: DayEvents;
  sunday: DayEvents;
}

export interface TransportScheduleItem {
  from: string;
  times: string[];
}

export interface TransportInfo {
  id: string;
  name: string;
  description: string;
  icon: IconType;
  details: {
    title: string;
    schedule: TransportScheduleItem[];
  }[];
}

export interface SupportContactInfo {
  name: string;
  contact: string;
  email: string;
}

export const getScheduleEvents = (currentUser: any): EventsData => ({
  friday: {
    title: 'Friday, July 4, 2025',
    subtitle: 'Pre-Wedding Events',
    events: [
      {
        id: 'camper-checkin',
        name: 'Camper Check-In',
        time: '12:00 PM',
        location: 'Stone Manor Inn, Lovettsville, VA',
        description: 'Earliest check-in for guests camping at the venue grounds.',
        details: ['Set up your gear as early as 12:00 PM'],
        icon: 'FOREST',
        restricted: true,
        visible: hasRole(RoleEnum.Camper, currentUser)
      },
      {
        id: 'manor-checkin',
        name: 'Manor Check-In',
        time: '3:00 PM',
        location: 'Stone Manor Inn, Lovettsville, VA',
        description: 'Earliest check-in for guests staying at the manor.',
        details: ['Manor guests only'],
        icon: 'SUPERVISOR_ACCOUNT',
        restricted: true,
        visible: hasRole(RoleEnum.Manor, currentUser)
      },
      {
        id: 'rehearsal',
        name: 'Wedding Rehearsal',
        time: '5:00 PM - 6:00 PM',
        location: 'Stone Manor Inn, Lovettsville, VA',
        description: 'Rehearsal walkthrough for the bride and groom, and wedding party members.',
        details: ['Officiant, family, and wedding party only', 'Casual attire'],
        icon: 'SUPERVISOR_ACCOUNT',
        restricted: true,
        visible: hasRole(RoleEnum.Rehearsal, currentUser) || hasRole(RoleEnum.Party, currentUser)
      },
      {
        id: 'welcome-dinner',
        name: 'Fourth of July: Potluck BBQ & Fireworks',
        time: '6:00 PM - 10:00 PM',
        location: 'Stone Manor Inn, Lovettsville, VA',
        description: 'Join us for a potluck fourth of July grill',
        details: ['Meet other guests!', 
          'Casual attire', 
          'Bring your instruments', 
          'Bring your (legal in Virginia) fireworks!'],
        icon: 'STREAM',
        customContent: true
      }
    ]
  },
  saturday: {
    title: 'Saturday, July 5, 2025',
    subtitle: 'Wedding Day',
    events: [
      {
        id: 'brunch1',
        name: 'Manor Guests: Breakfast',
        time: '09:00 AM - 10:00 AM',
        location: 'Stone Manor Inn: Dining Hall',
        description: 'Breakfast for manor guests.',
        details: ['Coffee and tea', 'Breakfast'],
        icon: 'BAKERY_DINING',
        restricted: true,
        visible: isFeatureEnabled('ENABLE_DETAILS_SCHEDULE_WEDDINGDAY') 
          && hasRole(RoleEnum.Manor, currentUser)
      },
      {
        id: 'getting-ready',
        name: 'Bridal Party: Getting Ready',
        time: '10:15 AM - 4:00 PM',
        location: 'Stone Manor Inn (Manor Suite)',
        description: 'Get ready with the bride!',
        details: [
          'Professional hair and makeup services', 
          'Photographer arrives at 4:00 PM'
        ],
        icon: 'FACE4',
        restricted: true,
        visible: isFeatureEnabled('ENABLE_DETAILS_SCHEDULE_WEDDINGDAY') 
          && (hasRole(RoleEnum.Party, currentUser) || hasRole(RoleEnum.Manor, currentUser))
      },
      {
        id: 'getting-ready-groomsmen',
        name: 'Groomsmen: Getting Ready',
        time: '1:00 PM - 4:00 PM',
        location: 'Stone Manor Inn (Turret Suite)',
        description: 'Get ready with the groom!',
        details: [
          'Throw on your tuxedos and help Topher get ready',
          'Photographer arrives at 4:00 PM'
        ],
        icon: 'DRY_CLEANING',
        restricted: true,
        visible: isFeatureEnabled('ENABLE_DETAILS_SCHEDULE_WEDDINGDAY') 
          && (hasRole(RoleEnum.Party, currentUser) || hasRole(RoleEnum.Manor, currentUser))
      },
      {
        id: 'photo-shoot',
        name: 'Wedding Party & Family: Photo Shoot',
        time: '4:00 PM - 5:30 PM',
        location: 'Stone Manor Inn (TBD)',
        description: 'Photo shoot with the wedding party and family members. Schedule TBD',
        details: [
          'Photographer arrives at 4:00 PM'
        ],
        icon: 'PHOTOGRAPHY',
        restricted: true,
        visible: isFeatureEnabled('ENABLE_DETAILS_SCHEDULE_WEDDINGDAY') 
          && (hasRole(RoleEnum.Party, currentUser) || hasRole(RoleEnum.Manor, currentUser))
      },
      {
        id: 'shuttle1',
        name: 'Hotel Shuttles Leave for Ceremony (Round 1)',
        time: '4:00 PM',
        location: 'Holiday Inn Express Brunswick & Holiday Inn Express Charles Town',
        description: '56 passenger shuttles will depart for the ceremony. One shuttle per hotel. Please arrive at the shuttle 10 minutes early.',
        details: ['First of two shuttle runs', '18 minute drive from Holiday Inn Express Brunswick', '23 minute drive from Holiday Inn Express Charles Town'],
        icon: 'AIRPORT_SHUTTLE'
      },
      {
        id: 'shuttle2',
        name: 'Hotel Shuttles Leave for Ceremony (Round 2)',
        time: '5:00 PM',
        location: 'Holiday Inn Express Brunswick & Holiday Inn Express Charles Town',
        description: 'Final shuttle run before the ceremony. One shuttle per hotel. Please arrive at the shuttle 10 minutes early.',
        details: ['Second of two shuttle runs', '18 minute drive from Holiday Inn Express Brunswick', '23 minute drive from Holiday Inn Express Charles Town'],
        icon: 'AIRPORT_SHUTTLE'
      },
      {
        id: 'barstart',
        name: 'Open Bar Begins',
        time: '5:00 PM',
        location: 'Stone Manor Inn',
        description: 'Open bar begins for all guests.',
        details: ['Beer, wine, and cocktails available'],
        icon: 'LIQUOR'
      },
      {
        id: 'ceremony',
        name: 'Wedding Ceremony',
        time: '6:00 PM - 6:30 PM',
        location: 'Stone Manor Inn (Wooded Glen)',
        description: 'Topher and Steph exchange vows. Please arrive 15-30 minutes early.',
        details: ['Outdoor ceremony (weather permitting)', 'Seating provided'],
        icon: 'CELEBRATION'
      },
      {
        id: 'cocktail-hour-photo-shoot',
        name: 'Wedding Party & Family: Cocktail Hour Photo Shoot',
        time: '6:30 PM - 7:00 PM',
        location: 'Stone Manor Inn (TBD)',
        description: 'Photo shoot with the bride, groom, wedding party, and family members. Schedule TBD',
        details: [
          'Photo shoot during cocktail hour',
        ],
        icon: 'PHOTOGRAPHY',
        restricted: true,
        visible: isFeatureEnabled('ENABLE_DETAILS_SCHEDULE_WEDDINGDAY') 
          && (hasRole(RoleEnum.Party, currentUser) || hasRole(RoleEnum.Manor, currentUser))
      },
      {
        id: 'cocktail',
        name: 'Cocktail Hour',
        time: '6:30 PM - 7:30 PM',
        location: 'Stone Manor Inn (Patio & Butterfly Garden)',
        description: 'Enjoy drinks while mingling with other guests.',
        details: ['Open bar'],
        icon: 'LOCAL_BAR',
        visible: isFeatureEnabled('ENABLE_DETAILS_SCHEDULE_WEDDINGDAY')           
      },
      {
        id: 'reception',
        name: 'Dinner Reception',
        time: '7:30 PM',
        location: 'Stone Manor Inn (Solarium and Tent)',
        description: 'Dinner, speeches, toasts, and dessert cutting.',
        details: ['Buffet dinner service', 'Dessert', 'Toasts and speeches'],
        icon: 'RESTAURANT',
        visible: isFeatureEnabled('ENABLE_DETAILS_SCHEDULE_WEDDINGDAY') 
      },
      {
        id: 'dancing',
        name: 'Dancing & Celebration',
        time: '8:50 PM - 11:00 PM',
        location: 'Stone Manor Inn (Main Hall)',
        description: 'Dance the night away! Topher and Steph will change into more comfortable attire for this portion.',
        details: ['DJ and dancing', 'Fire spinners'],
        icon: 'MUSIC_NOTE',
        visible: isFeatureEnabled('ENABLE_DETAILS_SCHEDULE_WEDDINGDAY') 
      },
      {
        id: 'shuttle3',
        name: 'Hotel Shuttles Leaves Venue for Hotels (Round 1)',
        time: '10:00 PM',
        location: 'Stone Manor Inn',
        description: '56 passenger shuttles will depart for the hotels. One shuttle per hotel.',
        details: ['18 minute drive to Holiday Inn Express Brunswick', '23 minute drive to Holiday Inn Express Charles Town'],
        icon: 'AIRPORT_SHUTTLE'
      },
      {
        id: 'shuttle4',
        name: 'Hotel Shuttles Leaves Venue for After Party and Hotels (Round 2)',
        time: '11:00 PM',
        location: 'Stone Manor Inn',
        description: '56 passenger shuttles will depart for the hotels. One shuttle per hotel.',
        details: ['18 minute drive to Holiday Inn Express Brunswick', '23 minute drive to Holiday Inn Express Charles Town'],
        icon: 'AIRPORT_SHUTTLE'
      },
      {
        id: 'afterparty',
        name: 'After Party - DJ and Dancing Continues',
        time: '11:00 PM - ?',
        location: 'Stone Manor Inn - Solarium',
        description: 'Loudon county enforces 11pm quiet hours, but hang with us at the manor! We will move the music indoors to continue the dance party.',
        details: ['DJ in the Solarium', 'Hang out by the fire or on the patio'],
        icon: 'NIGHTLIFE',
        visible: isFeatureEnabled('ENABLE_DETAILS_SCHEDULE_WEDDINGDAY') 
      },
    ]
  },
  sunday: {
    title: 'Sunday, July 6, 2025',
    subtitle: 'Post-Wedding Gathering',
    events: [
      {
        id: 'brunch2',
        name: 'Manor Guests: Continental Breakfast',
        time: '09:00 AM - 10:00 AM',
        location: 'Stone Manor Inn: Dining Hall',
        description: 'Continental breakfast for manor guests.',
        details: ['Coffee and tea', 'Bagels, baked goods, and spreads', 'Final Farewells'],
        icon: 'BAKERY_DINING',
        restricted: true,
        visible: hasRole(RoleEnum.Manor, currentUser)
      },
      {
        id: 'cleanup',
        name: 'Decoration Removal',
        time: '10:00 AM - 11:00 AM',
        location: 'Stone Manor Inn',
        description: 'Decorations must be removed by 11:00 AM. Help us out!',
        details: ['Take down LED lights', 'Remove flowers', 'Etc.'],
        icon: 'CLEANING_SERVICES',
        restricted: true,
        visible: hasRole(RoleEnum.Party, currentUser)
      },
      {
        id: 'checkout-manor',
        name: 'Manor Check-Out',
        time: '11:00 AM',
        location: 'Stone Manor Inn',
        description: 'Manor guest check-out time.',
        details: ['Please leave your rooms tidy', 
          'All personal belongings must be removed from rooms by 11:00 AM'],
        icon: 'CIRCLE_NOTIFICATIONS',
        restricted: true,
        visible: hasRole(RoleEnum.Manor, currentUser)
      },
      {
        id: 'checkout-campers',
        name: 'Camper Check-Out',
        time: '11:00 AM',
        location: 'Stone Manor Inn',
        description: 'Camper guest check-out time.',
        details: ['Please leave no trace: all camping gear, trash, and personal items must be removed', 
          'Check-out by 11:00 AM'],
        icon: 'CIRCLE_NOTIFICATIONS',
        restricted: true,
        visible: hasRole(RoleEnum.Camper, currentUser)
      },
    ]
  }
});

// Transportation info with component-based schedule items
export const transportInfo: TransportInfo = {
  id: 'transport',
  name: 'Shuttle Information',
  description: 'Shuttle services will be available between the recommended hotels and wedding venue.',
  icon: 'DIRECTIONS_BUS',
  details: [
    {
      title: 'To the Ceremony',
      schedule: [
        { from: "From Holiday Inn Express Brunswick", times: ["4:00 PM", "5:00 PM"] },
        { from: "From Holiday Inn Express Charles Town", times: ["4:00 PM", "5:00 PM"] }
      ]
    },
    {
      title: 'Return Shuttles',
      schedule: [
        { from: "To both hotels", times: ["10:00 PM", "11:00 PM"] }
      ]
    }
  ]
};

// Help/support contact info
export const supportContact: SupportContactInfo = {
  name: 'Wedding Day Contact',
  contact: 'Wedding Hosts: Topher & Steph',
  email: 'hosts@wedding.christephanie.com'
};