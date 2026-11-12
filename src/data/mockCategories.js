export const AID_CATEGORIES = [
  {
    id: 'food',
    name: 'Food & Nutrition',
    description: 'Dry rations, canned foods, baby formula, and dietary essentials',
    iconName: 'Apple',
    color: 'emerald',
    defaultItemUnit: 'family food hampers'
  },
  {
    id: 'medical',
    name: 'Medical & Healthcare',
    description: 'First aid kits, prescription medicine assistance, sanitation kits',
    iconName: 'HeartPulse',
    color: 'rose',
    defaultItemUnit: 'medical kits'
  },
  {
    id: 'shelter',
    name: 'Shelter & Bedding',
    description: 'Emergency tarps, thermal sleeping bags, mattresses and tents',
    iconName: 'Home',
    color: 'amber',
    defaultItemUnit: 'emergency bedding units'
  },
  {
    id: 'education',
    name: 'Education & Learning',
    description: 'School supplies, textbooks, uniforms and stationery sets',
    iconName: 'GraduationCap',
    color: 'sky',
    defaultItemUnit: 'student packs'
  },
  {
    id: 'clothing',
    name: 'Warm Clothing',
    description: 'Winter coats, boots, thermal wear and children jackets',
    iconName: 'Shirt',
    color: 'indigo',
    defaultItemUnit: 'winter care kits'
  },
  {
    id: 'hygiene',
    name: 'Hygiene & Clean Water',
    description: 'Water purification tablets, soap, sanitizers and dental supplies',
    iconName: 'Droplets',
    color: 'teal',
    defaultItemUnit: 'hygiene packs'
  }
];

export const URGENCY_LEVELS = [
  { value: 'Critical', label: 'Critical (24 - 48 hrs)', color: 'rose', weight: 4 },
  { value: 'High', label: 'High Priority (3 - 5 days)', color: 'amber', weight: 3 },
  { value: 'Medium', label: 'Medium Priority (1 - 2 weeks)', color: 'blue', weight: 2 },
  { value: 'Low', label: 'Low Priority (Standard scheduled)', color: 'slate', weight: 1 }
];

