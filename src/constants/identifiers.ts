/**
 * Simple identifiers for courses and exams - easier to use than UUIDs
 */

export const COURSE_IDS = {
  // Engineering and Technology - Core Branches
  CSE: 'cse',                    // Computer Science Engineering
  MECHANICAL: 'mechanical',      // Mechanical Engineering
  
  // Engineering and Technology - Emerging Branches  
  AI_ML: 'ai-ml',               // Artificial Intelligence and Machine Learning
  
  // Other categories
  BBA: 'bba',                   // Business Administration
  BA_LLB: 'ba-llb',            // Integrated Law
  MBBS: 'mbbs',                // Medicine
  PHYSICS: 'physics'            // Pure Sciences
} as const;

export const EXAM_IDS = {
  // Engineering
  RRB_JE: 'rrb-je',            // Railway Recruitment Board Junior Engineer
  GATE: 'gate',                // Graduate Aptitude Test in Engineering
  JEE_MAIN: 'jee-main',        // Joint Entrance Examination Main
  JEE_ADVANCED: 'jee-advanced', // Joint Entrance Examination Advanced
  
  // Other categories
  UPSC_CSE: 'upsc-cse',        // Civil Services Examination
  SSC_CGL: 'ssc-cgl',          // Staff Selection Commission Combined Graduate Level
  CLAT: 'clat',                // Common Law Admission Test
  CAT: 'cat',                  // Common Admission Test
  NEET: 'neet'                 // National Eligibility cum Entrance Test
} as const;

export const SOURCE_TYPES = {
  COURSE: 'course',
  EXAM: 'exam'
} as const;

export const TOPIC_IDS = {
  // RRB JE Mechanical topics
  ENGINEERING_MECHANICS: 'engineering-mechanics',
  MATERIAL_SCIENCE: 'material-science',
  THERMAL_ENGINEERING: 'thermal-engineering',
  MACHINING_MACHINE_TOOLS: 'machining-machine-tools',
  STRENGTH_OF_MATERIALS: 'strength-of-materials',
  WELDING_TECHNOLOGY: 'welding-technology',
  GRINDING_FINISHING: 'grinding-finishing',
  METROLOGY_INSPECTION: 'metrology-inspection',
  FLUID_MECHANICS: 'fluid-mechanics',
  INDUSTRIAL_MANAGEMENT: 'industrial-management',
  
  // RRB JE Civil topics
  BUILDING_CONSTRUCTION: 'building-construction',
  SURVEYING: 'surveying',
  CONCRETE_TECHNOLOGY: 'concrete-technology',
  MASONRY_CONSTRUCTION: 'masonry-construction',
  FOUNDATION_ENGINEERING: 'foundation-engineering',
  TECHNICAL_DRAWING: 'technical-drawing',
  HYDRAULICS: 'hydraulics',
  TRANSPORTATION_ENGINEERING: 'transportation-engineering',
  ENVIRONMENTAL_ENGINEERING: 'environmental-engineering',
  GEOTECHNICAL_ENGINEERING: 'geotechnical-engineering',
  STRUCTURAL_ENGINEERING: 'structural-engineering',
  ESTIMATING_COSTING: 'estimating-costing',
  
  // RRB JE Electrical topics
  BASIC_CONCEPTS: 'basic-concepts',
  CIRCUIT_THEORY: 'circuit-theory',
  AC_FUNDAMENTALS: 'ac-fundamentals',
  MEASUREMENT_INSTRUMENTATION: 'measurement-instrumentation',
  ELECTRICAL_MACHINES: 'electrical-machines',
  POWER_GENERATION: 'power-generation',
  TRANSMISSION_DISTRIBUTION: 'transmission-distribution',
  SWITCHGEAR_PROTECTION: 'switchgear-protection',
  ELECTRICAL_INSTALLATION: 'electrical-installation',
  ESTIMATION_COSTING: 'estimation-costing',
  UTILIZATION_ELECTRICAL_ENERGY: 'utilization-electrical-energy'
} as const;

// Type definitions for TypeScript
export type CourseId = typeof COURSE_IDS[keyof typeof COURSE_IDS];
export type ExamId = typeof EXAM_IDS[keyof typeof EXAM_IDS];
export type SourceType = typeof SOURCE_TYPES[keyof typeof SOURCE_TYPES];
export type TopicId = typeof TOPIC_IDS[keyof typeof TOPIC_IDS];
