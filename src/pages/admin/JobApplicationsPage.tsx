import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer } from 'lucide-react';

const statusColor = (status: string) => {
  switch (status) {
    case 'Accepted': return 'bg-green-100 text-green-700';
    case 'Rejected': return 'bg-red-100 text-red-700';
    case 'Reviewed': return 'bg-blue-100 text-blue-700';
    case 'Pending': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export default function JobApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://manzi897098.pythonanywhere.com/api/job-applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setApplications(res.data);
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Job Applications</h1>
        <Button variant="outline" onClick={() => window.print()} className="gap-2 print:hidden">
          <Printer className="h-4 w-4" /> Print
        </Button>
      </div>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>All Job Applications</CardTitle>
          <CardDescription>Review, track, and manage all job applications submitted by candidates.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border print:border-0">
            <Table className="min-w-full border-collapse">
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead>Applicant</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Cover Letter</TableHead>
                  <TableHead>CV</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">No job applications found.</TableCell>
                  </TableRow>
                ) : (
                  applications.map((app, i) => (
                    <TableRow key={app.id} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/50'}>
                      <TableCell className="font-medium">{app.applicant_name}</TableCell>
                      <TableCell>{app.job_title}</TableCell>
                      <TableCell className="max-w-xs truncate" title={app.cover_letter}>{app.cover_letter}</TableCell>
                      <TableCell>
                        <a href={`https://manzi897098.pythonanywhere.com${app.cv_url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Download CV</a>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColor(app.status)}>{app.status}</Badge>
                      </TableCell>
                      <TableCell>{app.submitted_at}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}