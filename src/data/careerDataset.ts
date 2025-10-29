// Career Dataset mapped from neuropath_dataset
export interface CareerData {
  passion: string;
  relevantSkills: string[];
  courses: string[];
  institutions: string[];
  trainingPrograms: string[];
  careerPaths: Array<{
    title: string;
    description: string;
    tags: Array<{ label: string; color: string }>;
  }>;
}

export const careerDataset: { [key: string]: CareerData } = {
  'AI / Data Science': {
    passion: 'AI / Data Science',
    relevantSkills: ['Python Programming', 'Machine Learning', 'Statistical Analysis', 'Deep Learning', 'Data Visualization'],
    courses: ['Machine Learning Specialization', 'Deep Learning AI', 'Data Science Professional Certificate', 'Advanced AI & ML'],
    institutions: ['IIT Madras', 'IIT Bombay', 'IIIT Hyderabad', 'Coursera', 'Stanford Online'],
    trainingPrograms: ['Google AI Essentials', 'AWS Machine Learning', 'IBM Data Science', 'Microsoft AI Fundamentals', 'NVIDIA Deep Learning Institute', 'Kaggle Learn'],
    careerPaths: [
      {
        title: 'Machine Learning Engineer',
        description: 'Build and deploy ML models to solve real-world problems. High demand with excellent growth opportunities.',
        tags: [
          { label: 'High Demand', color: 'green' },
          { label: 'Remote Friendly', color: 'blue' }
        ]
      },
      {
        title: 'Data Scientist',
        description: 'Extract insights from data and build predictive models. Perfect blend of statistics and programming.',
        tags: [
          { label: 'Growing Field', color: 'green' },
          { label: 'Analytical', color: 'yellow' }
        ]
      },
      {
        title: 'AI Research Scientist',
        description: 'Conduct research in cutting-edge AI technologies. Work on innovative solutions and publish papers.',
        tags: [
          { label: 'Research Focused', color: 'purple' },
          { label: 'Innovative', color: 'blue' }
        ]
      }
    ]
  },
  'AI / Machine Learning': {
    passion: 'AI / Machine Learning',
    relevantSkills: ['Python Programming', 'TensorFlow/PyTorch', 'Neural Networks', 'Computer Vision', 'NLP'],
    courses: ['Machine Learning Specialization', 'Deep Learning Specialization', 'AI for Everyone', 'Advanced ML Techniques'],
    institutions: ['IIT Delhi', 'IISc Bangalore', 'Carnegie Mellon', 'MIT Online', 'Fast.ai'],
    trainingPrograms: ['TensorFlow Developer Certificate', 'PyTorch Fundamentals', 'Google ML Crash Course', 'Microsoft AI-900', 'Deep Learning Nanodegree', 'AI Engineering Bootcamp'],
    careerPaths: [
      {
        title: 'ML Engineer',
        description: 'Design and implement machine learning systems at scale.',
        tags: [
          { label: 'High Demand', color: 'green' },
          { label: 'Well Paid', color: 'blue' }
        ]
      },
      {
        title: 'Computer Vision Engineer',
        description: 'Build systems that can understand and process visual information.',
        tags: [
          { label: 'Cutting Edge', color: 'purple' },
          { label: 'Innovative', color: 'blue' }
        ]
      }
    ]
  },
  'Web Development': {
    passion: 'Web Development',
    relevantSkills: ['HTML/CSS/JavaScript', 'React/Angular/Vue', 'Node.js', 'Database Management', 'UI/UX Design'],
    courses: ['Full Stack Web Development', 'React - The Complete Guide', 'Node.js Bootcamp', 'Advanced JavaScript'],
    institutions: ['freeCodeCamp', 'The Odin Project', 'Udacity', 'Scrimba', 'Frontend Masters'],
    trainingPrograms: ['Meta Front-End Developer', 'IBM Full Stack Developer', 'Google UX Design', 'AWS Cloud Developer', 'MongoDB University', 'JavaScript Algorithms'],
    careerPaths: [
      {
        title: 'Full Stack Developer',
        description: 'Build complete web applications from frontend to backend.',
        tags: [
          { label: 'High Demand', color: 'green' },
          { label: 'Remote Friendly', color: 'blue' }
        ]
      },
      {
        title: 'Frontend Developer',
        description: 'Create beautiful and responsive user interfaces.',
        tags: [
          { label: 'Creative', color: 'purple' },
          { label: 'Growing Field', color: 'green' }
        ]
      }
    ]
  },
  'Full Stack Development': {
    passion: 'Full Stack Development',
    relevantSkills: ['JavaScript/TypeScript', 'React/Next.js', 'Node.js/Express', 'SQL/NoSQL', 'DevOps Basics'],
    courses: ['The Complete 2024 Web Development Bootcamp', 'Full Stack Open', 'MERN Stack Course', 'Advanced Web Development'],
    institutions: ['App Academy', 'Lambda School', 'General Assembly', 'Hack Reactor', 'Codecademy'],
    trainingPrograms: ['AWS Certified Developer', 'Meta Backend Developer', 'Full Stack Nanodegree', 'Docker & Kubernetes', 'CI/CD Mastery', 'System Design Fundamentals'],
    careerPaths: [
      {
        title: 'Full Stack Engineer',
        description: 'Work on all layers of web applications with modern technologies.',
        tags: [
          { label: 'Versatile', color: 'purple' },
          { label: 'High Demand', color: 'green' }
        ]
      },
      {
        title: 'Solutions Architect',
        description: 'Design scalable and efficient system architectures.',
        tags: [
          { label: 'Strategic', color: 'yellow' },
          { label: 'Well Paid', color: 'blue' }
        ]
      }
    ]
  },
  'Cybersecurity': {
    passion: 'Cybersecurity',
    relevantSkills: ['Network Security', 'Penetration Testing', 'Cryptography', 'Security Analysis', 'Ethical Hacking'],
    courses: ['Cybersecurity Specialization', 'Ethical Hacking', 'Network Security', 'Information Security'],
    institutions: ['EC-Council', 'SANS Institute', 'Cybrary', 'Offensive Security', 'ISC2'],
    trainingPrograms: ['CompTIA Security+', 'CEH Certification', 'CISSP Training', 'Penetration Testing', 'Bug Bounty Hunter', 'Security Operations'],
    careerPaths: [
      {
        title: 'Security Analyst',
        description: 'Monitor and protect systems from cyber threats.',
        tags: [
          { label: 'Critical Role', color: 'red' },
          { label: 'High Demand', color: 'green' }
        ]
      },
      {
        title: 'Penetration Tester',
        description: 'Test systems for vulnerabilities and security weaknesses.',
        tags: [
          { label: 'Exciting', color: 'purple' },
          { label: 'Well Paid', color: 'blue' }
        ]
      }
    ]
  },
  'Cyber / IT': {
    passion: 'Cyber / IT',
    relevantSkills: ['IT Infrastructure', 'Cloud Computing', 'Network Administration', 'Security Protocols', 'System Administration'],
    courses: ['IT Automation with Python', 'Cloud Computing Essentials', 'Network+', 'IT Security Fundamentals'],
    institutions: ['CompTIA', 'Microsoft Learn', 'Google IT', 'AWS Training', 'Cisco NetAcad'],
    trainingPrograms: ['AWS Cloud Practitioner', 'Microsoft Azure Fundamentals', 'Google IT Support', 'CompTIA A+', 'Linux Administration', 'CCNA Training'],
    careerPaths: [
      {
        title: 'IT Security Specialist',
        description: 'Implement and maintain security measures for IT infrastructure.',
        tags: [
          { label: 'Stable', color: 'green' },
          { label: 'Important', color: 'red' }
        ]
      },
      {
        title: 'Cloud Engineer',
        description: 'Manage and optimize cloud infrastructure and services.',
        tags: [
          { label: 'Growing Field', color: 'green' },
          { label: 'Modern', color: 'blue' }
        ]
      }
    ]
  },
  'Mechanical Engineering': {
    passion: 'Mechanical Engineering',
    relevantSkills: ['CAD Design', 'Thermodynamics', 'Manufacturing Processes', 'Materials Science', 'Mechanical Systems'],
    courses: ['Mechanical Engineering Fundamentals', 'CAD Modeling', 'Robotics Engineering', 'Advanced Manufacturing'],
    institutions: ['IIT Kharagpur', 'NIT Trichy', 'BITS Pilani', 'MIT OpenCourseWare', 'Purdue Online'],
    trainingPrograms: ['AutoCAD Certification', 'SolidWorks Training', 'CATIA Essentials', 'Robotics Process Automation', 'Manufacturing Excellence', 'Mechanical Design Pro'],
    careerPaths: [
      {
        title: 'Mechanical Design Engineer',
        description: 'Design and develop mechanical systems and components.',
        tags: [
          { label: 'Creative', color: 'purple' },
          { label: 'Stable', color: 'green' }
        ]
      },
      {
        title: 'Manufacturing Engineer',
        description: 'Optimize production processes and improve efficiency.',
        tags: [
          { label: 'Process Driven', color: 'yellow' },
          { label: 'Impact Driven', color: 'blue' }
        ]
      }
    ]
  },
  'Mechanical Design': {
    passion: 'Mechanical Design',
    relevantSkills: ['3D Modeling', 'Engineering Drawing', 'FEA Analysis', 'Product Design', 'Prototyping'],
    courses: ['Advanced CAD/CAM', 'Product Design & Development', 'Engineering Graphics', 'Design for Manufacturing'],
    institutions: ['Stanford Online', 'Georgia Tech', 'UC Berkeley Extension', 'Delft University', 'Autodesk University'],
    trainingPrograms: ['SolidWorks CSWA', 'Fusion 360 Mastery', 'ANSYS Training', '3D Printing & Prototyping', 'Design Thinking Workshop', 'CAD/CAM Advanced'],
    careerPaths: [
      {
        title: 'Product Design Engineer',
        description: 'Create innovative product designs from concept to production.',
        tags: [
          { label: 'Innovative', color: 'purple' },
          { label: 'Creative', color: 'blue' }
        ]
      },
      {
        title: 'CAD Specialist',
        description: 'Expert in creating detailed technical drawings and 3D models.',
        tags: [
          { label: 'Technical', color: 'yellow' },
          { label: 'Detail Oriented', color: 'green' }
        ]
      }
    ]
  },
  'Design / Architecture': {
    passion: 'Design / Architecture',
    relevantSkills: ['Architectural Design', 'Building Information Modeling', 'Sustainable Design', '3D Visualization', 'Urban Planning'],
    courses: ['Architecture Foundation', 'Sustainable Building Design', 'BIM for Architects', 'Interior Design'],
    institutions: ['MIT Architecture', 'Harvard GSD', 'Pratt Institute', 'Parsons School of Design', 'Rhode Island School'],
    trainingPrograms: ['Revit Architecture', 'SketchUp Pro', 'Lumion Visualization', 'Green Building Design', 'AutoCAD Architecture', 'Urban Design Fundamentals'],
    careerPaths: [
      {
        title: 'Architect',
        description: 'Design and plan buildings and structures.',
        tags: [
          { label: 'Creative', color: 'purple' },
          { label: 'Impactful', color: 'blue' }
        ]
      },
      {
        title: 'Interior Designer',
        description: 'Create functional and aesthetically pleasing interior spaces.',
        tags: [
          { label: 'Artistic', color: 'purple' },
          { label: 'Client Focused', color: 'green' }
        ]
      }
    ]
  },
  'Business Analytics': {
    passion: 'Business Analytics',
    relevantSkills: ['Data Analysis', 'SQL', 'Business Intelligence', 'Excel/Power BI', 'Statistical Modeling'],
    courses: ['Business Analytics Specialization', 'Data-Driven Decision Making', 'SQL for Business', 'Power BI Essentials'],
    institutions: ['Wharton Online', 'INSEAD', 'London Business School', 'IE Business School', 'Kellogg School'],
    trainingPrograms: ['Google Data Analytics', 'Microsoft Power BI Certification', 'Tableau Desktop Specialist', 'Business Intelligence Analyst', 'Advanced Excel', 'Data Storytelling'],
    careerPaths: [
      {
        title: 'Business Analyst',
        description: 'Analyze business data to drive strategic decisions.',
        tags: [
          { label: 'Strategic', color: 'yellow' },
          { label: 'High Demand', color: 'green' }
        ]
      },
      {
        title: 'Data Analyst',
        description: 'Extract insights from data to improve business performance.',
        tags: [
          { label: 'Analytical', color: 'blue' },
          { label: 'Growing Field', color: 'green' }
        ]
      }
    ]
  },
  'Business / Analytics': {
    passion: 'Business / Analytics',
    relevantSkills: ['Business Intelligence', 'Predictive Analytics', 'Market Research', 'KPI Development', 'Dashboard Design'],
    courses: ['Advanced Business Analytics', 'Predictive Analytics', 'Marketing Analytics', 'Financial Analytics'],
    institutions: ['Harvard Business School Online', 'MIT Sloan', 'Columbia Business School', 'Duke Fuqua', 'NYU Stern'],
    trainingPrograms: ['Certified Analytics Professional', 'Business Intelligence Pro', 'Advanced SQL Analytics', 'Tableau Expert', 'Market Research Methods', 'Financial Modeling'],
    careerPaths: [
      {
        title: 'Senior Business Analyst',
        description: 'Lead analytics projects and provide strategic insights.',
        tags: [
          { label: 'Leadership', color: 'purple' },
          { label: 'Strategic', color: 'yellow' }
        ]
      },
      {
        title: 'Analytics Consultant',
        description: 'Help businesses leverage data for competitive advantage.',
        tags: [
          { label: 'Consulting', color: 'blue' },
          { label: 'Diverse', color: 'green' }
        ]
      }
    ]
  },
  'Data Analytics': {
    passion: 'Data Analytics',
    relevantSkills: ['Python/R', 'Statistical Analysis', 'Data Visualization', 'SQL', 'ETL Processes'],
    courses: ['Data Analytics Professional Certificate', 'Python for Data Analysis', 'R Programming', 'Advanced Statistics'],
    institutions: ['Johns Hopkins', 'University of Michigan', 'UC San Diego', 'Imperial College London', 'University of Washington'],
    trainingPrograms: ['IBM Data Analyst', 'Google Advanced Data Analytics', 'SAS Certified Specialist', 'Alteryx Designer', 'Databricks Analytics', 'dbt Fundamentals'],
    careerPaths: [
      {
        title: 'Data Analytics Specialist',
        description: 'Transform raw data into actionable business insights.',
        tags: [
          { label: 'In Demand', color: 'green' },
          { label: 'Technical', color: 'blue' }
        ]
      },
      {
        title: 'Quantitative Analyst',
        description: 'Use advanced mathematical models for data analysis.',
        tags: [
          { label: 'Analytical', color: 'yellow' },
          { label: 'Well Paid', color: 'purple' }
        ]
      }
    ]
  },
  'Data Science': {
    passion: 'Data Science',
    relevantSkills: ['Machine Learning', 'Statistical Computing', 'Big Data Technologies', 'Data Engineering', 'Experimentation'],
    courses: ['Data Science MicroMasters', 'Applied Data Science', 'Big Data Specialization', 'Statistical Learning'],
    institutions: ['UC Berkeley', 'Stanford', 'University of Illinois', 'University of Pennsylvania', 'University of Texas'],
    trainingPrograms: ['AWS Data Analytics', 'Spark and Hadoop', 'Data Engineering on GCP', 'Advanced Python for DS', 'MLOps Fundamentals', 'A/B Testing Mastery'],
    careerPaths: [
      {
        title: 'Data Science Lead',
        description: 'Lead data science initiatives and mentor junior data scientists.',
        tags: [
          { label: 'Leadership', color: 'purple' },
          { label: 'High Impact', color: 'blue' }
        ]
      },
      {
        title: 'Research Data Scientist',
        description: 'Conduct advanced research using data science methodologies.',
        tags: [
          { label: 'Research', color: 'yellow' },
          { label: 'Innovative', color: 'green' }
        ]
      }
    ]
  },
  'Renewable Energy': {
    passion: 'Renewable Energy',
    relevantSkills: ['Solar Energy Systems', 'Wind Energy', 'Energy Storage', 'Sustainability', 'Power Systems'],
    courses: ['Renewable Energy Fundamentals', 'Solar Energy Engineering', 'Wind Energy', 'Energy Management'],
    institutions: ['Technical University of Denmark', 'NREL', 'IIT Bombay', 'Delft University', 'Imperial College'],
    trainingPrograms: ['Solar PV Installation', 'Wind Turbine Technology', 'Energy Auditing', 'Green Energy Systems', 'Battery Storage Tech', 'Sustainable Engineering'],
    careerPaths: [
      {
        title: 'Renewable Energy Engineer',
        description: 'Design and implement sustainable energy solutions.',
        tags: [
          { label: 'Sustainable', color: 'green' },
          { label: 'Growing Field', color: 'blue' }
        ]
      },
      {
        title: 'Energy Analyst',
        description: 'Analyze energy systems and recommend efficiency improvements.',
        tags: [
          { label: 'Impactful', color: 'purple' },
          { label: 'Future Focused', color: 'green' }
        ]
      }
    ]
  },
  'Renewable Energy / EV': {
    passion: 'Renewable Energy / EV',
    relevantSkills: ['Electric Vehicle Technology', 'Battery Systems', 'Charging Infrastructure', 'Power Electronics', 'Energy Efficiency'],
    courses: ['Electric Vehicle Engineering', 'Battery Technology', 'EV Charging Systems', 'Sustainable Transportation'],
    institutions: ['TU Munich', 'Stanford', 'MIT', 'Chalmers University', 'University of Michigan'],
    trainingPrograms: ['EV Technology Certification', 'Battery Management Systems', 'Charging Station Installation', 'Hybrid & EV Fundamentals', 'Power Electronics for EVs', 'Smart Grid Technology'],
    careerPaths: [
      {
        title: 'EV Systems Engineer',
        description: 'Develop and optimize electric vehicle systems and components.',
        tags: [
          { label: 'Cutting Edge', color: 'purple' },
          { label: 'High Growth', color: 'green' }
        ]
      },
      {
        title: 'Battery Technology Specialist',
        description: 'Work on advanced battery technologies for EVs.',
        tags: [
          { label: 'Innovative', color: 'blue' },
          { label: 'Future Tech', color: 'green' }
        ]
      }
    ]
  },
  'Embedded Systems / IoT': {
    passion: 'Embedded Systems / IoT',
    relevantSkills: ['Embedded C/C++', 'Microcontroller Programming', 'IoT Protocols', 'RTOS', 'Hardware Integration'],
    courses: ['Embedded Systems Specialization', 'IoT Development', 'ARM Programming', 'Real-Time Systems'],
    institutions: ['University of Colorado Boulder', 'IIT Kharagpur', 'UC Irvine', 'Purdue', 'Texas Instruments University'],
    trainingPrograms: ['Arduino Fundamentals', 'Raspberry Pi Projects', 'ESP32/ESP8266 IoT', 'FreeRTOS Training', 'IoT Security Basics', 'Embedded Linux'],
    careerPaths: [
      {
        title: 'Embedded Software Engineer',
        description: 'Develop software for embedded systems and IoT devices.',
        tags: [
          { label: 'Technical', color: 'blue' },
          { label: 'High Demand', color: 'green' }
        ]
      },
      {
        title: 'IoT Solutions Architect',
        description: 'Design end-to-end IoT systems and architectures.',
        tags: [
          { label: 'Innovative', color: 'purple' },
          { label: 'Strategic', color: 'yellow' }
        ]
      }
    ]
  },
  'Electronics / VLSI': {
    passion: 'Electronics / VLSI',
    relevantSkills: ['Digital Circuit Design', 'Verilog/VHDL', 'VLSI Design', 'Analog Electronics', 'PCB Design'],
    courses: ['VLSI Design Specialization', 'Digital Electronics', 'Analog Circuit Design', 'Chip Design'],
    institutions: ['IIT Madras', 'IISc Bangalore', 'IIIT Bangalore', 'NPTEL', 'UC Berkeley'],
    trainingPrograms: ['Cadence Tool Training', 'Synopsys Design Tools', 'Verilog HDL', 'Physical Design', 'DFT Techniques', 'ASIC Design Flow'],
    careerPaths: [
      {
        title: 'VLSI Design Engineer',
        description: 'Design and verify integrated circuits and chip architectures.',
        tags: [
          { label: 'Specialized', color: 'purple' },
          { label: 'Well Paid', color: 'blue' }
        ]
      },
      {
        title: 'Digital Design Engineer',
        description: 'Work on digital logic design and verification.',
        tags: [
          { label: 'Technical', color: 'yellow' },
          { label: 'High Demand', color: 'green' }
        ]
      }
    ]
  },
  'Digital Design / VLSI': {
    passion: 'Digital Design / VLSI',
    relevantSkills: ['RTL Design', 'Synthesis', 'Timing Analysis', 'Verification', 'SystemVerilog'],
    courses: ['Advanced VLSI Design', 'Digital System Design', 'SoC Design', 'Verification Fundamentals'],
    institutions: ['Carnegie Mellon', 'Georgia Tech', 'University of Illinois', 'UCSD', 'Technion'],
    trainingPrograms: ['UVM Verification', 'Synthesis & Optimization', 'Low Power Design', 'Static Timing Analysis', 'FPGA Design', 'SoC Architecture'],
    careerPaths: [
      {
        title: 'RTL Design Engineer',
        description: 'Create register transfer level designs for digital systems.',
        tags: [
          { label: 'Complex', color: 'purple' },
          { label: 'Rewarding', color: 'blue' }
        ]
      },
      {
        title: 'Verification Engineer',
        description: 'Verify and validate complex digital designs.',
        tags: [
          { label: 'Detail Oriented', color: 'yellow' },
          { label: 'Critical', color: 'red' }
        ]
      }
    ]
  },
  'Electrical Systems': {
    passion: 'Electrical Systems',
    relevantSkills: ['Power Systems', 'Control Systems', 'Circuit Analysis', 'Electrical Machines', 'Protection Systems'],
    courses: ['Electrical Engineering Fundamentals', 'Power Systems Analysis', 'Control Systems Design', 'Electrical Machines'],
    institutions: ['IIT Kanpur', 'NIT Surathkal', 'Anna University', 'VTU', 'MIT'],
    trainingPrograms: ['MATLAB Simulink', 'PLC Programming', 'SCADA Systems', 'Power System Protection', 'Electrical Safety', 'Industrial Automation'],
    careerPaths: [
      {
        title: 'Electrical Engineer',
        description: 'Design and maintain electrical systems and infrastructure.',
        tags: [
          { label: 'Stable', color: 'green' },
          { label: 'Essential', color: 'blue' }
        ]
      },
      {
        title: 'Power Systems Engineer',
        description: 'Work on electrical power generation and distribution.',
        tags: [
          { label: 'Critical', color: 'red' },
          { label: 'Impactful', color: 'purple' }
        ]
      }
    ]
  },
  'Electrical Engineering': {
    passion: 'Electrical Engineering',
    relevantSkills: ['Electronics Design', 'Signal Processing', 'Electromagnetics', 'Communication Systems', 'Instrumentation'],
    courses: ['Electrical Engineering Degree', 'Signal Processing', 'Communication Engineering', 'Advanced Electronics'],
    institutions: ['Stanford', 'Berkeley', 'Illinois', 'Purdue', 'Georgia Tech'],
    trainingPrograms: ['PCB Design Advanced', 'RF Engineering', 'Embedded Systems Design', 'Test & Measurement', 'Power Electronics', 'Digital Signal Processing'],
    careerPaths: [
      {
        title: 'Electronics Design Engineer',
        description: 'Design electronic circuits and systems for various applications.',
        tags: [
          { label: 'Creative', color: 'purple' },
          { label: 'Technical', color: 'blue' }
        ]
      },
      {
        title: 'RF Engineer',
        description: 'Work on radio frequency and wireless communication systems.',
        tags: [
          { label: 'Specialized', color: 'yellow' },
          { label: 'Growing', color: 'green' }
        ]
      }
    ]
  },
  'Robotics': {
    passion: 'Robotics',
    relevantSkills: ['ROS', 'Computer Vision', 'Motion Planning', 'Control Theory', 'Sensor Integration'],
    courses: ['Robotics Specialization', 'Autonomous Robots', 'Robot Motion Planning', 'AI for Robotics'],
    institutions: ['Carnegie Mellon', 'ETH Zurich', 'MIT', 'University of Pennsylvania', 'Georgia Tech'],
    trainingPrograms: ['ROS2 Fundamentals', 'Robot Operating System', 'SLAM Algorithms', 'Path Planning', 'Robot Vision', 'Industrial Robotics'],
    careerPaths: [
      {
        title: 'Robotics Engineer',
        description: 'Design and build autonomous robotic systems.',
        tags: [
          { label: 'Cutting Edge', color: 'purple' },
          { label: 'Exciting', color: 'blue' }
        ]
      },
      {
        title: 'Autonomous Systems Engineer',
        description: 'Develop self-driving and autonomous navigation systems.',
        tags: [
          { label: 'Future Tech', color: 'green' },
          { label: 'Innovative', color: 'purple' }
        ]
      }
    ]
  },
  'Civil Engineering': {
    passion: 'Civil Engineering',
    relevantSkills: ['Structural Analysis', 'Construction Management', 'Surveying', 'Transportation Engineering', 'Geotechnical Engineering'],
    courses: ['Civil Engineering Fundamentals', 'Structural Design', 'Construction Project Management', 'Highway Engineering'],
    institutions: ['IIT Delhi', 'NIT Warangal', 'BITS Pilani', 'Stanford', 'UC Berkeley'],
    trainingPrograms: ['AutoCAD Civil 3D', 'STAAD Pro', 'Project Management Professional', 'Construction Estimation', 'BIM for Civil', 'Surveying Technology'],
    careerPaths: [
      {
        title: 'Structural Engineer',
        description: 'Design safe and efficient structures and buildings.',
        tags: [
          { label: 'Essential', color: 'red' },
          { label: 'Stable', color: 'green' }
        ]
      },
      {
        title: 'Project Manager',
        description: 'Manage construction projects from planning to completion.',
        tags: [
          { label: 'Leadership', color: 'purple' },
          { label: 'Diverse', color: 'blue' }
        ]
      }
    ]
  },
  'Mathematics / Problem Solving': {
    passion: 'Mathematics / Problem Solving',
    relevantSkills: ['Advanced Mathematics', 'Algorithms', 'Computational Thinking', 'Logic', 'Abstract Reasoning'],
    courses: ['Discrete Mathematics', 'Algorithms Specialization', 'Computational Mathematics', 'Applied Mathematics'],
    institutions: ['MIT', 'Stanford', 'Cambridge', 'Princeton', 'Caltech'],
    trainingPrograms: ['Competitive Programming', 'Mathematical Modeling', 'Operations Research', 'Cryptography Basics', 'Game Theory', 'Numerical Methods'],
    careerPaths: [
      {
        title: 'Algorithm Engineer',
        description: 'Develop and optimize complex algorithms for various applications.',
        tags: [
          { label: 'Challenging', color: 'purple' },
          { label: 'Well Paid', color: 'blue' }
        ]
      },
      {
        title: 'Quantitative Analyst',
        description: 'Apply mathematical models to financial and business problems.',
        tags: [
          { label: 'Analytical', color: 'yellow' },
          { label: 'Lucrative', color: 'green' }
        ]
      }
    ]
  },
  'Teacher Training': {
    passion: 'Teacher Training',
    relevantSkills: ['Pedagogy', 'Curriculum Development', 'Classroom Management', 'Educational Technology', 'Assessment Design'],
    courses: ['Teaching Certification Programs', 'Educational Psychology', 'Instructional Design', 'Online Teaching Methods'],
    institutions: ['Teachers College Columbia', 'Stanford Graduate School of Education', 'Harvard Ed School', 'IGNOU', 'NCERT'],
    trainingPrograms: ['TESOL Certification', 'Montessori Training', 'Special Education', 'EdTech Integration', 'Differentiated Instruction', 'Classroom Technology'],
    careerPaths: [
      {
        title: 'Educator',
        description: 'Shape young minds and inspire the next generation.',
        tags: [
          { label: 'Meaningful', color: 'purple' },
          { label: 'Stable', color: 'green' }
        ]
      },
      {
        title: 'Instructional Designer',
        description: 'Create engaging educational content and curricula.',
        tags: [
          { label: 'Creative', color: 'blue' },
          { label: 'Impactful', color: 'green' }
        ]
      }
    ]
  },
  'Healthcare / Nursing': {
    passion: 'Healthcare / Nursing',
    relevantSkills: ['Patient Care', 'Medical Knowledge', 'Clinical Skills', 'Empathy', 'Emergency Response'],
    courses: ['Nursing Degree Programs', 'Healthcare Management', 'Clinical Skills', 'Medical Terminology'],
    institutions: ['Johns Hopkins School of Nursing', 'AIIMS', 'CMC Vellore', 'PGIMER', 'University of Pennsylvania'],
    trainingPrograms: ['BLS/ACLS Certification', 'Critical Care Nursing', 'Pediatric Nursing', 'Emergency Nursing', 'ICU Training', 'Patient Safety'],
    careerPaths: [
      {
        title: 'Registered Nurse',
        description: 'Provide direct patient care and health education.',
        tags: [
          { label: 'Essential', color: 'red' },
          { label: 'Rewarding', color: 'purple' }
        ]
      },
      {
        title: 'Clinical Nurse Specialist',
        description: 'Advanced practice nursing in specialized areas.',
        tags: [
          { label: 'Specialized', color: 'blue' },
          { label: 'Impactful', color: 'green' }
        ]
      }
    ]
  },
  'Healthcare': {
    passion: 'Healthcare',
    relevantSkills: ['Medical Science', 'Diagnostics', 'Treatment Planning', 'Healthcare Technology', 'Patient Communication'],
    courses: ['Medical Foundation Course', 'Healthcare Administration', 'Public Health', 'Health Informatics'],
    institutions: ['Harvard Medical School', 'Mayo Clinic', 'Johns Hopkins', 'Stanford Medicine', 'AIIMS Delhi'],
    trainingPrograms: ['Healthcare Analytics', 'Medical Coding', 'Health Information Management', 'Telemedicine', 'Clinical Research', 'Healthcare Quality'],
    careerPaths: [
      {
        title: 'Healthcare Administrator',
        description: 'Manage healthcare facilities and operations.',
        tags: [
          { label: 'Leadership', color: 'purple' },
          { label: 'Growing Field', color: 'green' }
        ]
      },
      {
        title: 'Medical Technologist',
        description: 'Work with medical technology and diagnostics.',
        tags: [
          { label: 'Technical', color: 'blue' },
          { label: 'Essential', color: 'red' }
        ]
      }
    ]
  },
  'Nutrition / Dietetics': {
    passion: 'Nutrition / Dietetics',
    relevantSkills: ['Nutritional Science', 'Diet Planning', 'Food Safety', 'Clinical Nutrition', 'Wellness Coaching'],
    courses: ['Nutrition Science', 'Clinical Dietetics', 'Sports Nutrition', 'Public Health Nutrition'],
    institutions: ['Cornell', 'Tufts University', 'Penn State', 'University of Sydney', 'King\'s College London'],
    trainingPrograms: ['Registered Dietitian', 'Sports Nutrition Specialist', 'Diabetes Educator', 'Weight Management', 'Pediatric Nutrition', 'Wellness Coaching'],
    careerPaths: [
      {
        title: 'Clinical Dietitian',
        description: 'Provide nutrition therapy in healthcare settings.',
        tags: [
          { label: 'Healthcare', color: 'red' },
          { label: 'Impactful', color: 'purple' }
        ]
      },
      {
        title: 'Nutrition Consultant',
        description: 'Advise clients on diet and healthy lifestyle choices.',
        tags: [
          { label: 'Flexible', color: 'blue' },
          { label: 'Rewarding', color: 'green' }
        ]
      }
    ]
  },
  'Environmental Science': {
    passion: 'Environmental Science',
    relevantSkills: ['Ecology', 'Environmental Assessment', 'Sustainability', 'Conservation', 'Environmental Policy'],
    courses: ['Environmental Science Degree', 'Conservation Biology', 'Environmental Management', 'Climate Change Studies'],
    institutions: ['Stanford', 'Yale School of Environment', 'UC Berkeley', 'Duke', 'Imperial College'],
    trainingPrograms: ['GIS for Environmental Science', 'Environmental Impact Assessment', 'Waste Management', 'Water Quality Management', 'Carbon Footprint Analysis', 'Biodiversity Conservation'],
    careerPaths: [
      {
        title: 'Environmental Scientist',
        description: 'Study and protect the environment and natural resources.',
        tags: [
          { label: 'Meaningful', color: 'green' },
          { label: 'Growing Field', color: 'blue' }
        ]
      },
      {
        title: 'Sustainability Consultant',
        description: 'Help organizations implement sustainable practices.',
        tags: [
          { label: 'Impactful', color: 'purple' },
          { label: 'Future Focused', color: 'green' }
        ]
      }
    ]
  },
  'Graphic Design': {
    passion: 'Graphic Design',
    relevantSkills: ['Adobe Creative Suite', 'Typography', 'Branding', 'Layout Design', 'Visual Communication'],
    courses: ['Graphic Design Specialization', 'Adobe Master Class', 'UI/UX Design', 'Brand Identity Design'],
    institutions: ['Parsons', 'RISD', 'CalArts', 'Pratt Institute', 'School of Visual Arts'],
    trainingPrograms: ['Adobe Photoshop Mastery', 'Illustrator Advanced', 'InDesign Professional', 'Figma Design', 'Motion Graphics', 'Digital Illustration'],
    careerPaths: [
      {
        title: 'Graphic Designer',
        description: 'Create visual content for brands and communications.',
        tags: [
          { label: 'Creative', color: 'purple' },
          { label: 'Versatile', color: 'blue' }
        ]
      },
      {
        title: 'Brand Designer',
        description: 'Develop visual identities and brand systems.',
        tags: [
          { label: 'Strategic', color: 'yellow' },
          { label: 'Creative', color: 'purple' }
        ]
      }
    ]
  },
  'Fashion Design': {
    passion: 'Fashion Design',
    relevantSkills: ['Fashion Illustration', 'Garment Construction', 'Textile Knowledge', 'Pattern Making', 'Trend Forecasting'],
    courses: ['Fashion Design Degree', 'Pattern Making & Draping', 'Fashion Illustration', 'Sustainable Fashion'],
    institutions: ['FIT', 'Parsons', 'Central Saint Martins', 'NIFT Delhi', 'Polimoda'],
    trainingPrograms: ['CAD for Fashion', 'Fashion Marketing', 'Textile Design', 'Fashion Business', 'Sustainable Fashion Practices', 'Fashion Photography'],
    careerPaths: [
      {
        title: 'Fashion Designer',
        description: 'Create original clothing and accessory designs.',
        tags: [
          { label: 'Creative', color: 'purple' },
          { label: 'Trendy', color: 'pink' }
        ]
      },
      {
        title: 'Fashion Merchandiser',
        description: 'Plan and promote fashion collections.',
        tags: [
          { label: 'Business', color: 'blue' },
          { label: 'Dynamic', color: 'green' }
        ]
      }
    ]
  },
  'Design Thinking': {
    passion: 'Design Thinking',
    relevantSkills: ['Human-Centered Design', 'Prototyping', 'User Research', 'Innovation Methods', 'Problem Framing'],
    courses: ['Design Thinking Bootcamp', 'Innovation & Entrepreneurship', 'Service Design', 'Creative Problem Solving'],
    institutions: ['Stanford d.school', 'IDEO U', 'MIT Media Lab', 'Delft University', 'Hasso Plattner Institute'],
    trainingPrograms: ['Design Sprint Facilitation', 'User Experience Research', 'Innovation Workshop', 'Service Design Thinking', 'Lean UX', 'Design Leadership'],
    careerPaths: [
      {
        title: 'Design Strategist',
        description: 'Lead innovation and design thinking initiatives.',
        tags: [
          { label: 'Strategic', color: 'yellow' },
          { label: 'Innovative', color: 'purple' }
        ]
      },
      {
        title: 'UX Designer',
        description: 'Create user-centered digital experiences.',
        tags: [
          { label: 'User Focused', color: 'blue' },
          { label: 'High Demand', color: 'green' }
        ]
      }
    ]
  },
  'Agriculture / Farming': {
    passion: 'Agriculture / Farming',
    relevantSkills: ['Crop Science', 'Soil Management', 'Irrigation', 'Farm Management', 'Sustainable Agriculture'],
    courses: ['Agricultural Science', 'Precision Agriculture', 'Organic Farming', 'Agribusiness Management'],
    institutions: ['UC Davis', 'Cornell CALS', 'Wageningen University', 'IARI', 'Punjab Agricultural University'],
    trainingPrograms: ['Precision Farming Technology', 'Organic Certification', 'Farm Business Management', 'Greenhouse Management', 'Hydroponics', 'Permaculture Design'],
    careerPaths: [
      {
        title: 'Agricultural Specialist',
        description: 'Advise on crop production and farm management.',
        tags: [
          { label: 'Essential', color: 'green' },
          { label: 'Impactful', color: 'blue' }
        ]
      },
      {
        title: 'Agribusiness Manager',
        description: 'Manage agricultural business operations.',
        tags: [
          { label: 'Business', color: 'yellow' },
          { label: 'Growing', color: 'green' }
        ]
      }
    ]
  },
  'Agriculture': {
    passion: 'Agriculture',
    relevantSkills: ['Agronomy', 'Plant Breeding', 'Pest Management', 'Agricultural Economics', 'Food Science'],
    courses: ['Agronomy Fundamentals', 'Plant Pathology', 'Agricultural Technology', 'Food Production'],
    institutions: ['Iowa State', 'Texas A&M', 'University of Illinois', 'Ohio State', 'Purdue Agriculture'],
    trainingPrograms: ['Integrated Pest Management', 'Seed Technology', 'Post Harvest Management', 'Agricultural Extension', 'Vertical Farming', 'Smart Agriculture'],
    careerPaths: [
      {
        title: 'Agronomist',
        description: 'Research and develop better farming practices.',
        tags: [
          { label: 'Research', color: 'purple' },
          { label: 'Sustainable', color: 'green' }
        ]
      },
      {
        title: 'Agricultural Consultant',
        description: 'Provide expertise to farmers and agricultural businesses.',
        tags: [
          { label: 'Advisory', color: 'blue' },
          { label: 'Diverse', color: 'green' }
        ]
      }
    ]
  },
  'Animal Husbandry': {
    passion: 'Animal Husbandry',
    relevantSkills: ['Livestock Management', 'Animal Nutrition', 'Breeding', 'Veterinary Care', 'Farm Operations'],
    courses: ['Animal Science', 'Dairy Management', 'Poultry Science', 'Livestock Production'],
    institutions: ['University of Veterinary Sciences', 'Cornell', 'UC Davis', 'NDRI Karnal', 'IVRI'],
    trainingPrograms: ['Dairy Farm Management', 'Poultry Production', 'Animal Health Management', 'Breeding Programs', 'Feed Management', 'Livestock Business'],
    careerPaths: [
      {
        title: 'Livestock Manager',
        description: 'Oversee livestock production and animal welfare.',
        tags: [
          { label: 'Hands-On', color: 'green' },
          { label: 'Rewarding', color: 'blue' }
        ]
      },
      {
        title: 'Animal Nutritionist',
        description: 'Develop feeding programs for livestock.',
        tags: [
          { label: 'Specialized', color: 'purple' },
          { label: 'Scientific', color: 'yellow' }
        ]
      }
    ]
  },
  'Music / Performing Arts': {
    passion: 'Music / Performing Arts',
    relevantSkills: ['Musical Performance', 'Music Theory', 'Composition', 'Stage Presence', 'Audio Production'],
    courses: ['Music Performance', 'Music Theory & Composition', 'Audio Engineering', 'Music Business'],
    institutions: ['Berklee College of Music', 'Juilliard', 'Royal College of Music', 'Berklee Online', 'Musicians Institute'],
    trainingPrograms: ['Ableton Live Production', 'Pro Tools Certification', 'Music Marketing', 'Live Sound Engineering', 'Music Copyright', 'Digital Music Production'],
    careerPaths: [
      {
        title: 'Music Producer',
        description: 'Create and produce music across various genres.',
        tags: [
          { label: 'Creative', color: 'purple' },
          { label: 'Flexible', color: 'blue' }
        ]
      },
      {
        title: 'Performer',
        description: 'Entertain audiences through musical performances.',
        tags: [
          { label: 'Passionate', color: 'pink' },
          { label: 'Expressive', color: 'purple' }
        ]
      }
    ]
  },
  'Music / Arts': {
    passion: 'Music / Arts',
    relevantSkills: ['Artistic Expression', 'Visual Arts', 'Performance', 'Art History', 'Creative Direction'],
    courses: ['Fine Arts Degree', 'Music & Arts Integration', 'Digital Art', 'Creative Expression'],
    institutions: ['RISD', 'CalArts', 'School of the Art Institute Chicago', 'Goldsmiths', 'Emily Carr'],
    trainingPrograms: ['Digital Art Mastery', 'Mixed Media Arts', 'Art Business', 'Gallery Management', 'Art Therapy', 'Creative Entrepreneurship'],
    careerPaths: [
      {
        title: 'Creative Artist',
        description: 'Express ideas through various artistic mediums.',
        tags: [
          { label: 'Expressive', color: 'purple' },
          { label: 'Independent', color: 'blue' }
        ]
      },
      {
        title: 'Art Director',
        description: 'Lead creative vision for projects and campaigns.',
        tags: [
          { label: 'Leadership', color: 'yellow' },
          { label: 'Creative', color: 'purple' }
        ]
      }
    ]
  },
  'Languages / Literature': {
    passion: 'Languages / Literature',
    relevantSkills: ['Language Proficiency', 'Literary Analysis', 'Writing', 'Translation', 'Cultural Understanding'],
    courses: ['Comparative Literature', 'Creative Writing', 'Translation Studies', 'Linguistics'],
    institutions: ['Oxford', 'Cambridge', 'Columbia', 'UC Berkeley', 'JNU'],
    trainingPrograms: ['Professional Translation', 'Content Writing', 'Copywriting Mastery', 'Technical Writing', 'Literary Criticism', 'Foreign Language Certification'],
    careerPaths: [
      {
        title: 'Translator/Interpreter',
        description: 'Bridge language barriers in various professional contexts.',
        tags: [
          { label: 'Linguistic', color: 'blue' },
          { label: 'Global', color: 'green' }
        ]
      },
      {
        title: 'Content Writer',
        description: 'Create compelling written content for various media.',
        tags: [
          { label: 'Creative', color: 'purple' },
          { label: 'Flexible', color: 'blue' }
        ]
      }
    ]
  },
  'Languages': {
    passion: 'Languages',
    relevantSkills: ['Multilingual Communication', 'Grammar', 'Phonetics', 'Language Teaching', 'Interpretation'],
    courses: ['Applied Linguistics', 'Second Language Acquisition', 'Language Teaching Methodology', 'Phonetics & Phonology'],
    institutions: ['Middlebury', 'Georgetown', 'University of Edinburgh', 'EFL University', 'Defense Language Institute'],
    trainingPrograms: ['TEFL/TESOL Certification', 'Simultaneous Interpretation', 'Conference Interpreting', 'Language Assessment', 'Bilingual Education', 'Language Technology'],
    careerPaths: [
      {
        title: 'Language Instructor',
        description: 'Teach languages to students of various levels.',
        tags: [
          { label: 'Educational', color: 'green' },
          { label: 'Rewarding', color: 'blue' }
        ]
      },
      {
        title: 'Localization Specialist',
        description: 'Adapt content for different languages and cultures.',
        tags: [
          { label: 'Technical', color: 'yellow' },
          { label: 'Global', color: 'green' }
        ]
      }
    ]
  },
  'Sports / Fitness': {
    passion: 'Sports / Fitness',
    relevantSkills: ['Athletic Training', 'Exercise Science', 'Nutrition', 'Coaching', 'Sports Psychology'],
    courses: ['Exercise Science', 'Sports Coaching', 'Fitness & Nutrition', 'Athletic Training'],
    institutions: ['Loughborough University', 'University of Florida', 'ACE', 'NASM', 'ACSM'],
    trainingPrograms: ['Personal Training Certification', 'Strength & Conditioning', 'Sports Nutrition Specialist', 'Yoga Instructor', 'CrossFit Level 1', 'Sports Massage'],
    careerPaths: [
      {
        title: 'Personal Trainer',
        description: 'Help clients achieve their fitness goals.',
        tags: [
          { label: 'Active', color: 'green' },
          { label: 'Rewarding', color: 'blue' }
        ]
      },
      {
        title: 'Sports Coach',
        description: 'Train athletes and teams to peak performance.',
        tags: [
          { label: 'Leadership', color: 'purple' },
          { label: 'Passionate', color: 'red' }
        ]
      }
    ]
  },
  'Sports': {
    passion: 'Sports',
    relevantSkills: ['Athletic Performance', 'Team Management', 'Sports Analytics', 'Biomechanics', 'Sports Medicine'],
    courses: ['Sports Management', 'Sports Analytics', 'Kinesiology', 'Sports Business'],
    institutions: ['Ohio State', 'University of Michigan', 'Penn State', 'University of Oregon', 'Stanford'],
    trainingPrograms: ['Sports Management Certificate', 'Athletic Training', 'Performance Analysis', 'Sports Marketing', 'Event Management', 'Talent Scouting'],
    careerPaths: [
      {
        title: 'Sports Analyst',
        description: 'Analyze athletic performance and game strategies.',
        tags: [
          { label: 'Analytical', color: 'yellow' },
          { label: 'Exciting', color: 'red' }
        ]
      },
      {
        title: 'Athletic Director',
        description: 'Manage sports programs and facilities.',
        tags: [
          { label: 'Leadership', color: 'purple' },
          { label: 'Dynamic', color: 'blue' }
        ]
      }
    ]
  },
  'Hospitality / Tourism': {
    passion: 'Hospitality / Tourism',
    relevantSkills: ['Customer Service', 'Event Management', 'Tourism Planning', 'Hotel Operations', 'Cultural Awareness'],
    courses: ['Hospitality Management', 'Tourism Development', 'Hotel Operations', 'Event Planning'],
    institutions: ['Cornell School of Hotel Administration', 'Ecole hôtelière de Lausanne', 'Les Roches', 'Glion', 'IHM Aurangabad'],
    trainingPrograms: ['Hotel Management Certificate', 'Travel & Tourism Professional', 'Event Planning Certification', 'Food & Beverage Management', 'Customer Service Excellence', 'Revenue Management'],
    careerPaths: [
      {
        title: 'Hotel Manager',
        description: 'Oversee hotel operations and guest experiences.',
        tags: [
          { label: 'People Focused', color: 'blue' },
          { label: 'Dynamic', color: 'green' }
        ]
      },
      {
        title: 'Tourism Consultant',
        description: 'Develop tourism strategies and experiences.',
        tags: [
          { label: 'Creative', color: 'purple' },
          { label: 'Travel', color: 'green' }
        ]
      }
    ]
  },
  'Business / Management': {
    passion: 'Business / Management',
    relevantSkills: ['Strategic Planning', 'Team Leadership', 'Financial Management', 'Operations', 'Business Development'],
    courses: ['MBA', 'Business Strategy', 'Operations Management', 'Organizational Leadership'],
    institutions: ['Harvard Business School', 'Wharton', 'Stanford GSB', 'INSEAD', 'IIM Ahmedabad'],
    trainingPrograms: ['Project Management Professional (PMP)', 'Agile Scrum Master', 'Six Sigma', 'Business Analytics', 'Change Management', 'Strategic Leadership'],
    careerPaths: [
      {
        title: 'Business Manager',
        description: 'Lead business units and drive organizational growth.',
        tags: [
          { label: 'Leadership', color: 'purple' },
          { label: 'Strategic', color: 'yellow' }
        ]
      },
      {
        title: 'Management Consultant',
        description: 'Advise organizations on business strategy and operations.',
        tags: [
          { label: 'Consulting', color: 'blue' },
          { label: 'Prestigious', color: 'green' }
        ]
      }
    ]
  }
};

// Function to get career data for a given passion
export function getCareerData(passion: string): CareerData | null {
  return careerDataset[passion] || null;
}

// Function to get all available passions/categories
export function getAllPassions(): string[] {
  return Object.keys(careerDataset);
}

