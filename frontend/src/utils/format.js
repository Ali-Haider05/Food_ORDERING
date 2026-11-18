// Currency and location formatting utilities for Pakistani Rupee and BIIT Rawalpindi environment

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
