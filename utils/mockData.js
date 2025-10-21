import { Images } from '../constants/Images';

export const mockEvents = [
  {
    id: '1',
    title: 'Digital Transformation Summit 2025',
    description: 'Leading conference on digital innovation across industries',
    date: '2025-02-15',
    imageUrl: Images.event1,
    joinLink: 'support@techforward.net',
    location: 'San Francisco, CA',
    industry: 'Technology',
    company: 'TechForward Inc.',
    attendees: 450,
    type: 'conference'
  },
  {
    id: '2',
    title: 'Sustainable Manufacturing Workshop',
    description: 'Hands-on workshop for sustainable practices in manufacturing',
    date: '2025-02-20',
    imageUrl: Images.event2,
    joinLink: 'contact@greenmanufacturing.org',
    location: 'Detroit, MI',
    industry: 'Manufacturing',
    company: 'Green Manufacturing Co.',
    attendees: 85,
    maxAttendees: 100,
    type: 'workshop'
  },
  {
    id: '3',
    title: 'Healthcare Innovation Network',
    description: 'Networking event for healthcare professionals and innovators',
    date: '2025-02-25',
    imageUrl: Images.event3,
    location: 'Boston, MA',
    industry: 'Healthcare',
    company: 'MedInnovate',
    attendees: 200,
    maxAttendees: 250,
    type: 'networking'
  },
  {
    id: '4',
    title: 'Financial Services Seminar',
    description: 'Latest trends and regulations in financial services',
    date: '2025-03-01',
    imageUrl: Images.event4,
    joinLink: 'support@financefirst.net',
    location: 'New York, NY',
    industry: 'Finance',
    company: 'FinanceFirst',
    attendees: 150,
    maxAttendees: 200,
    type: 'seminar'
  },
  {
    id: '5',
    title: 'Renewable Energy Conference',
    description: 'Exploring the future of sustainable energy solutions',
    date: '2025-03-05',
    imageUrl: Images.event5,
    location: 'Austin, TX',
    industry: 'Energy',
    company: 'GreenTech Solutions',
    attendees: 320,
    maxAttendees: 400,
    type: 'conference'
  },
  {
    id: '6',
    title: 'Agricultural Innovation Workshop',
    description: 'Modern farming techniques and sustainable agriculture',
    date: '2025-03-10',
    imageUrl: Images.event5,
    location: 'Des Moines, IA',
    industry: 'Agriculture',
    company: 'AgriTech Corp',
    attendees: 75,
    maxAttendees: 120,
    type: 'workshop'
  }
];

export const mockVacancies = [
  {
    id: '1',
    industry: 'Technology',
    type: 'full-time',
    description: 'Join our team to optimize manufacturing processes and implement lean manufacturing principles.',
    imageUrl: Images.vacancy1,
    postedDate: '2025-01-15',
    recruitmentEmail: 'mdzeshh@gmail.com'
  },
  {
    id: '2',
    industry: 'Manufacturing',
    type: 'full-time',
    description: 'We are looking for a senior software engineer to join our growing team and lead development of our core platform.',
    imageUrl: Images.vacancy2,
    postedDate: '2025-01-18',
  },
  {
    id: '3',
    industry: 'Healthcare',
    type: 'full-time',
    imageUrl: Images.vacancy3,
    postedDate: '2025-01-20',
    recruitmentEmail: 'mdzeshh@gmail.com'
  },
  {
    id: '4',
    industry: 'Marketing',
    type: 'full-time',
    imageUrl: Images.vacancy4,
    postedDate: '2025-01-22'
  },
  {
    id: '5',
    industry: 'Education',
    type: 'full-time',
    imageUrl: Images.vacancy5,
    postedDate: '2025-01-25',
    recruitmentEmail: 'mdzeshh@gmail.com'
  },
  {
    id: '6',
    industry: 'Manufacturing',
    type: 'part-time',
    description: 'Coordinate clinical trials and ensure compliance with regulatory requirements.',
    imageUrl: Images.vacancy6,
    postedDate: '2025-01-25'
  },
  {
    id: '7',
    industry: 'Oil & Gas',
    type: 'part-time',
    description: 'Lead marketing campaigns and brand strategy for diverse client portfolio.',
    imageUrl: Images.vacancy7,
    postedDate: '2025-01-25',
    recruitmentEmail: 'mdzeshh@gmail.com'
  },
  {
    id: '8',
    industry: 'Education',
    type: 'full-time',
    imageUrl: Images.vacancy8,
    postedDate: '2025-01-25'
  },
  {
    id: '9',
    industry: 'Finance',
    type: 'full-time',
    imageUrl: Images.vacancy9,
    postedDate: '2025-01-25',
    recruitmentEmail: 'mdzeshh@gmail.com'
  },
  {
    id: '10',
    industry: 'Marketing',
    type: 'full-time',
    description: 'Passionate educator needed for 3rd grade classroom with focus on STEM integration.',
    imageUrl: Images.vacancy10,
    postedDate: '2025-01-25',
    recruitmentEmail: 'mdzeshh@gmail.com'
  },
  {
    id: '11',
    industry: 'Energy',
    type: 'part-time',
    imageUrl: Images.vacancy11,
    postedDate: '2025-01-25'
  }
];

export const mockTenders = [
  {
    id: '1',
    imageUrl: Images.tender1,
    industry: 'Technology',
    description: 'Development of a comprehensive enterprise resource planning system with modern technologies.',
    enquiryEmail: 'tenders@company.com',
    postedDate: '2025-01-10',
  },
  {
    id: '2',
    imageUrl: Images.tender2,
    industry: 'Manufacturing',
    description: 'Design and implementation of automated manufacturing line with IoT integration.',
    enquiryEmail: 'tenders@company.com',
    postedDate: '2025-01-05',
  },
  {
    id: '3',
    imageUrl: Images.tender3,
    industry: 'Healthcare',
    description: 'Complete hospital management system with patient records, billing, and scheduling.',
    postedDate: '2025-01-12',
  },
  {
    id: '4',
    imageUrl: Images.tender4,
    industry: 'Energy',
    description: 'Solar panel installation and grid integration for municipal buildings.',
    enquiryEmail: 'tenders@company.com',
    postedDate: '2025-01-08',
  },
  {
    id: '5',
    imageUrl: Images.tender5,
    industry: 'Agriculture',
    postedDate: '2025-01-08',
  },
  {
    id: '6',
    imageUrl: Images.tender6,
    industry: 'Glass & Ceramics',
    description: 'Solar panel installation and grid integration for municipal buildings.',
    enquiryEmail: 'tenders@company.com',
    postedDate: '2025-01-08',
  },
  {
    id: '7',
    imageUrl: Images.tender7,
    industry: 'Construction',
    description: 'Complete hospital management system with patient records, billing, and scheduling.',
    enquiryEmail: 'tenders@company.com',
    postedDate: '2025-01-08',
  },
  {
    id: '8',
    imageUrl: Images.tender8,
    industry: 'Transportation',
    postedDate: '2025-01-08',
  },
  {
    id: '9',
    imageUrl: Images.tender9,
    industry: 'Retail',
    enquiryEmail: 'tenders@company.com',
    postedDate: '2025-01-08',
  },
  {
    id: '10',
    imageUrl: Images.tender10,
    industry: 'Telecommunications',
    postedDate: '2025-01-08',
  },
  {
    id: '11',
    imageUrl: Images.tender11,
    industry: 'Government',
    description: 'Complete hospital management system with patient records, billing, and scheduling.',
    postedDate: '2025-01-08',
  },
  {
    id: '12',
    imageUrl: Images.tender12,
    industry: 'Fashion',
    description: 'Development of a comprehensive enterprise resource planning system with modern technologies.',
    enquiryEmail: 'tenders@company.com',
    postedDate: '2025-01-08',
  }
];

export const mockInternships = [
  {
    id: '1',
    imageUrl: Images.intern1,
    industry: 'Technology',
    description: 'Development of a comprehensive enterprise resource planning system with modern technologies.',
    enquiryEmail: 'tenders@company.com',
    postedDate: '2025-01-10',
  },
  {
    id: '2',
    imageUrl: Images.intern2,
    industry: 'Manufacturing',
    description: 'Design and implementation of automated manufacturing line with IoT integration.',
    enquiryEmail: 'tenders@company.com',
    postedDate: '2025-01-05',
  },
  {
    id: '3',
    imageUrl: Images.intern3,
    industry: 'Healthcare',
    description: 'Complete hospital management system with patient records, billing, and scheduling.',
    postedDate: '2025-01-12',
  },
  {
    id: '4',
    imageUrl: Images.intern4,
    industry: 'Energy',
    description: 'Solar panel installation and grid integration for municipal buildings.',
    enquiryEmail: 'tenders@company.com',
    postedDate: '2025-01-08',
  },
  {
    id: '5',
    imageUrl: Images.intern5,
    industry: 'Agriculture',
    postedDate: '2025-01-08',
  },
  {
    id: '6',
    imageUrl: Images.intern6,
    industry: 'Education',
    description: 'Solar panel installation and grid integration for municipal buildings.',
    enquiryEmail: 'tenders@company.com',
    postedDate: '2025-01-08',
  },
  {
    id: '7',
    imageUrl: Images.intern7,
    industry: 'Engineering',
    description: 'Complete hospital management system with patient records, billing, and scheduling.',
    enquiryEmail: 'tenders@company.com',
    postedDate: '2025-01-08',
  }
];

export const mockProfiles = [
  {
    id: '1',
    name: 'Sarah Johnson',
    title: 'Senior Software Engineer',
    company: 'TechInnovate Corp',
    location: 'San Francisco, CA',
    industry: 'Technology',
    experience: '8 years',
    email: 'sarah.johnson@techinnovate.com',
    phone: '+1 (415) 555-0123',
    whatsapp: '+1 (415) 555-0123',
    acquiredSkills: ['React', 'TypeScript', 'Node.js', 'AWS', 'PostgreSQL', 'Docker'],
    innateSkills: ['Problem Solving', 'Critical Thinking', 'Leadership', 'Communication'],
    domesticSkills: ['Time Management', 'Organization', 'Multitasking'],
    achievements: [
      'Led team of 12 developers on flagship product',
      'Reduced system latency by 40%',
      'AWS Certified Solutions Architect'
    ],
    education: 'BS Computer Science, Stanford University',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sarahjohnson',
      github: 'https://github.com/sarahjohnson',
      twitter: 'https://twitter.com/sarahjohnson',
      website: 'https://sarahjohnson.dev'
    },
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    isAvailableForWork: false
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    title: 'Manufacturing Operations Manager',
    company: 'Industrial Dynamics',
    location: 'Detroit, MI',
    industry: 'Manufacturing',
    experience: '12 years',
    email: 'michael.rodriguez@industrialdynamics.com',
    phone: '+1 (313) 555-0456',
    whatsapp: '+1 (313) 555-0456',
    acquiredSkills: ['Lean Manufacturing', 'Six Sigma', 'Quality Control', 'Supply Chain'],
    innateSkills: ['Team Leadership', 'Strategic Thinking', 'Attention to Detail'],
    domesticSkills: ['Project Management', 'Budgeting', 'Scheduling'],
    achievements: [
      'Implemented lean processes reducing waste by 25%',
      'Black Belt Six Sigma certification',
      'Managed $50M+ manufacturing operations'
    ],
    education: 'MS Industrial Engineering, University of Michigan',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/michaelrodriguez',
      twitter: 'https://twitter.com/mrodriguez'
    },
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
    isAvailableForWork: true
  },
  {
    id: '3',
    name: 'Dr. Emily Chen',
    title: 'Clinical Research Director',
    company: 'BioPharma Solutions',
    location: 'Boston, MA',
    industry: 'Healthcare',
    experience: '15 years',
    email: 'emily.chen@biopharmasolutions.com',
    phone: '+1 (617) 555-0789',
    whatsapp: '+1 (617) 555-0789',
    acquiredSkills: ['Clinical Trials', 'FDA Regulations', 'Biostatistics', 'Protocol Development'],
    innateSkills: ['Analytical Thinking', 'Research Methodology', 'Team Management'],
    domesticSkills: ['Documentation', 'Compliance Management', 'Data Organization'],
    achievements: [
      'Led 20+ successful clinical trials',
      'Published 45+ peer-reviewed papers',
      'FDA Breakthrough Therapy designation'
    ],
    education: 'PhD Biomedical Sciences, Harvard Medical School',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/emilychen',
      website: 'https://dremilychen.com'
    },
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    isAvailableForWork: false
  },
  {
    id: '4',
    name: 'David Thompson',
    title: 'Financial Analyst',
    company: 'Investment Partners LLC',
    location: 'New York, NY',
    industry: 'Finance',
    experience: '6 years',
    email: 'david.thompson@investmentpartners.com',
    phone: '+1 (212) 555-0321',
    whatsapp: '+1 (212) 555-0321',
    acquiredSkills: ['Financial Modeling', 'Risk Analysis', 'Excel', 'Python', 'Bloomberg Terminal'],
    innateSkills: ['Analytical Thinking', 'Risk Assessment', 'Portfolio Management'],
    domesticSkills: ['Data Management', 'Report Writing', 'Client Communication'],
    achievements: [
      'CFA Charterholder',
      'Generated 15% alpha on managed portfolio',
      'Led M&A analysis for $2B+ deals'
    ],
    education: 'MBA Finance, Wharton School',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/davidthompson',
      twitter: 'https://twitter.com/dthompsonfinance'
    },
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    isAvailableForWork: true
  },
  {
    id: '5',
    name: 'Maria Garcia',
    title: 'Marketing Director',
    company: 'Brand Innovators',
    location: 'Miami, FL',
    industry: 'Marketing',
    experience: '10 years',
    email: 'maria.garcia@brandinnovators.com',
    phone: '+1 (305) 555-0654',
    whatsapp: '+1 (305) 555-0654',
    acquiredSkills: ['Digital Marketing', 'Brand Strategy', 'Social Media', 'Analytics'],
    innateSkills: ['Creativity', 'Strategic Thinking', 'Content Creation'],
    domesticSkills: ['Campaign Management', 'Client Relations', 'Budget Planning'],
    achievements: [
      'Increased brand awareness by 300%',
      'Google Ads certified professional',
      'Led campaigns generating $10M+ revenue'
    ],
    education: 'MBA Marketing, University of Miami',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/mariagarcia',
      instagram: 'https://instagram.com/mariagarcia_marketing',
      twitter: 'https://twitter.com/mariagarcia',
      website: 'https://mariagarcia.marketing'
    },
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    isAvailableForWork: false
  },
  {
    id: '6',
    name: 'James Wilson',
    title: 'Elementary School Principal',
    company: 'Riverside Elementary',
    location: 'Seattle, WA',
    industry: 'Education',
    experience: '18 years',
    email: 'james.wilson@riversideelementary.edu',
    phone: '+1 (206) 555-0987',
    whatsapp: '+1 (206) 555-0987',
    acquiredSkills: ['Educational Leadership', 'Curriculum Development', 'Teacher Training'],
    innateSkills: ['Leadership', 'Communication', 'Student Assessment'],
    domesticSkills: ['Administrative Management', 'Event Planning', 'Community Outreach'],
    achievements: [
      'Improved school test scores by 40%',
      'Principal of the Year Award 2023',
      'Implemented innovative STEM program'
    ],
    education: 'EdD Educational Leadership, University of Washington',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/jameswilson',
      twitter: 'https://twitter.com/principalwilson'
    },
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
    isAvailableForWork: true
  },
  {
    id: '7',
    name: 'Lisa Park',
    title: 'Renewable Energy Engineer',
    company: 'SolarTech Solutions',
    location: 'Phoenix, AZ',
    industry: 'Energy',
    experience: '7 years',
    email: 'lisa.park@solartech.com',
    phone: '+1 (602) 555-0147',
    whatsapp: '+1 (602) 555-0147',
    acquiredSkills: ['Solar Design', 'Grid Integration', 'Energy Storage', 'Project Management'],
    innateSkills: ['Problem Solving', 'Innovation', 'Sustainability Thinking'],
    domesticSkills: ['Technical Documentation', 'Client Presentations', 'Regulatory Compliance'],
    achievements: [
      'Designed 50+ MW solar installations',
      'NABCEP certified solar professional',
      'Reduced project costs by 20%'
    ],
    education: 'MS Renewable Energy Engineering, Arizona State University',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/lisapark',
      github: 'https://github.com/lisapark',
      website: 'https://lisapark.energy'
    },
    avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=400',
    isAvailableForWork: false
  },
  {
    id: '8',
    name: 'Robert Brown',
    title: 'Agricultural Specialist',
    company: 'FarmTech Innovations',
    location: 'Des Moines, IA',
    industry: 'Agriculture',
    experience: '14 years',
    email: 'robert.brown@farmtech.com',
    phone: '+1 (515) 555-0258',
    whatsapp: '+1 (515) 555-0258',
    acquiredSkills: ['Crop Management', 'Precision Agriculture', 'Soil Science', 'Irrigation Systems'],
    innateSkills: ['Data Analysis', 'Environmental Awareness', 'Innovation'],
    domesticSkills: ['Farm Management', 'Equipment Maintenance', 'Record Keeping'],
    achievements: [
      'Increased crop yields by 35%',
      'Certified Crop Advisor',
      'Pioneered drone-based crop monitoring'
    ],
    education: 'MS Agronomy, Iowa State University',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/robertbrown',
      twitter: 'https://twitter.com/agritech_rob'
    },
    avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=400',
    isAvailableForWork: true
  }
];

export const allIndustries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Education',
  'Marketing',
  'Energy',
  'Agriculture',
  'Construction',
  'Transportation',
  'Retail',
  'Hospitality',
  'Real Estate',
  'Legal',
  'Consulting',
  'Media',
  'Telecommunications',
  'Automotive',
  'Aerospace',
  'Biotechnology',
  'Pharmaceuticals',
  'Food & Beverage',
  'Fashion',
  'Sports',
  'Non-profit',
  'Government',
  'Insurance',
  'Banking',
  'Entertainment',
  'Gaming',
  'Other'
];

// Supply Chain
export const mockVendors = [
  {
    id: '1',
    name: 'Thabo\'s Fresh Vegetables',
    type: 'Street Vendor',
    category: 'Vegetables',
    description: 'Fresh vegetables from local farms',
    location: {
      latitude: -26.3051,
      longitude: 31.1367,
      address: 'Mbabane Market Square',
      area: 'Mbabane'
    },
    contact: {
      phone: '+268 2400 1234',
      whatsapp: '+268 2400 1234'
    },
    workingHours: {
      monday: '06:00-18:00',
      tuesday: '06:00-18:00',
      wednesday: '06:00-18:00',
      thursday: '06:00-18:00',
      friday: '06:00-18:00',
      saturday: '06:00-14:00',
      sunday: 'Closed'
    },
    rating: 4.5,
    reviewCount: 23,
    deliveryRadius: 5,
    isOnline: true,
    joinedDate: '2023-01-15',
    profileImage: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    stock: [
      { item: 'Tomatoes', price: 15, unit: 'per kg', available: true },
      { item: 'Onions', price: 12, unit: 'per kg', available: true },
      { item: 'Carrots', price: 18, unit: 'per kg', available: false }
    ]
  },
  {
    id: '2',
    name: 'Sipho\'s Mobile Kitchen',
    type: 'Street Vendor',
    category: 'Food & Beverages',
    description: 'Traditional Swazi meals and snacks',
    location: {
      latitude: -26.3186,
      longitude: 31.1417,
      address: 'Manzini Industrial Area',
      area: 'Manzini'
    },
    contact: {
      phone: '+268 2505 5678',
      whatsapp: '+268 2505 5678'
    },
    workingHours: {
      monday: '07:00-19:00',
      tuesday: '07:00-19:00',
      wednesday: '07:00-19:00',
      thursday: '07:00-19:00',
      friday: '07:00-19:00',
      saturday: '08:00-15:00',
      sunday: 'Closed'
    },
    rating: 4.8,
    reviewCount: 45,
    deliveryRadius: 8,
    isOnline: true,
    joinedDate: '2023-02-20',
    profileImage: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
    stock: [
      { item: 'Traditional Stew', price: 35, unit: 'per plate', available: true },
      { item: 'Fresh Bread', price: 8, unit: 'per loaf', available: true },
      { item: 'Local Tea', price: 5, unit: 'per cup', available: true }
    ]
  },
  {
    id: '3',
    name: 'Nomsa\'s Craft Shop',
    type: 'Small Shop',
    category: 'Handicrafts',
    description: 'Traditional Swazi crafts and souvenirs',
    location: {
      latitude: -26.3051,
      longitude: 31.1367,
      address: 'Ezulwini Valley',
      area: 'Ezulwini'
    },
    contact: {
      phone: '+268 2416 9012',
      whatsapp: '+268 2416 9012'
    },
    workingHours: {
      monday: '09:00-17:00',
      tuesday: '09:00-17:00',
      wednesday: '09:00-17:00',
      thursday: '09:00-17:00',
      friday: '09:00-17:00',
      saturday: '09:00-16:00',
      sunday: '10:00-14:00'
    },
    rating: 4.2,
    reviewCount: 18,
    deliveryRadius: 15,
    isOnline: false,
    joinedDate: '2023-03-10',
    profileImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    stock: [
      { item: 'Traditional Baskets', price: 120, unit: 'each', available: true },
      { item: 'Wooden Carvings', price: 80, unit: 'each', available: true },
      { item: 'Beaded Jewelry', price: 45, unit: 'each', available: false }
    ]
  }
];

export const mockBulkGroups = [
  {
    id: '1',
    name: 'Mbabane Vegetable Collective',
    category: 'Vegetables',
    description: 'Bulk buying group for fresh vegetables',
    leader: 'Thabo Dlamini',
    memberCount: 12,
    minOrder: 500,
    savings: 15,
    nextOrderDate: '2024-01-15',
    area: 'Mbabane',
    requirements: 'Minimum 6 months business operation',
    benefits: ['15% bulk discount', 'Weekly delivery', 'Quality guarantee']
  },
  {
    id: '2',
    name: 'Manzini Food Suppliers',
    category: 'Food & Beverages',
    description: 'Bulk purchasing for food vendors',
    leader: 'Sipho Mamba',
    memberCount: 8,
    minOrder: 800,
    savings: 20,
    nextOrderDate: '2024-01-20',
    area: 'Manzini',
    requirements: 'Valid business license required',
    benefits: ['20% bulk discount', 'Bi-weekly delivery', 'Freshness guarantee']
  }
];

export const mockSuppliers = [
  {
    id: '1',
    name: 'Swazi Fresh Produce Co.',
    type: 'Wholesale',
    category: 'Vegetables',
    description: 'Large-scale supplier of fresh vegetables and fruits from local farms.',
    logo: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    contact: {
      phone: '+268 2528 3456',
      email: 'info@swazifreshproduce.com',
      whatsapp: '+268 2528 3456',
    },
    location: 'Malkerns',
    minOrder: 1000,
    deliveryAreas: ['Mbabane', 'Manzini', 'Ezulwini'],
    products: ['Fresh Vegetables', 'Herbs', 'Fruits'],
    marketingInfo: 'Committed to delivering farm-fresh produce with reliable delivery across major towns.',
    deals: [
      {
        id: 'sd1',
        title: 'Bulk Veggie Deal',
        desc: '15% off orders over SZL 2000',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      },
      {
        id: 'sd2',
        title: 'Free Delivery',
        desc: 'Free delivery on orders over SZL 1500',
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3a8dd22?w=400',
      },
    ],
    rating: 4.6,
    reviewCount: 50,
  },
  {
    id: '2',
    name: 'Royal Swazi Foods',
    type: 'Manufacturer',
    category: 'Processed Foods',
    description: 'Leading manufacturer of traditional Swazi foods and snacks.',
    logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
    contact: {
      phone: '+268 2518 7890',
      email: 'sales@royalswazifoods.com',
      whatsapp: '+268 2518 7890',
    },
    location: 'Matsapha',
    minOrder: 500,
    deliveryAreas: ['All major towns'],
    products: ['Traditional Foods', 'Snacks', 'Beverages'],
    marketingInfo: 'Authentic Swazi flavors crafted with quality ingredients for local and regional markets.',
    deals: [
      {
        id: 'sd3',
        title: 'Snack Combo Offer',
        desc: 'Buy 2 snack packs, get 1 free',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
      },
      {
        id: 'sd4',
        title: 'Bulk Beverage Deal',
        desc: '10% off beverage orders over SZL 1000',
        image: 'https://images.unsplash.com/photo-1604908177079-46b0f84b39c8?w=400',
      },
    ],
    rating: 4.2,
    reviewCount: 35,
  },
  {
    id: '3',
    name: 'Philas Stop Shop',
    type: 'Retailer',
    category: 'Food & Beverages',
    description: 'Timely supply with fast foods to Manzini locals.',
    logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
    contact: {
      phone: '+268 2518 7890',
      email: 'hotfoods@philastopshop.com',
      whatsapp: '+268 2518 7890',
    },
    location: 'Fair View',
    minOrder: 500,
    deliveryAreas: ['Fair View', 'Bus Rank', 'Nazarene', 'Ka-Khoza'],
    products: ['Traditional Foods', 'Snacks', 'Beverages'],
    marketingInfo: 'Authentic Swazi flavors crafted with quality ingredients for local and regional markets.',
    deals: [
      {
        id: 'sd3',
        title: 'Snack Combo Offer',
        desc: 'Buy 2 snack packs, get 1 free',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
      },
      {
        id: 'sd4',
        title: 'Bulk Beverage Deal',
        desc: '10% off beverage orders over SZL 1000',
        image: 'https://images.unsplash.com/photo-1604908177079-46b0f84b39c8?w=400',
      },
    ],
    rating: 4.2,
    reviewCount: 35,
  },
  {
    id: '4',
    name: 'Season Crafts',
    type: 'Manufacturer',
    category: 'Crafted',
    description: 'Leading manufacturer of traditional Swazi hand made crafts.',
    logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
    contact: {
      phone: '+268 2518 7890',
      email: 'swazistyle@seasoncrafts.com',
      whatsapp: '+268 2518 7890',
    },
    location: 'Madlangemphisi',
    minOrder: 200,
    deliveryAreas: ['Manzini', 'Matsapha', 'Mkhondvo', 'Mantenga'],
    products: ['Swazi Crafts', 'Wooden Ornaments', 'Swazi Beads'],
    marketingInfo: 'Authentic Swazi crafted ornaments with quality traditional materials for local and regional markets.',
    deals: [
      {
        id: 'sd3',
        title: 'Snack Combo Offer',
        desc: 'Buy 2 snack packs, get 1 free',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
      },
      {
        id: 'sd4',
        title: 'Bulk Beverage Deal',
        desc: '10% off beverage orders over SZL 1000',
        image: 'https://images.unsplash.com/photo-1604908177079-46b0f84b39c8?w=400',
      },
    ],
    rating: 4.2,
    reviewCount: 35,
  },
];

export const mockSupplierAdverts = [
  {
    id: 'ad-1',
    title: 'Combo A',
    desc: 'Rice + Oil + Sugar',
    image: 'https://images.unsplash.com/photo-1604908177079-46b0f84b39c8?w=1200'
  },
  {
    id: 'ad-2',
    title: 'Combo B',
    desc: 'Flour + Beans',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31b?w=1200'
  },
  {
    id: 'ad-3',
    title: '10% off Cooking Oil',
    desc: 'Limited time deal',
    image: 'https://images.unsplash.com/photo-1585238342028-4bbc2c23c2d5?w=1200'
  }
];

export const mockBrokers = [
  {
    id: 'b1',
    name: 'Industry Broker A',
    specialty: 'Agriculture, Logistics',
    description: 'Matching farmers with distributors for efficient supply chain solutions.',
    logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
    contact: {
      phone: '+268 2400 1234',
      email: 'contact@industrybrokera.com',
      whatsapp: '+268 2400 1234',
    },
    location: 'Mbabane',
    marketingInfo: 'Trusted partner for over 200 farmers, offering seamless logistics and distribution services.',
    deals: [
      { id: 'd1', title: 'Logistics Discount', desc: '20% off transport costs for bulk orders', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3a8dd22?w=400' },
      { id: 'd2', title: 'Free Consultation', desc: 'Free supply chain analysis for new clients', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400' },
    ],
    rating: 4.7,
    reviewCount: 30,
  },
  {
    id: 'b2',
    name: 'Intermediary B',
    specialty: 'Manufacturing, Packaging',
    description: 'Sourcing high-quality packaging solutions for small and medium enterprises.',
    logo: 'https://images.unsplash.com/photo-1587613864414-6a9e8d5296ca?w=400',
    contact: {
      phone: '+268 2505 5678',
      email: 'info@intermediaryb.com',
      whatsapp: '+268 2505 5678',
    },
    location: 'Manzini',
    marketingInfo: 'Specialized in eco-friendly packaging with a network of trusted manufacturers.',
    deals: [
      {
        id: 'd3', title: 'Eco-Pack Deal', desc: '10% off biodegradable packaging',
        image: 'https://images.unsplash.com/photo-1581579185617-3f072e5d3690?w=400'
      },
    ],
    rating: 4.5,
    reviewCount: 25,
  },
  {
    id: 'b3',
    name: 'Trade Link C',
    specialty: 'Import/Export',
    description: 'Facilitating cross-border shipments and customs clearance.',
    logo: 'https://images.unsplash.com/photo-1567427013953-1c0e560fbf19?w=400',
    contact: {
      phone: '+268 2416 9012',
      email: 'support@tradelinkc.com',
      whatsapp: '+268 2416 9012',
    },
    location: 'Matsapha',
    marketingInfo: 'Streamlined import/export services with a focus on compliance and efficiency.',
    deals: [
      {
        id: 'd4', title: 'Customs Fast-Track', desc: 'Priority customs clearance for urgent shipments',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'
      },
    ],
    rating: 4.8,
    reviewCount: 40,
  },
];

export const mockFinanceOffers = [
  {
    id: 'f1',
    name: 'Eswatini Bank',
    offer: 'SME Loans, 12% APR',
    description: 'Flexible financing solutions for small and medium enterprises.',
    logo: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400',
    contact: {
      phone: '+268 2404 5678',
      email: 'loans@eswatinibank.com',
      whatsapp: '+268 2404 5678',
    },
    location: 'Mbabane',
    marketingInfo: 'Empowering businesses with tailored financial products and dedicated support.',
    deals: [
      { id: 'fd1', title: 'SME Loan Offer', desc: 'Low-interest loans up to SZL 500,000', image: 'https://images.unsplash.com/photo-1556745753-b2904692b3cd?w=400' },
      { id: 'fd2', title: 'No-Fee Accounts', desc: 'Free business account setup for new clients', image: 'https://images.unsplash.com/photo-1567427013953-1c0e560fbf19?w=400' },
    ],
    rating: 4.6,
    reviewCount: 50,
  },
  {
    id: 'f2',
    name: 'Building Society',
    offer: 'Micro-loans up to SZL 20,000',
    description: 'Quick and easy micro-loans for small businesses and entrepreneurs.',
    logo: 'https://images.unsplash.com/photo-1567427013953-1c0e560fbf19?w=400',
    contact: {
      phone: '+268 2518 7890',
      email: 'info@buildingsociety.com',
      whatsapp: '+268 2518 7890',
    },
    location: 'Manzini',
    marketingInfo: 'Supporting small businesses with accessible financing and low rates.',
    deals: [
      { id: 'fd3', title: 'Micro-Loan Promo', desc: 'No repayment for first 3 months', image: 'https://images.unsplash.com/photo-1556745753-b2904692b3cd?w=400' },
    ],
    rating: 4.3,
    reviewCount: 35,
  },
  {
    id: 'f3',
    name: 'InstaCash',
    offer: 'POS machines, 0% setup fee',
    description: 'Modern payment solutions for businesses of all sizes.',
    logo: 'https://images.unsplash.com/photo-1556745753-b2904692b3cd?w=400',
    contact: {
      phone: '+268 2528 3456',
      email: 'support@instacash.com',
      whatsapp: '+268 2528 3456',
    },
    location: 'Ezulwini',
    marketingInfo: 'Seamless payment processing with cutting-edge POS technology.',
    deals: [
      { id: 'fd4', title: 'Free POS Setup', desc: 'Zero setup fees for new POS systems', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3a8dd22?w=400' },
    ],
    rating: 4.9,
    reviewCount: 60,
  },
];

export const mockCustomers = [
  {
    id: '1',
    name: 'John Mkhonta',
    type: 'Employee',
    location: 'Mbabane Industrial Area',
    preferences: ['Vegetables', 'Traditional Foods'],
    orderHistory: [
      { vendorId: '1', items: ['Tomatoes', 'Onions'], total: 27, date: '2024-01-10' },
      { vendorId: '2', items: ['Traditional Stew'], total: 35, date: '2024-01-08' }
    ]
  },
  {
    id: '2',
    name: 'Sarah Ndlovu',
    type: 'Individual',
    location: 'Ezulwini Valley',
    preferences: ['Handicrafts', 'Organic Vegetables'],
    orderHistory: [
      { vendorId: '3', items: ['Traditional Baskets'], total: 120, date: '2024-01-12' }
    ]
  }
];

export const mockOrders = [
  {
    id: '1',
    customerId: '1',
    vendorId: '1',
    items: [
      { name: 'Tomatoes', quantity: 2, price: 15, unit: 'kg' },
      { name: 'Onions', quantity: 1, price: 12, unit: 'kg' }
    ],
    total: 42,
    status: 'delivered',
    orderDate: '2024-01-10',
    deliveryDate: '2024-01-10',
    deliveryAddress: 'Mbabane Industrial Area, Building A'
  },
  {
    id: '2',
    customerId: '2',
    vendorId: '2',
    items: [
      { name: 'Traditional Stew', quantity: 2, price: 35, unit: 'plate' }
    ],
    total: 70,
    status: 'in_progress',
    orderDate: '2024-01-14',
    estimatedDelivery: '2024-01-14 12:30',
    deliveryAddress: 'Ezulwini Valley, House 123'
  }
];

export const mockCategories = [
  { id: '1', name: 'Tilimo', icon: '🥬', color: '#4CAF50' },
  { id: '2', name: 'Food & Beverages', icon: '🍲', color: '#FF9800' },
  { id: '3', name: 'Handicrafts', icon: '🎨', color: '#9C27B0' },
  { id: '4', name: 'Electronics', icon: '📱', color: '#2196F3' },
  { id: '5', name: 'Clothing', icon: '👕', color: '#E91E63' },
  { id: '6', name: 'Home & Garden', icon: '🏠', color: '#795548' }
];

export const mockAreas = [
  'Mbabane', 'Manzini', 'Ezulwini', 'Malkerns', 'Matsapha', 'Big Bend', 'Nhlangano', 'Siteki'
];