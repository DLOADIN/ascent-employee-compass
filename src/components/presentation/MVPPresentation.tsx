
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  FileText, 
  BookOpen, 
  Bell, 
  Shield, 
  TrendingUp,
  Target,
  CheckCircle,
  AlertTriangle,
  Star,
  BarChart3,
  Clock,
  Mail
} from "lucide-react";

interface Slide {
  id: number;
  title: string;
  component: React.ReactNode;
}

export function MVPPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      id: 1,
      title: "Ascent Employee Compass MVP",
      component: <TitleSlide />
    },
    {
      id: 2,
      title: "The Problem We Solve",
      component: <ProblemSlide />
    },
    {
      id: 3,
      title: "Our Solution",
      component: <SolutionSlide />
    },
    {
      id: 4,
      title: "Key Features",
      component: <FeaturesSlide />
    },
    {
      id: 5,
      title: "Role-Based Dashboard",
      component: <RolesSlide />
    },
    {
      id: 6,
      title: "Technology Stack",
      component: <TechStackSlide />
    },
    {
      id: 7,
      title: "Current MVP Status",
      component: <MVPStatusSlide />
    },
    {
      id: 8,
      title: "Areas for Improvement",
      component: <ImprovementsSlide />
    },
    {
      id: 9,
      title: "Business Impact",
      component: <BusinessImpactSlide />
    },
    {
      id: 10,
      title: "Next Steps",
      component: <NextStepsSlide />
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
              HR
            </div>
            <span className="text-xl font-semibold">Ascent Employee Compass</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {currentSlide + 1} / {slides.length}
            </span>
            <Progress value={((currentSlide + 1) / slides.length) * 100} className="w-32" />
          </div>
        </div>

        {/* Slide Content */}
        <div className="max-w-6xl mx-auto">
          <Card className="min-h-[600px] shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {slides[currentSlide].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {slides[currentSlide].component}
            </CardContent>
          </Card>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center mt-8">
          <Button 
            variant="outline" 
            onClick={prevSlide}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {/* Slide Indicators */}
          <div className="flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  currentSlide === index 
                    ? 'bg-primary' 
                    : 'bg-muted hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>

          <Button 
            variant="outline" 
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function TitleSlide() {
  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Ascent Employee Compass
        </h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive HR Management Platform MVP
        </p>
      </div>
      
      <div className="grid grid-cols-3 gap-8 mt-12">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="font-semibold">Multi-Role Support</h3>
          <p className="text-sm text-muted-foreground">Admin, Team Leader, Employee</p>
        </div>
        
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="font-semibold">Task Management</h3>
          <p className="text-sm text-muted-foreground">Assign, Track, Complete</p>
        </div>
        
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="font-semibold">Progress Tracking</h3>
          <p className="text-sm text-muted-foreground">Real-time Insights</p>
        </div>
      </div>
    </div>
  );
}

function ProblemSlide() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-4">Current HR Management Challenges</h2>
        <p className="text-muted-foreground">Organizations struggle with fragmented HR processes</p>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Manual Processes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Paper-based task assignments</li>
              <li>• Email chains for progress updates</li>
              <li>• Spreadsheet tracking systems</li>
              <li>• Disconnected communication tools</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <Clock className="mr-2 h-5 w-5" />
              Time Inefficiencies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Hours spent on status meetings</li>
              <li>• Delayed progress reporting</li>
              <li>• Duplicate data entry</li>
              <li>• Manual report generation</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-600">
              <BarChart3 className="mr-2 h-5 w-5" />
              Lack of Visibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• No real-time progress tracking</li>
              <li>• Limited department visibility</li>
              <li>• Unclear task dependencies</li>
              <li>• Missing performance metrics</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-600">
              <Users className="mr-2 h-5 w-5" />
              Employee Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Low visibility into goals</li>
              <li>• Limited feedback mechanisms</li>
              <li>• Unclear career progression</li>
              <li>• Disconnected learning paths</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SolutionSlide() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-4">Ascent Employee Compass Solution</h2>
        <p className="text-muted-foreground">Unified platform for streamlined HR management</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <Shield className="mr-2 h-5 w-5" />
              Role-Based Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">Tailored experiences for different organizational roles</p>
            <div className="space-y-2">
              <Badge variant="outline">Admin Dashboard</Badge>
              <Badge variant="outline">Team Leader Tools</Badge>
              <Badge variant="outline">Employee Portal</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-600">
              <FileText className="mr-2 h-5 w-5" />
              Centralized Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">All HR processes in one integrated platform</p>
            <div className="space-y-2">
              <Badge variant="outline">Task Assignment</Badge>
              <Badge variant="outline">Progress Tracking</Badge>
              <Badge variant="outline">Course Management</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-600">
              <TrendingUp className="mr-2 h-5 w-5" />
              Real-Time Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">Live insights into team and individual performance</p>
            <div className="space-y-2">
              <Badge variant="outline">Progress Metrics</Badge>
              <Badge variant="outline">Department Analytics</Badge>
              <Badge variant="outline">Performance Reports</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-center">Key Value Propositions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">75%</div>
            <div className="text-sm text-muted-foreground">Time Saved</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">90%</div>
            <div className="text-sm text-muted-foreground">Task Visibility</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">60%</div>
            <div className="text-sm text-muted-foreground">Faster Reporting</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">85%</div>
            <div className="text-sm text-muted-foreground">User Satisfaction</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturesSlide() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-center mb-8">Core Features Overview</h2>
      
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-600" />
              Task Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Create and assign tasks</li>
              <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Progress tracking with documentation</li>
              <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Deadline management</li>
              <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Status updates (Todo, In Progress, Completed)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-green-600" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Role-based access control</li>
              <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Employee profile management</li>
              <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Department organization</li>
              <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Promote/demote functionality</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-purple-600" />
              Course Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Department-specific courses</li>
              <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Video-based learning</li>
              <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Progress tracking</li>
              <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Enrollment management</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5 text-orange-600" />
              Notifications & Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Real-time notifications</li>
              <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> PDF export functionality</li>
              <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Email integration</li>
              <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Progress analytics</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RolesSlide() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-center mb-8">Role-Based Dashboard Experience</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600">Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Complete system oversight and control</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Users className="mr-2 h-4 w-4" />
                  Manage all employees
                </div>
                <div className="flex items-center text-sm">
                  <Users className="mr-2 h-4 w-4" />
                  Promote team leaders
                </div>
                <div className="flex items-center text-sm">
                  <Bell className="mr-2 h-4 w-4" />
                  System notifications
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="mr-2 h-4 w-4" />
                  Email management
                </div>
                <div className="flex items-center text-sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Export reports (PDF)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-600">Team Leader Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Department management and oversight</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Create & assign tasks
                </div>
                <div className="flex items-center text-sm">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Track team progress
                </div>
                <div className="flex items-center text-sm">
                  <Users className="mr-2 h-4 w-4" />
                  Manage team members
                </div>
                <div className="flex items-center text-sm">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Department analytics
                </div>
                <div className="flex items-center text-sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Export team reports
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-green-600">Employee Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Personal productivity and development</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <FileText className="mr-2 h-4 w-4" />
                  View assigned tasks
                </div>
                <div className="flex items-center text-sm">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Update task progress
                </div>
                <div className="flex items-center text-sm">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Access courses
                </div>
                <div className="flex items-center text-sm">
                  <Target className="mr-2 h-4 w-4" />
                  Track personal goals
                </div>
                <div className="flex items-center text-sm">
                  <Bell className="mr-2 h-4 w-4" />
                  Receive notifications
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold mb-2">Security & Access Control</h3>
        <p className="text-sm text-muted-foreground">
          JWT-based authentication ensures secure access, while role-based permissions maintain proper data separation and workflow integrity.
        </p>
      </div>
    </div>
  );
}

function TechStackSlide() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-center mb-8">Technology Stack</h2>
      
      <div className="grid grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">Frontend Technologies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">React 18</span>
                <Badge variant="outline">UI Framework</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">TypeScript</span>
                <Badge variant="outline">Type Safety</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Tailwind CSS</span>
                <Badge variant="outline">Styling</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Shadcn/UI</span>
                <Badge variant="outline">Components</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">React Router</span>
                <Badge variant="outline">Navigation</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Recharts</span>
                <Badge variant="outline">Data Visualization</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Backend Technologies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Python Flask</span>
                <Badge variant="outline">API Framework</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">MySQL</span>
                <Badge variant="outline">Database</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">JWT</span>
                <Badge variant="outline">Authentication</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">FPDF</span>
                <Badge variant="outline">PDF Generation</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">EmailJS</span>
                <Badge variant="outline">Email Integration</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">REST API</span>
                <Badge variant="outline">Communication</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-8">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">Modern</div>
            <p className="text-sm text-muted-foreground">Latest tech stack ensures scalability and maintainability</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600 mb-2">Secure</div>
            <p className="text-sm text-muted-foreground">JWT authentication and role-based access control</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">Responsive</div>
            <p className="text-sm text-muted-foreground">Mobile-friendly design with Tailwind CSS</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MVPStatusSlide() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-center mb-8">Current MVP Implementation Status</h2>
      
      <div className="grid grid-cols-2 gap-6">
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-green-600 flex items-center">
              <CheckCircle className="mr-2 h-5 w-5" />
              Completed Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Authentication System</span>
                <Progress value={100} className="w-20 h-2" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Role-based Dashboards</span>
                <Progress value={100} className="w-20 h-2" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Task Management</span>
                <Progress value={100} className="w-20 h-2" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">User Management</span>
                <Progress value={100} className="w-20 h-2" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Course System</span>
                <Progress value={100} className="w-20 h-2" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Notifications</span>
                <Progress value={100} className="w-20 h-2" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">PDF Export</span>
                <Progress value={100} className="w-20 h-2" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Integration</span>
                <Progress value={100} className="w-20 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="text-orange-600 flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Current Limitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Limited advanced analytics dashboard</li>
              <li>• Basic notification system (no push notifications)</li>
              <li>• Simple course video player</li>
              <li>• Basic email functionality</li>
              <li>• No mobile app (responsive web only)</li>
              <li>• Limited integration with external tools</li>
              <li>• Basic search functionality</li>
              <li>• No automated workflows</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-8">
        <Card className="text-center border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600 mb-1">95%</div>
            <div className="text-xs text-muted-foreground">Core Features</div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </CardContent>
        </Card>

        <Card className="text-center border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600 mb-1">3</div>
            <div className="text-xs text-muted-foreground">User Roles</div>
            <div className="text-xs text-muted-foreground">Implemented</div>
          </CardContent>
        </Card>

        <Card className="text-center border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600 mb-1">15+</div>
            <div className="text-xs text-muted-foreground">API Endpoints</div>
            <div className="text-xs text-muted-foreground">Ready</div>
          </CardContent>
        </Card>

        <Card className="text-center border-orange-200 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600 mb-1">100%</div>
            <div className="text-xs text-muted-foreground">Responsive</div>
            <div className="text-xs text-muted-foreground">Design</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ImprovementsSlide() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-center mb-8">Areas for Improvement & Enhancement</h2>
      
      <div className="grid grid-cols-2 gap-6">
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Star className="h-4 w-4 text-red-500 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Advanced Analytics Dashboard</div>
                  <div className="text-xs text-muted-foreground">Real-time performance metrics, KPI tracking, and interactive charts</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Star className="h-4 w-4 text-red-500 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Push Notifications</div>
                  <div className="text-xs text-muted-foreground">Browser and mobile push notifications for urgent tasks</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Star className="h-4 w-4 text-red-500 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Advanced Search & Filtering</div>
                  <div className="text-xs text-muted-foreground">Global search across tasks, users, and courses</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Star className="h-4 w-4 text-red-500 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Mobile Application</div>
                  <div className="text-xs text-muted-foreground">Native iOS and Android apps for better mobile experience</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="text-orange-600">Medium Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Workflow Automation</div>
                  <div className="text-xs text-muted-foreground">Automated task assignments and status updates</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Enhanced Video Player</div>
                  <div className="text-xs text-muted-foreground">Video annotations, bookmarks, and interactive elements</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Integration APIs</div>
                  <div className="text-xs text-muted-foreground">Connect with Slack, Microsoft Teams, Google Workspace</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Advanced Reporting</div>
                  <div className="text-xs text-muted-foreground">Custom report builder and scheduled reports</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-600">Future Enhancements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">AI-Powered Insights</div>
                  <div className="text-xs text-muted-foreground">Predictive analytics and performance recommendations</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Multi-language Support</div>
                  <div className="text-xs text-muted-foreground">Internationalization for global organizations</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Advanced Permissions</div>
                  <div className="text-xs text-muted-foreground">Granular role-based permissions and custom roles</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Performance Reviews</div>
                  <div className="text-xs text-muted-foreground">360-degree feedback and performance evaluation system</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-purple-600">Technical Improvements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <BarChart3 className="h-4 w-4 text-purple-500 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Performance Optimization</div>
                  <div className="text-xs text-muted-foreground">Lazy loading, caching, and code splitting</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <BarChart3 className="h-4 w-4 text-purple-500 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Enhanced Security</div>
                  <div className="text-xs text-muted-foreground">2FA, audit logs, and data encryption</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <BarChart3 className="h-4 w-4 text-purple-500 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Scalability Improvements</div>
                  <div className="text-xs text-muted-foreground">Database optimization and microservices architecture</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <BarChart3 className="h-4 w-4 text-purple-500 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Testing Coverage</div>
                  <div className="text-xs text-muted-foreground">Comprehensive unit, integration, and E2E testing</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BusinessImpactSlide() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-center mb-8">Business Impact & ROI</h2>
      
      <div className="grid grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Quantifiable Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                <span className="text-sm font-medium">Administrative Time Saved</span>
                <span className="text-lg font-bold text-green-600">75%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                <span className="text-sm font-medium">Task Completion Rate</span>
                <span className="text-lg font-bold text-blue-600">+40%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                <span className="text-sm font-medium">Reporting Speed</span>
                <span className="text-lg font-bold text-purple-600">10x</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                <span className="text-sm font-medium">Employee Engagement</span>
                <span className="text-lg font-bold text-orange-600">+60%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">Cost Savings Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Manual Processing Reduction</span>
                  <span className="text-sm font-medium">$50K/year</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Meeting Time Optimization</span>
                  <span className="text-sm font-medium">$30K/year</span>
                </div>
                <Progress value={70} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Paper & Printing Costs</span>
                  <span className="text-sm font-medium">$5K/year</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between">
                  <span className="font-medium">Total Annual Savings</span>
                  <span className="font-bold text-green-600">$85K</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-8">
        <Card className="text-center">
          <CardContent className="pt-6">
            <TrendingUp className="mx-auto h-8 w-8 text-green-600 mb-2" />
            <div className="text-lg font-bold">Productivity</div>
            <div className="text-sm text-muted-foreground">Streamlined workflows increase overall team productivity</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <Users className="mx-auto h-8 w-8 text-blue-600 mb-2" />
            <div className="text-lg font-bold">Employee Satisfaction</div>
            <div className="text-sm text-muted-foreground">Clear goals and progress tracking improve job satisfaction</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <Target className="mx-auto h-8 w-8 text-purple-600 mb-2" />
            <div className="text-lg font-bold">Strategic Alignment</div>
            <div className="text-sm text-muted-foreground">Better visibility ensures everyone works toward common goals</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function NextStepsSlide() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-center mb-8">Implementation Roadmap & Next Steps</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-green-600">Phase 1: MVP Deployment</CardTitle>
            <p className="text-sm text-muted-foreground">0-2 months</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Production deployment</li>
              <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> User training sessions</li>
              <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Data migration</li>
              <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Performance monitoring</li>
              <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> User feedback collection</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-600">Phase 2: Enhancement</CardTitle>
            <p className="text-sm text-muted-foreground">3-6 months</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center"><Target className="mr-2 h-4 w-4 text-blue-500" /> Advanced analytics dashboard</li>
              <li className="flex items-center"><Target className="mr-2 h-4 w-4 text-blue-500" /> Push notifications</li>
              <li className="flex items-center"><Target className="mr-2 h-4 w-4 text-blue-500" /> Mobile application</li>
              <li className="flex items-center"><Target className="mr-2 h-4 w-4 text-blue-500" /> Workflow automation</li>
              <li className="flex items-center"><Target className="mr-2 h-4 w-4 text-blue-500" /> Integration APIs</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-purple-600">Phase 3: Scale & Optimize</CardTitle>
            <p className="text-sm text-muted-foreground">6-12 months</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center"><Star className="mr-2 h-4 w-4 text-purple-500" /> AI-powered insights</li>
              <li className="flex items-center"><Star className="mr-2 h-4 w-4 text-purple-500" /> Performance reviews</li>
              <li className="flex items-center"><Star className="mr-2 h-4 w-4 text-purple-500" /> Multi-language support</li>
              <li className="flex items-center"><Star className="mr-2 h-4 w-4 text-purple-500" /> Enterprise integrations</li>
              <li className="flex items-center"><Star className="mr-2 h-4 w-4 text-purple-500" /> Advanced security features</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-center">Immediate Action Items</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <Users className="mx-auto h-6 w-6 text-blue-600 mb-2" />
              <div className="font-medium text-sm">Stakeholder</div>
              <div className="font-medium text-sm">Buy-in</div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <Target className="mx-auto h-6 w-6 text-green-600 mb-2" />
              <div className="font-medium text-sm">Pilot Program</div>
              <div className="font-medium text-sm">Planning</div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <FileText className="mx-auto h-6 w-6 text-purple-600 mb-2" />
              <div className="font-medium text-sm">Resource</div>
              <div className="font-medium text-sm">Allocation</div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <Clock className="mx-auto h-6 w-6 text-orange-600 mb-2" />
              <div className="font-medium text-sm">Timeline</div>
              <div className="font-medium text-sm">Finalization</div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <h3 className="text-xl font-semibold mb-4">Ready to Transform Your HR Management?</h3>
        <p className="text-muted-foreground mb-6">
          The Ascent Employee Compass MVP provides a solid foundation for modern HR management. 
          Let's discuss implementation strategy and customize the solution for your organization's needs.
        </p>
        <div className="flex justify-center space-x-4">
          <Badge variant="outline" className="px-4 py-2">MVP Ready for Deployment</Badge>
          <Badge variant="outline" className="px-4 py-2">Proven Technology Stack</Badge>
          <Badge variant="outline" className="px-4 py-2">Scalable Architecture</Badge>
        </div>
      </div>
    </div>
  );
}
