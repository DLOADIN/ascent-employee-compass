import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Chip,
} from '@mui/material';
import { Close as CloseIcon, PlayArrow as PlayIcon, AccessTime, CalendarToday } from '@mui/icons-material';
import { useAppContext } from '@/context/AppContext';
import { Course } from '@/types';
import { courseTutorials } from '@/data/courseTutorials';

interface TeamMemberProgress {
  userId: number;
  userName: string;
  courses: {
    courseId: string;
    courseTitle: string;
    progress: number;
    lastAccessed: string | null;
    lastWatchPosition: number | null;
    totalWatchTime: number;
    daysWatched: number;
  }[];
}

const TeamLeaderCoursesPage: React.FC = () => {
  const { currentUser } = useAppContext();
  const [teamProgress, setTeamProgress] = useState<TeamMemberProgress[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamProgress();
  }, []);

  const fetchTeamProgress = async () => {
    try {
      const response = await fetch('/api/team-leader/course-progress', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTeamProgress(data);
      }
    } catch (error) {
      console.error('Error fetching team progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'success';
    if (progress >= 40) return 'warning';
    return 'error';
  };

  const getEngagementLevel = (daysWatched: number, totalWatchTime: number) => {
    if (daysWatched >= 5 && totalWatchTime >= 7200) return 'High';
    if (daysWatched >= 3 && totalWatchTime >= 3600) return 'Medium';
    return 'Low';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Team Learning Progress
      </Typography>

      {loading ? (
        <LinearProgress />
      ) : teamProgress.length === 0 ? (
        <Typography>No team members found.</Typography>
      ) : (
        teamProgress.map((member) => (
          <Card key={member.userId} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {member.userName}
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Course</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Last Accessed</TableCell>
                      <TableCell>Watch Time</TableCell>
                      <TableCell>Days Watched</TableCell>
                      <TableCell>Engagement</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {member.courses.map((course) => {
                      const engagementLevel = getEngagementLevel(course.daysWatched, course.totalWatchTime);
                      return (
                        <TableRow key={course.courseId}>
                          <TableCell>{course.courseTitle}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={course.progress}
                                color={getProgressColor(course.progress) as any}
                                sx={{ width: '100px' }}
                              />
                              <Typography variant="body2">{course.progress}%</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {course.lastAccessed ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarToday fontSize="small" />
                                {new Date(course.lastAccessed).toLocaleDateString()}
                              </Box>
                            ) : (
                              'Never'
                            )}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AccessTime fontSize="small" />
                              {formatDuration(course.totalWatchTime)}
                            </Box>
                          </TableCell>
                          <TableCell>{course.daysWatched} days</TableCell>
                          <TableCell>
                            <Chip 
                              label={engagementLevel}
                              color={
                                engagementLevel === 'High' ? 'success' :
                                engagementLevel === 'Medium' ? 'warning' : 'error'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View Course">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  const tutorial = courseTutorials.find(
                                    (t) => t.id === course.courseId
                                  );
                                  if (tutorial) {
                                    setSelectedCourse(tutorial);
                                    setIsVideoOpen(true);
                                  }
                                }}
                              >
                                <PlayIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog
        open={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedCourse?.title}
          <IconButton
            onClick={() => setIsVideoOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedCourse && (
            <iframe
              width="100%"
              height="500"
              src={selectedCourse.videoUrl}
              title={selectedCourse.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TeamLeaderCoursesPage;