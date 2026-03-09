// Swift Route UK pricing
export const BASE_PRICE   = 8.99;   // £ base
export const WEIGHT_RATE  = 1.50;   // £/kg
export const DISTANCE_RATE= 0.12;   // £/km

export const UK_CITIES = [
  { name: 'London',        lat: 51.5074, lng: -0.1278 },
  { name: 'Manchester',    lat: 53.4808, lng: -2.2426 },
  { name: 'Birmingham',    lat: 52.4862, lng: -1.8904 },
  { name: 'Leeds',         lat: 53.8008, lng: -1.5491 },
  { name: 'Glasgow',       lat: 55.8642, lng: -4.2518 },
  { name: 'Liverpool',     lat: 53.4084, lng: -2.9916 },
  { name: 'Edinburgh',     lat: 55.9533, lng: -3.1883 },
  { name: 'Bristol',       lat: 51.4545, lng: -2.5879 },
  { name: 'Sheffield',     lat: 53.3811, lng: -1.4701 },
  { name: 'Cardiff',       lat: 51.4837, lng: -3.1681 },
  { name: 'Leicester',     lat: 52.6369, lng: -1.1398 },
  { name: 'Nottingham',    lat: 52.9548, lng: -1.1581 },
  { name: 'Newcastle',     lat: 54.9783, lng: -1.6178 },
  { name: 'Southampton',   lat: 50.9097, lng: -1.4044 },
  { name: 'Brighton',      lat: 50.8225, lng: -0.1372 },
  { name: 'Cambridge',     lat: 52.2053, lng: 0.1218  },
  { name: 'Oxford',        lat: 51.7520, lng: -1.2577 },
  { name: 'Coventry',      lat: 52.4068, lng: -1.5197 },
  { name: 'Belfast',       lat: 54.5973, lng: -5.9301 },
  { name: 'Aberdeen',      lat: 57.1497, lng: -2.0943 },
];

export const calcDistance = (c1, c2) => {
  const a = UK_CITIES.find(c => c.name === c1);
  const b = UK_CITIES.find(c => c.name === c2);
  if (!a || !b) return 150;
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const x = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
};

export const calcPrice = (weightKg, pickupCity, deliveryCity) => {
  const dist  = calcDistance(pickupCity, deliveryCity);
  const price = BASE_PRICE + (weightKg * WEIGHT_RATE) + (dist * DISTANCE_RATE);
  return Math.round(price * 100) / 100;
};

export const fmtPrice = (n) => `£${(n || 0).toFixed(2)}`;

export const STATUS_LABELS = {
  pending:   'Pending',
  assigned:  'Assigned',
  pickedup:  'Picked Up',
  transit:   'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};