// Currency, location, and reliable food imagery resolver for BIIT Food Hub

export const formatPrice = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rs. 0';
  return `Rs. ${Number(amount).toLocaleString('en-PK', { maximumFractionDigits: 2 })}`;
};

export const RAWALPINDI_LOCATIONS = [
  { id: 'biit-campus', name: 'BIIT Campus, PMAS Arid Univ', area: 'Shamsabad, Murree Road', estTime: '15-20 min', badge: 'Nearest' },
  { id: 'satellite-town', name: 'Satellite Town & Commercial Market', area: 'Rawalpindi', estTime: '20-25 min', badge: 'Popular' },
  { id: '6th-road', name: '6th Road & Metro Station', area: 'Murree Road, Rawalpindi', estTime: '20-30 min', badge: '' },
  { id: 'chandni-chowk', name: 'Chandni Chowk & Asghar Mall', area: 'Rawalpindi', estTime: '25-35 min', badge: '' },
  { id: 'faizabad', name: 'Faizabad & Double Road', area: 'Rawalpindi / Islamabad', estTime: '20-30 min', badge: '' },
  { id: 'saddar-cantt', name: 'Saddar Cantt & Bank Road', area: 'Rawalpindi Cantt', estTime: '30-40 min', badge: '' },
  { id: 'bahria-phase4', name: 'Bahria Town (Phase 4)', area: 'Rawalpindi', estTime: '35-45 min', badge: '' },
];

// High-resolution, reliable, non-blocked food photography mappings
const FOOD_KEYWORD_IMAGES = {
  pizza: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
  garden: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  smash: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
  zinger: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80',
  fries: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
  onion: 'https://images.unsplash.com/photo-1639024471287-032f66705664?auto=format&fit=crop&w=800&q=80',
  coleslaw: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  brownie: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
  chocolate: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
  apple: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?auto=format&fit=crop&w=800&q=80',
  crumble: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?auto=format&fit=crop&w=800&q=80',
  ice: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=800&q=80',
  cream: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=800&q=80',
  vanilla: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=800&q=80',
  water: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
  sparkling: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
  tea: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
  lemonade: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
  fettuccine: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
  pasta: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
  biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
  chai: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
};

export const getDishImage = (dish) => {
  if (!dish) return 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80';

  // If dish.image is a valid user-uploaded image (and NOT placehold.co or broken)
  if (
    dish.image &&
    typeof dish.image === 'string' &&
    dish.image.startsWith('http') &&
    !dish.image.includes('placehold.co') &&
    !dish.image.includes('placeholder')
  ) {
    return dish.image;
  }

  // Smart fallback matching dish name or category
  const searchText = `${dish.name || ''} ${dish.category || ''}`.toLowerCase();
  for (const [keyword, url] of Object.entries(FOOD_KEYWORD_IMAGES)) {
    if (searchText.includes(keyword)) {
      return url;
    }
  }

  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
};
