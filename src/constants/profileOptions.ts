export const COURSE_CATEGORIES = {
  "🧪 Engineering and Technology": {
    "Core Branches": [
      "Mechanical Engineering",
      "Electrical Engineering", 
      "Civil Engineering",
      "Computer Science Engineering",
      "Electronics and Communication Engineering",
      "Information Technology",
      "Chemical Engineering",
      "Aerospace Engineering",
      "Biomedical Engineering",
      "Mechatronics Engineering",
      "Industrial Engineering"
    ],
    "Emerging / Modern Branches": [
      "Artificial Intelligence and Machine Learning (AI & ML)",
      "Data Science",
      "Cybersecurity", 
      "Robotics Engineering",
      "Internet of Things (IoT)",
      "Blockchain Technology",
      "Cloud Computing",
      "Software Engineering",
      "Renewable Energy Engineering",
      "3D Printing and Additive Manufacturing"
    ]
  },
  "🏥 Medical and Health Sciences": [
    "MBBS (Medicine)",
    "BDS (Dental Surgery)",
    "BSc Nursing",
    "Pharmacy (BPharm / MPharm)",
    "Physiotherapy",
    "Medical Laboratory Technology",
    "Public Health",
    "Biotechnology",
    "Biomedical Science", 
    "Genetic Engineering",
    "Healthcare Informatics"
  ],
  "💼 Commerce and Management": [
    "BCom / MCom",
    "BBA / MBA",
    "Finance",
    "Marketing",
    "Human Resource Management",
    "International Business",
    "Accounting",
    "Business Analytics",
    "Entrepreneurship",
    "Financial Technology (FinTech)",
    "Digital Marketing",
    "Supply Chain Management"
  ],
  "🎓 Science": [
    "Physics",
    "Chemistry",
    "Mathematics",
    "Biology",
    "Statistics",
    "Environmental Science",
    "Computer Science",
    "Data Science",
    "Microbiology",
    "Biochemistry",
    "Artificial Intelligence",
    "Machine Learning",
    "Neuroscience",
    "Quantum Computing"
  ],
  "🎨 Arts and Humanities": [
    "History",
    "Political Science",
    "Sociology",
    "Psychology",
    "Philosophy",
    "Literature (English, Hindi, etc)",
    "Economics",
    "Geography",
    "Anthropology",
    "Digital Humanities"
  ],
  "⚖️ Law and Legal Studies": [
    "BA LLB",
    "BBA LLB",
    "LLB",
    "LLM",
    "Corporate Law",
    "Criminal Law",
    "International Law",
    "Constitutional Law",
    "Cyber Law",
    "Intellectual Property Law"
  ],
  "🌾 Agriculture and Allied Sciences": [
    "Agriculture",
    "Horticulture",
    "Forestry",
    "Fisheries Science",
    "Veterinary Science",
    "Dairy Technology",
    "Food Technology",
    "AgriTech",
    "Sustainable Agriculture"
  ],
  "🏛️ Education and Teaching": [
    "BEd",
    "MEd",
    "Educational Psychology",
    "Curriculum Development",
    "Teacher Training",
    "Educational Technology (EdTech)"
  ],
  "🖌️ Design, Architecture and Fine Arts": [
    "Architecture (BArch / MArch)",
    "Interior Design",
    "Fashion Design",
    "Graphic Design",
    "Industrial Design",
    "Fine Arts",
    "Animation",
    "Multimedia",
    "Game Design",
    "User Experience Design (UX Design)"
  ]
};

export const COMPETITIVE_EXAM_OPTIONS = [
  "RRB JE",
  "RRB ALP",
  "SSC JE", 
  "SSC CGL",
  "GATE",
  "UPSC Civil Services",
  "State PSC Exams",
  "ISRO Scientist/Engineer",
  "DRDO Scientist/Engineer",
  "BARC OCES",
  "Railway GDCE",
  "Bank PO",
  "Bank Clerk",
  "Other"
];

// RRB JE Engineering Branches and their subjects
export const RRB_JE_ENGINEERING_BRANCHES = {
  "Mechanical & Allied Engineering": [
    "Engineering Mechanics",
    "Material Science",
    "Strength of Materials",
    "Machining",
    "Welding",
    "Grinding & Finishing Process",
    "Metrology",
    "Fluid Mechanics & Hydraulic Machinery (FM & HM)",
    "Industrial Management",
    "Thermal Engineering"
  ],
  "Civil & Allied Engineering": [
    "Engineering Mechanics (Force, Equilibrium, Friction, Centroid, Simple Machines)",
    "Building Construction (Components, Types of Structure)",
    "Building Materials (Masonry, Timber, Glass, Plastic, Metals, etc.)",
    "Construction of Substructure (Job layout, Foundation, Earthwork)",
    "Construction of Superstructure (Masonry, Doors/Windows, Stairs, Scaffolding)",
    "Building Finishes (Floors, Walls, Roofs)",
    "Building Maintenance (Cracks, Settlement, Re-barring)",
    "Building Drawing (Plan, Elevation, Section, Perspective)",
    "Concrete Technology (Cement, Aggregates, Concrete Mix Design, Testing)",
    "Surveying (Chain, Compass, Leveling, Contouring, Theodolite, Plane Table, Curves)",
    "Computer Aided Design (CAD, 3D modeling, Plan/Elevation/Section generation)",
    "Geo Technical Engineering (Soil Properties, Foundation, Pavements, Site Investigation)",
    "Hydraulics & Irrigation Engineering",
    "Mechanics & Theory of Structures",
    "Design of Concrete & Steel Structures",
    "Transportation & Highway Engineering",
    "Environmental Engineering",
    "Advanced Construction Techniques & Equipment",
    "Estimating, Costing, Contracts & Accounts"
  ],
  "Electrical & Allied Engineering": [
    "Basic Concepts (Resistance, Inductance, Capacitance, Current, Voltage, Power)",
    "Circuit Laws & Magnetic Circuits",
    "AC Fundamentals, Polyphase System",
    "Measurement & Measuring Instruments",
    "Electrical Machines (DC, Transformers, Induction, Synchronous)",
    "Generation, Transmission, Distribution & Switchgear",
    "Estimation & Costing",
    "Utilization of Electrical Energy"
  ]
};

// Helper function to get all course options as a flat array
export const getAllCourseOptions = () => {
  const options: string[] = [];
  
  Object.entries(COURSE_CATEGORIES).forEach(([mainCategory, categoryData]) => {
    if (Array.isArray(categoryData)) {
      categoryData.forEach(course => {
        options.push(`${mainCategory} → ${course}`);
      });
    } else if (typeof categoryData === 'object') {
      Object.entries(categoryData).forEach(([groupName, items]) => {
        items.forEach(course => {
          options.push(`${mainCategory} → ${groupName}: ${course}`);
        });
      });
    }
  });
  
  return options;
};