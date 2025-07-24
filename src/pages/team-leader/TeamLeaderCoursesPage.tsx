// src/pages/team-leader/TeamLeaderCoursesPage.tsx
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, FileText, Users } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function TeamLeaderCoursesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const fetchQuizzes = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/quizzes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch quizzes");
      setQuizzes(await res.json());
    } catch (err) {
      setError("Could not load quizzes. Please try again later.");
    }
    setLoading(false);
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/team-leader/department-employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch employees");
      setEmployees(await res.json());
    } catch (err) {
      // Optionally handle error
    }
  };

  useEffect(() => {
    fetchQuizzes();
    fetchEmployees();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const token = localStorage.getItem('token');
    setLoading(true);
    const res = await fetch(`${API_URL}/api/quizzes`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    setLoading(false);
    if (res.ok) {
      toast({ title: "Quiz uploaded!" });
      form.reset();
      fetchQuizzes();
    } else {
      toast({ title: "Upload failed", variant: "destructive" });
    }
  };

  const handleViewSubmissions = async (quiz) => {
    setSelectedQuiz(quiz);
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/api/quizzes/${quiz.id}/submissions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setSubmissions(await res.json());
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>
            <Upload className="inline-block mr-2 text-blue-500" /> Upload New Quiz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} encType="multipart/form-data" className="space-y-4">
            <Input name="title" placeholder="Quiz Title" required />
            <Textarea name="description" placeholder="Description" />
            <Input type="file" name="file" required />
            <div>
              <label className="block text-sm font-medium mb-1">Assign to (optional):</label>
              <select name="assigned_to" className="w-full border rounded px-2 py-1">
                <option value="">-- All Department --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              Upload Quiz
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>
            <FileText className="inline-block mr-2 text-blue-500" /> Your Uploaded Quizzes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-600 text-center py-2">{error}</div>}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No quizzes uploaded yet.</div>
          ) : (
            <ul className="space-y-4">
              {quizzes.map(quiz => (
                <li key={quiz.id} className="border-b pb-2 hover:bg-blue-50 rounded transition">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{quiz.title}</div>
                      <div className="text-sm text-muted-foreground">{quiz.description}</div>
                      <a href={API_URL + quiz.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Download Quiz File</a>
                      <div className="mt-1">
                        {quiz.assigned_to
                          ? <Badge variant="secondary">Assigned to: {employees.find(e => e.id === quiz.assigned_to)?.name || "User"}</Badge>
                          : <Badge variant="outline">Department-wide</Badge>
                        }
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => handleViewSubmissions(quiz)}>
                          <Users className="h-4 w-4 mr-1" /> View Submissions
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Submissions for: {quiz.title}</DialogTitle>
                        </DialogHeader>
                        <div>
                          {submissions.length === 0 ? (
                            <div className="text-muted-foreground">No submissions yet.</div>
                          ) : (
                            <ul>
                              {submissions.map(sub => (
                                <li key={sub.id} className="mb-2">
                                  <span className="font-medium">{sub.user_name}</span>
                                  <a href={API_URL + sub.file_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 underline">Download Submission</a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}