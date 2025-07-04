interface Tutorial {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  department: 'IT' | 'Finance' | 'Sales' | 'Customer-Service';
}

export const courseTutorials: Tutorial[] = [
  // IT Department Tutorials
  {
    id: 'it-1',
    title: 'Complete Docker Course - From BEGINNER to PRO! (Learn Containers)',
    description: 'Complete Docker Course - From BEGINNER to PRO! (Learn Containers)',
    videoUrl: 'https://www.youtube.com/embed/RqTEHSBrYFw',
    thumbnailUrl: 'https://img.youtube.com/vi/RqTEHSBrYFw/maxresdefault.jpg',
    duration: '2:00:00',
    difficulty: 'Beginner',
    department: 'IT'
  },
  {
    id: 'it-2',
    title: 'Complete Python Tutorial for Beginners (Full Course)',
    description: 'Learn Python programming from scratch with this comprehensive course',
    videoUrl: 'https://www.youtube.com/embed/rfscVS0vtbw',
    thumbnailUrl: 'https://img.youtube.com/vi/rfscVS0vtbw/maxresdefault.jpg',
    duration: '4:00:00',
    difficulty: 'Beginner',
    department: 'IT'
  },
  {
    id: 'it-3',
    title: 'JavaScript Full Course (2024)',
    description: 'Master JavaScript programming with this up-to-date course',
    videoUrl: 'https://www.youtube.com/embed/PkZNo7MFNFg',
    thumbnailUrl: 'https://img.youtube.com/vi/PkZNo7MFNFg/maxresdefault.jpg',
    duration: '3:00:00',
    difficulty: 'Intermediate',
    department: 'IT'
  },
  {
    id: 'it-4',
    title: 'C++ Tutorial for Beginners - ProgrammingKnowledge',
    description: 'Learn Linux operating system fundamentals and commands',
    videoUrl: 'https://www.youtube.com/embed/2T86xAtR6Fo',
    thumbnailUrl: 'https://img.youtube.com/vi/2T86xAtR6Fo/maxresdefault.jpg',
    duration: '2:00:00',
    difficulty: 'Beginner',
    department: 'IT'
  },
  {
    id: 'it-5',
    title: 'Complete Kubernetes Course - From BEGINNER to PRO',
    description: 'Complete Kubernetes Course - From BEGINNER to PRO',
    videoUrl: 'https://www.youtube.com/embed/qiQR5rTSshw',
    thumbnailUrl: 'https://img.youtube.com/vi/qiQR5rTSshw/maxresdefault.jpg',
    duration: '3:00:00',
    difficulty: 'Intermediate',
    department: 'IT'
  },

  // Finance Department Tutorials
  {
    id: 'finance-1',
    title: 'FREE 2 Hour Financial Education Course | Your Guide to Financial Freedom',
    description: 'Comprehensive guide to financial education and freedom',
    videoUrl: 'https://www.youtube.com/embed/2wHLd7S6iTc',
    thumbnailUrl: 'https://img.youtube.com/vi/2wHLd7S6iTc/maxresdefault.jpg',
    duration: '2:00:00',
    difficulty: 'Beginner',
    department: 'Finance'
  },
  {
    id: 'finance-2',
    title: 'Fundamentals of Finance & Economics for Businesses',
    description: 'Learn essential finance and economics concepts for business',
    videoUrl: 'https://www.youtube.com/embed/EJHPltmAULA',
    thumbnailUrl: 'https://img.youtube.com/vi/EJHPltmAULA/maxresdefault.jpg',
    duration: '2:30:00',
    difficulty: 'Intermediate',
    department: 'Finance'
  },
  {
    id: 'finance-3',
    title: 'Master Financial Literacy in 54 Minutes: Everything They Never Taught You About Money!',
    description: 'Master Financial Literacy in 54 Minutes: Everything They Never Taught You About Money!',
    videoUrl: 'https://www.youtube.com/embed/vJabNEwZIuc',
  thumbnailUrl: 'https://img.youtube.com/vi/vJabNEwZIuc/maxresdefault.jpg',
    duration: '2:40:00',
    difficulty: 'Beginner',
    department: 'Finance'
  },
  {
    id: 'finance-4',
    title: 'Excel for Finance and Accounting Full Course Tutorial (3+ Hours)',
    description: 'Comprehensive course on corporate finance principles',
    videoUrl: 'https://www.youtube.com/embed/ci39OSFps4A',
    thumbnailUrl: 'https://img.youtube.com/vi/ci39OSFps4A/maxresdefault.jpg',
    duration: '11:00:00',
    difficulty: 'Advanced',
    department: 'Finance'
  },
  {
    id: 'finance-5',
    title: 'Financial Literacy In 63 Minutes',
    description: 'Financial Literacy In 63 Minutes',
    videoUrl: 'https://www.youtube.com/embed/ouvbeb2wSGA',
    thumbnailUrl: 'https://img.youtube.com/vi/ouvbeb2wSGA/maxresdefault.jpg',
    duration: '2:00:00',
    difficulty: 'Beginner',
    department: 'Finance'
  },

  // Sales Department Tutorials
  {
    id: 'sales-1',
    title: 'Lights, Camera, Sales! How to Create Videos That Generate Sales',
    description: 'Learn to create effective sales videos that drive results',
    videoUrl: 'https://www.youtube.com/embed/6DkALM7ocQU',
    thumbnailUrl: 'https://img.youtube.com/vi/6DkALM7ocQU/maxresdefault.jpg',
    duration: '1:00:00',
    difficulty: 'Intermediate',
    department: 'Sales'
  },
  {
    id: 'sales-2',
    title: 'Watch This Before Your Next Sales Call— 60 Minute Sales Crash Course',
    description: 'Quick crash course on essential sales call techniques',
    videoUrl: 'https://www.youtube.com/embed/pc66141WYEI',
    thumbnailUrl: 'https://img.youtube.com/vi/pc66141WYEI/maxresdefault.jpg',
    duration: '1:00:00',
    difficulty: 'Beginner',
    department: 'Sales'
  },
  {
    id: 'sales-3',
    title: 'The Ultimate Sales Training for 2025 [Full Course]',
    description: 'The Ultimate Sales Training for 2025 [Full Course]',
    videoUrl: 'https://www.youtube.com/embed/StVqS0jD7Ls',
    thumbnailUrl: 'https://img.youtube.com/vi/StVqS0jD7Ls/maxresdefault.jpg',
    duration: '1:30:00',
    difficulty: 'Intermediate',
    department: 'Sales'
  },
  {
    id: 'sales-4',
    title: 'The Best SALES TRAINING On The Internet, 2025',
    description: 'The Best SALES TRAINING On The Internet, 2025',
    videoUrl: 'https://www.youtube.com/embed/NcD2t9qt-fM',
    thumbnailUrl: 'https://img.youtube.com/vi/NcD2t9qt-fM/maxresdefault.jpg',
    duration: '2:00:00',
    difficulty: 'Advanced',
    department: 'Sales'
  },
  {
    id: 'sales-5',
    title: 'Brian Tracy on Sales - Nordic Business Forum 2012',
    description: 'Brian Tracy on Sales - Nordic Business Forum 2012',
    videoUrl: 'https://www.youtube.com/embed/Ph6H915jijM',
    thumbnailUrl: 'https://img.youtube.com/vi/Ph6H915jijM/maxresdefault.jpg',
    duration: '1:45:00',
    difficulty: 'Advanced',
    department: 'Sales'
  },

  // Customer Service Tutorials
  {
    id: 'cs-1',
    title: 'CUSTOMER SERVICE TRAINING COURSE! (Customer Service Skills)',
    description: 'Essential customer service skills and techniques',
    videoUrl: 'https://www.youtube.com/embed/SsNfAOTZNZY',
    thumbnailUrl: 'https://img.youtube.com/vi/SsNfAOTZNZY/maxresdefault.jpg',
    duration: '1:00:00',
    difficulty: 'Beginner',
    department: 'Customer-Service'
  },
  {
    id: 'cs-2',
    title: 'Customer Service Skills Training',
    description: 'Customer Service Skills Training',
    videoUrl: 'https://www.youtube.com/embed/x3AkbhCmV20',
    thumbnailUrl: 'https://img.youtube.com/vi/x3AkbhCmV20/maxresdefault.jpg',
    duration: '1:30:00',
    difficulty: 'Beginner',
    department: 'Customer-Service'
  },
  {
    id: 'cs-3',
    title: 'Customer Service Training Course',
    description: 'Customer Service Training Course',
    videoUrl: 'https://www.youtube.com/embed/BTceRytUwN4',
    thumbnailUrl: 'https://img.youtube.com/vi/BTceRytUwN4/maxresdefault.jpg',
    duration: '1:45:00',
    difficulty: 'Intermediate',
    department: 'Customer-Service'
  },
  {
    id: 'cs-4',
    title: '25 Real Customer Service Conversations: Learn English & Improve Your Skills!',
    description: '25 Real Customer Service Conversations: Learn English & Improve Your Skills!',
    videoUrl: 'https://www.youtube.com/embed/1ygh0PWn3B8',
    thumbnailUrl: 'https://img.youtube.com/vi/1ygh0PWn3B8/maxresdefault.jpg',
    duration: '1:30:00',
    difficulty: 'Intermediate',
    department: 'Customer-Service'
  },
  {
    id: 'cs-5',
    title: 'Customer Service Representative Training',
    description: 'Professional training for customer service representatives',
    videoUrl: 'https://www.youtube.com/embed/OGMRF7gmIKE',
    thumbnailUrl: 'https://img.youtube.com/vi/OGMRF7gmIKE/maxresdefault.jpg',
    duration: '1:45:00',
    difficulty: 'Advanced',
    department: 'Customer-Service'
  }  
];

// Helper function to get tutorials by department
export const getTutorialsByDepartment = (department: string): Tutorial[] => {
  return courseTutorials.filter(tutorial => tutorial.department === department);
};

// Helper function to get tutorials by difficulty
export const getTutorialsByDifficulty = (difficulty: string): Tutorial[] => {
  return courseTutorials.filter(tutorial => tutorial.difficulty === difficulty);
};

// Helper function to get a specific tutorial by ID
export const getTutorialById = (id: string): Tutorial | undefined => {
  return courseTutorials.find(tutorial => tutorial.id === id);
}; 