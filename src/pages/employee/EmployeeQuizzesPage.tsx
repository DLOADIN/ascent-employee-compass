// src/pages/employee/EmployeeQuizzesPage.tsx
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'https://ascent-employee-compass.onrender.com';

export default function EmployeeQuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
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

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleSubmit = async (e, quizId) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const token = localStorage.getItem('token');
    setLoading(true);
    const res = await fetch(`${API_URL}/api/quizzes/${quizId}/submit`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    setLoading(false);
    if (res.ok) {
      toast({ title: "Submitted!" });
      e.target.reset();
    } else {
      toast({ title: "Submission failed", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>
            <FileText className="inline-block mr-2 text-blue-500" /> Available Quizzes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-600 text-center py-2">{error}</div>}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No quizzes available.</div>
          ) : (
            <ul className="space-y-4">
              {quizzes.map(quiz => (
                <li key={quiz.id} className="border-b pb-2 hover:bg-blue-50 rounded transition">
                  <div className="font-semibold">{quiz.title}</div>
                  <div className="text-sm text-muted-foreground">{quiz.description}</div>
                  <a href={API_URL + quiz.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Download Quiz File</a>
                  <div className="mt-1">
                    {quiz.assigned_to
                      ? <Badge variant="secondary">Assigned to you</Badge>
                      : <Badge variant="outline">Department-wide</Badge>
                    }
                  </div>
                  <form onSubmit={e => handleSubmit(e, quiz.id)} encType="multipart/form-data" className="mt-2 flex gap-2">
                    <Input type="file" name="file" required />
                    <Button type="submit" disabled={loading}>Upload Completed Quiz</Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}