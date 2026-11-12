export const INITIAL_AID_REQUESTS = [
  {
    id: 'REQ-2024-101',
    title: 'Emergency Winter Heating & Thermal Bedding for Sheltered Seniors',
    category: 'Shelter & Bedding',
    categoryId: 'shelter',
    beneficiaryName: 'Elena Rostova (Care Coordinator)',
    beneficiaryId: 'USR-BEN-101',
    location: 'Northside Senior Haven, Sector 4',
    beneficiariesCount: 38,
    urgency: 'Critical',
    estimatedBudget: 1450,
    fundsRaised: 1200,
    status: 'Approved',
    createdAt: '2024-11-04T08:30:00Z',
    description: 'Sudden cold snap damaged the auxiliary heating unit in the community hospice annex. 38 elderly residents require immediate thermal blankets, electric heating pads, and heavy draft insulation strips while furnace repairs are underway.',
    itemsList: [
      { name: 'Heavyweight Thermal Wool Blankets', qty: '40 units', estCost: 800 },
      { name: 'Low-Wattage Safe Heating Pads', qty: '20 units', estCost: 450 },
      { name: 'Weather-seal Draught Strips & Insulators', qty: '12 packs', estCost: 200 }
    ],
    aiScore: 94,
    aiAnalysis: {
      score: 94,
      priorityLevel: 'Critical Priority',
      vulnerabilityIndex: '9.4 / 10.0',
      aiConfidence: '98.2%',
      flagged: false,
      summaryReason: 'Extremely high urgency due to elderly demographic and sub-zero weather forecast. Prior cross-checked intake document validated.'
    },
    verificationDocuments: [
      { name: 'facility_intake_manifest.pdf', size: '1.2 MB' },
      { name: 'utility_outage_notice.jpg', size: '850 KB' }
    ],
    donors: [
      { name: 'Sarah Jenkins', amount: 500, date: '2024-11-04T12:00:00Z' },
      { name: 'Apex Tech Community Fund', amount: 500, date: '2024-11-04T16:20:00Z' },
      { name: 'David Kim', amount: 200, date: '2024-11-05T09:15:00Z' }
    ],
    assignedSupplier: 'Metro Medical & Thermal Wholesalers (Direct Dispatch)',
    blockchainHash: '0x8f2d93b1c67a50e41f92e817a0bc5d36e2f419c8'
  },
  {
    id: 'REQ-2024-102',
    title: 'Essential Nutritional Food Hampers for Displaced Families',
    category: 'Food & Nutrition',
    categoryId: 'food',
    beneficiaryName: 'Marcus Vance',
    beneficiaryId: 'USR-BEN-102',
    location: 'East Riverside Community Center',
    beneficiariesCount: 65,
    urgency: 'Critical',
    estimatedBudget: 2200,
    fundsRaised: 1650,
    status: 'Approved',
    createdAt: '2024-11-03T11:20:00Z',
    description: 'Following seasonal river overflow, 18 family units (65 individuals including 24 young children) are staying in the temporary civic shelter. Seeking staple grains, milk powder, shelf-stable protein cans, and hygiene supplies.',
    itemsList: [
      { name: 'Family Dry Pantry Staples (Rice, Lentils, Flour)', qty: '25 bundles', estCost: 1100 },
      { name: 'Fortified Milk & Infant Nutrition Powder', qty: '40 cans', estCost: 650 },
      { name: 'Canned Proteins & Vegetable Packs', qty: '80 cans', estCost: 450 }
    ],
    aiScore: 91,
    aiAnalysis: {
      score: 91,
      priorityLevel: 'Critical Priority',
      vulnerabilityIndex: '9.1 / 10.0',
      aiConfidence: '97.5%',
      flagged: false,
      summaryReason: 'High child density (36%) in temporary shelter setting. Nutritional intervention urgent.'
    },
    verificationDocuments: [
      { name: 'shelter_occupancy_log_riverside.pdf', size: '2.4 MB' }
    ],
    donors: [
      { name: 'Greenleaf Foundation', amount: 1000, date: '2024-11-03T18:00:00Z' },
      { name: 'Anonymous Benefactor', amount: 400, date: '2024-11-04T10:00:00Z' },
      { name: 'Rachel Zane', amount: 250, date: '2024-11-05T14:30:00Z' }
    ],
    assignedSupplier: 'Valley Agro Food Cooperative',
    blockchainHash: '0x3a4b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b'
  },
  {
    id: 'REQ-2024-103',
    title: 'Pediatric First Aid Kits & Chronic Medication Support',
    category: 'Medical & Healthcare',
    categoryId: 'medical',
    beneficiaryName: 'Dr. Amina Touré (Volunteer Clinic)',
    beneficiaryId: 'USR-BEN-103',
    location: 'Hope Mobile Health Unit, Ward 7',
    beneficiariesCount: 120,
    urgency: 'High',
    estimatedBudget: 1800,
    fundsRaised: 900,
    status: 'Approved',
    createdAt: '2024-11-02T14:00:00Z',
    description: 'Providing primary health triage and basic pediatric antibiotic ointments, oral rehydration salts, fever reducers, and sterile dressings for underprivileged families without health insurance.',
    itemsList: [
      { name: 'Sterile Wound Dressing & Bandage Rolls', qty: '60 kits', estCost: 480 },
      { name: 'Pediatric Antipyretic & Rehydration Salts', qty: '120 sets', estCost: 720 },
      { name: 'Digital Infrared Thermometers & PPE sets', qty: '15 units', estCost: 600 }
    ],
    aiScore: 86,
    aiAnalysis: {
      score: 86,
      priorityLevel: 'High Priority',
      vulnerabilityIndex: '8.6 / 10.0',
      aiConfidence: '99.1%',
      flagged: false,
      summaryReason: 'Medical clinic accreditation confirmed. Verified community health gap.'
    },
    verificationDocuments: [
      { name: 'medical_license_clinic_cert.pdf', size: '1.8 MB' }
    ],
    donors: [
      { name: 'Dr. Robert Patel', amount: 500, date: '2024-11-03T09:45:00Z' },
      { name: 'Caring Hands Guild', amount: 400, date: '2024-11-04T11:15:00Z' }
    ],
    assignedSupplier: 'PharmTrust Distribution Hub',
    blockchainHash: '0x71e9a2b84c6f3d105a8b7c9e2f4a3d6b1c8e5f0a'
  },
  {
    id: 'REQ-2024-104',
    title: 'Back-to-School Learning Packs & Textbooks for Primary Students',
    category: 'Education & Learning',
    categoryId: 'education',
    beneficiaryName: 'Kwame Osei (Principal)',
    beneficiaryId: 'USR-BEN-104',
    location: 'Oakwood Community Elementary',
    beneficiariesCount: 52,
    urgency: 'Medium',
    estimatedBudget: 950,
    fundsRaised: 420,
    status: 'Approved',
    createdAt: '2024-11-01T10:00:00Z',
    description: 'Supplying low-income Grade 1-5 students with durable backpacks, math geometry sets, notebooks, reading primers, and colored pencils for the new semester.',
    itemsList: [
      { name: 'Ergonomic Backpacks with Stationery Sets', qty: '52 packs', estCost: 650 },
      { name: 'Grade 1-5 STEM Starter Workbooks', qty: '52 sets', estCost: 300 }
    ],
    aiScore: 68,
    aiAnalysis: {
      score: 68,
      priorityLevel: 'Moderate Priority',
      vulnerabilityIndex: '6.8 / 10.0',
      aiConfidence: '94.8%',
      flagged: false,
      summaryReason: 'Standard seasonal community education need. High educational uplift index.'
    },
    verificationDocuments: [
      { name: 'school_enrollment_roster_anonymized.pdf', size: '3.1 MB' }
    ],
    donors: [
      { name: 'Bookworm Tech Collective', amount: 300, date: '2024-11-02T15:10:00Z' },
      { name: 'Linda Meyer', amount: 120, date: '2024-11-03T17:40:00Z' }
    ],
    assignedSupplier: 'Scholastic Direct Supply Inc',
    blockchainHash: '0x94f1c7d2e8b0a3c5e6f8a1b2c3d4e5f6a7b8c9d0'
  },
  {
    id: 'REQ-2024-105',
    title: 'Clean Drinking Water Filtration Kits & Chlorine Tablets',
    category: 'Hygiene & Clean Water',
    categoryId: 'hygiene',
    beneficiaryName: 'Lucia Morales',
    beneficiaryId: 'USR-BEN-105',
    location: 'West Ridge Settlement, Block C',
    beneficiariesCount: 80,
    urgency: 'Critical',
    estimatedBudget: 1300,
    fundsRaised: 250,
    status: 'Approved',
    createdAt: '2024-11-05T07:15:00Z',
    description: 'Municipal water pipeline burst caused temporary contamination in localized wells. Need gravity-fed ceramic water filters and water purifying tablets while municipal repairs continue.',
    itemsList: [
      { name: 'Gravity Ceramic Water Filters (10L)', qty: '16 units', estCost: 880 },
      { name: 'Aquatabs Water Purification Packets (500ct)', qty: '12 boxes', estCost: 420 }
    ],
    aiScore: 89,
    aiAnalysis: {
      score: 89,
      priorityLevel: 'Critical Priority',
      vulnerabilityIndex: '8.9 / 10.0',
      aiConfidence: '96.9%',
      flagged: false,
      summaryReason: 'Water security incident verified against regional water advisory notice.'
    },
    verificationDocuments: [
      { name: 'boil_water_advisory_bulletin.pdf', size: '920 KB' }
    ],
    donors: [
      { name: 'AquaSafe Alliance', amount: 250, date: '2024-11-05T13:20:00Z' }
    ],
    assignedSupplier: 'PureFlow Relief Technologies',
    blockchainHash: '0x1c8e5f0a71e9a2b84c6f3d105a8b7c9e2f4a3d6b'
  },
  {
    id: 'REQ-2024-106',
    title: 'Thermal Winter Jackets and Boots for Unhoused Youths',
    category: 'Warm Clothing',
    categoryId: 'clothing',
    beneficiaryName: 'Tariq Al-Mansoor',
    beneficiaryId: 'USR-BEN-106',
    location: 'Downtown Youth Drop-in Shelter',
    beneficiariesCount: 30,
    urgency: 'High',
    estimatedBudget: 1100,
    fundsRaised: 0,
    status: 'Pending Review',
    createdAt: '2024-11-05T18:40:00Z',
    description: 'Winter temperatures dropping below freezing overnight. 30 youth clients need waterproof insulated winter parkas, thermal socks, and weather-resistant boots to prevent frostbite.',
    itemsList: [
      { name: 'Waterproof Thermal Parkas', qty: '30 units', estCost: 750 },
      { name: 'Heavy-Duty Winter Grip Boots', qty: '30 pairs', estCost: 350 }
    ],
    aiScore: 78,
    aiAnalysis: {
      score: 78,
      priorityLevel: 'High Priority',
      vulnerabilityIndex: '7.8 / 10.0',
      aiConfidence: '93.5%',
      flagged: false,
      summaryReason: 'Pending admin validation of youth shelter partnership agreement.'
    },
    verificationDocuments: [
      { name: 'dropin_shelter_registry.pdf', size: '1.5 MB' }
    ],
    donors: [],
    assignedSupplier: 'Pending Supplier Match',
    blockchainHash: '0xpending_admin_audit_verification_hash'
  },
  {
    id: 'REQ-2024-107',
    title: 'Disaster Relief Pack for Storm Evacuees',
    category: 'Food & Nutrition',
    categoryId: 'food',
    beneficiaryName: 'Jordan Vance',
    beneficiaryId: 'USR-BEN-107',
    location: 'Coastal Evacuation Camp #2',
    beneficiariesCount: 110,
    urgency: 'Critical',
    estimatedBudget: 2800,
    fundsRaised: 0,
    status: 'Pending Review',
    createdAt: '2024-11-06T06:10:00Z',
    description: 'Recent tropical gale displaced coastal fishing village residents. Requesting emergency ready-to-eat calorie meal kits, clean bottled water pallets, and baby wipes.',
    itemsList: [
      { name: 'MRE Ready-to-Eat Calorie Meal Packs', qty: '220 packs', estCost: 1760 },
      { name: 'Bottled Mineral Water (Pallet of 1,200 bottles)', qty: '2 pallets', estCost: 640 },
      { name: 'Sanitary Wipes & Infant Care Kits', qty: '40 bundles', estCost: 400 }
    ],
    aiScore: 96,
    aiAnalysis: {
      score: 96,
      priorityLevel: 'Critical Priority',
      vulnerabilityIndex: '9.6 / 10.0',
      aiConfidence: '99.4%',
      flagged: false,
      summaryReason: 'AI matches FEMA storm path coordinates. High volume of vulnerable evacuees.'
    },
    verificationDocuments: [
      { name: 'evacuation_manifesto_st_jude.pdf', size: '2.1 MB' }
    ],
    donors: [],
    assignedSupplier: 'Red Shield Logistics',
    blockchainHash: '0xpending_admin_audit_verification_hash'
  }
];

