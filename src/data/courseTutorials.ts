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
    title: 'LEARN ACCOUNTING in Under 5 Hours!',
    description: 'Complete guide to personal finance management',
    videoUrl: 'https://www.youtube.com/watch?v=8R21kA8k44s',
    thumbnailUrl: 'https://i.ytimg.com/vi/8R21kA8k44s/maxresdefault.jpg',
    duration: '2:40:00',
    difficulty: 'Beginner',
    department: 'Finance'
  },
  {
    id: 'finance-4',
    title: 'Excel for Finance and Accounting Full Course Tutorial (3+ Hours)',
    description: 'Comprehensive course on corporate finance principles',
    videoUrl: 'https://www.youtube.com/watch?v=hkybRW7Z3Yk&pp=ygUYdHV0b3JpYWxzIGFib3V0IGZpbmFuY2Ug',
    thumbnailUrl: 'https://i.ytimg.com/vi/v-djL7SPw4c/maxresdefault.jpg',
    duration: '3:58:00',
    difficulty: 'Advanced',
    department: 'Finance'
  },
  {
    id: 'finance-5',
    title: 'Investing for Beginners | Full Course',
    description: 'Learn the fundamentals of investing and portfolio management',
    videoUrl: 'https://www.youtube.com/embed/9hBC5TVdYT8',
    thumbnailUrl: 'https://img.youtube.com/vi/9hBC5TVdYT8/maxresdefault.jpg',
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
    title: 'Sales Training: How to Sell Anything to Anyone',
    description: 'Master the art of selling with proven techniques',
    videoUrl: 'https://www.youtube.com/embed/K6QbU8ToV1A',
    thumbnailUrl: 'https://img.youtube.com/vi/K6QbU8ToV1A/maxresdefault.jpg',
    duration: '1:30:00',
    difficulty: 'Intermediate',
    department: 'Sales'
  },
  {
    id: 'sales-4',
    title: 'Sales Masterclass: The Complete Sales Training',
    description: 'Comprehensive sales training for professionals',
    videoUrl: 'https://www.youtube.com/embed/6Y6XrN4hVvE',
    thumbnailUrl: 'https://img.youtube.com/vi/6Y6XrN4hVvE/maxresdefault.jpg',
    duration: '2:00:00',
    difficulty: 'Advanced',
    department: 'Sales'
  },
  {
    id: 'sales-5',
    title: 'The Ultimate Sales Training Program',
    description: 'Advanced sales techniques and strategies',
    videoUrl: 'https://www.youtube.com/embed/5a6Q5VjJ2uA',
    thumbnailUrl: 'https://img.youtube.com/vi/5a6Q5VjJ2uA/maxresdefault.jpg',
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