import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer } from 'lucide-react';

const statusColor = (status: string) => {
  switch (status) {
    case 'Approved': return 'bg-green-100 text-green-700';
    case 'Rejected': return 'bg-red-100 text-red-700';
    case 'Pending': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export default function LeaveRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('https://ascent-employee-compass.onrender.com/api/leave-requests', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setRequests(res.data);
  };

  const updateLeaveStatus = async (id, status) => {
    const token = localStorage.getItem('token');
    await axios.patch(`https://ascent-employee-compass.onrender.com/api/leave-requests/${id}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Leave Requests</h1>
        <Button variant="outline" onClick={() => window.print()} className="gap-2 print:hidden">
          <Printer className="h-4 w-4" /> Print
        </Button>
      </div>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>All Leave Requests</CardTitle>
          <CardDescription>Track, review, and manage all employee leave requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border print:border-0">
            <Table className="min-w-full border-collapse">
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">No leave requests found.</TableCell>
                  </TableRow>
                ) : (
                  requests.map((req, i) => (
                    <TableRow key={req.id} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/50'}>
                      <TableCell className="font-medium">{req.employee_name}</TableCell>
                      <TableCell>{req.type}</TableCell>
                      <TableCell>{req.start_date}</TableCell>
                      <TableCell>{req.end_date}</TableCell>
                      <TableCell className="max-w-xs truncate" title={req.reason}>{req.reason}</TableCell>
                      <TableCell>
                        {req.status === "Pending" ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => updateLeaveStatus(req.id, "Approved")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateLeaveStatus(req.id, "Rejected")}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <Badge className={statusColor(req.status)}>{req.status}</Badge>
                        )}
                      </TableCell>
                      <TableCell>{req.submitted_at}</TableCell>
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