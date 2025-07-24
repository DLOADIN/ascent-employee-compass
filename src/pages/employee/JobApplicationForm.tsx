import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

export default function JobApplicationForm() {
  const [jobTitle, setJobTitle] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [cv, setCv] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle) {
      toast({ title: 'Error', description: 'Please enter the job title.', variant: 'destructive' });
      return;
    }
    if (!cv) {
      toast({ title: 'Error', description: 'Please upload your CV.', variant: 'destructive' });
      return;
    }
    // File validation (frontend)
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(cv.type)) {
      toast({ title: 'Error', description: 'Invalid file type. Only PDF, DOC, DOCX allowed.', variant: 'destructive' });
      return;
    }
    if (cv.size > 2 * 1024 * 1024) {
      toast({ title: 'Error', description: 'File too large. Max 2MB.', variant: 'destructive' });
      return;
    }
    const formData = new FormData();
    formData.append('job_title', jobTitle);
    formData.append('cover_letter', coverLetter);
    formData.append('cv', cv);

    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/job-applications', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage('Application submitted!');
      toast({ title: 'Success', description: 'Application submitted!' });
      setJobTitle('');
      setCoverLetter('');
      setCv(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err?.response?.data?.error || 'Error submitting application.', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Job Application</h1>
      <Card>
        <CardHeader>
          <CardTitle>Apply for a Job</CardTitle>
          <CardDescription>Submit your application and upload your CV for the job you are interested in.</CardDescription>
        </CardHeader>
    <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="job-title">Job Title</Label>
              <Input
                id="job-title"
                placeholder="Enter the job title you are applying for"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="cover-letter">Cover Letter</Label>
              <Textarea
                id="cover-letter"
                placeholder="Write your cover letter here..."
        value={coverLetter}
        onChange={e => setCoverLetter(e.target.value)}
                required
                className="min-h-[120px]"
      />
            </div>
            <div>
              <Label htmlFor="cv">Upload CV (PDF, DOC, DOCX, max 2MB)</Label>
              <Input
                id="cv"
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={e => setCv(e.target.files?.[0] || null)}
                required
      />
              {cv && <div className="text-xs text-muted-foreground mt-1">Selected: {cv.name}</div>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-2">
            <Button type="submit">Apply</Button>
            {message && <div className="text-green-600 text-sm mt-2">{message}</div>}
          </CardFooter>
    </form>
      </Card>
    </div>
  );
}