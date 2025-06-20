import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
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

export default function LeaveRequestForm() {
  const [type, setType] = useState('');
  const [start, setStart] = useState<Date | undefined>();
  const [end, setEnd] = useState<Date | undefined>();
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [leaves, setLeaves] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const { toast } = useToast();

  useEffect(() => {
    // Fetch all leave requests and filter to current user
    const fetchLeaves = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/leave-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Try to filter by current user if possible
      const userId = localStorage.getItem('userId');
      setLeaves(res.data.filter((l: any) => !userId || String(l.user_id) === userId));
    };
    fetchLeaves();
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !start || !end || !reason) {
      toast({ title: 'Error', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/leave-requests', {
        type,
        start_date: start.toISOString().slice(0, 10),
        end_date: end.toISOString().slice(0, 10),
        reason
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessage('Leave request submitted!');
      toast({ title: 'Success', description: 'Leave request submitted!' });
      setType('');
      setStart(undefined);
      setEnd(undefined);
      setReason('');
    } catch {
      toast({ title: 'Error', description: 'Error submitting leave request.', variant: 'destructive' });
    }
  };

  // Filtered leaves for table
  const filteredLeaves = leaves.filter(l =>
    (statusFilter === 'All' || l.status === statusFilter) &&
    (
      l.type.toLowerCase().includes(search.toLowerCase()) ||
      l.reason.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Leave Requests</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Request Leave</CardTitle>
          <CardDescription>Submit a leave request for HR/Admin to review and approve.</CardDescription>
        </CardHeader>
    <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="type">Type of Leave</Label>
              <Input
                id="type"
                placeholder="e.g. Sick, Vacation, Personal"
                value={type}
                onChange={e => setType(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Start Date</Label>
                <Calendar
                  mode="single"
                  selected={start}
                  onSelect={setStart}
                  className="rounded-md border"
                />
              </div>
              <div className="flex-1">
                <Label>End Date</Label>
                <Calendar
                  mode="single"
                  selected={end}
                  onSelect={setEnd}
                  className="rounded-md border"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Describe the reason for your leave..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                required
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-2">
            <Button type="submit">Request Leave</Button>
            {message && <div className="text-green-600 text-sm mt-2">{message}</div>}
          </CardFooter>
    </form>
      </Card>

      {/* Filters */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Filter leave requests by various criteria</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Input
              placeholder="Search leave requests..."
              className="pl-8"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <Button variant="outline" onClick={() => window.print()} className="gap-2 print:hidden ml-auto">
            <Printer className="h-4 w-4" /> Print
          </Button>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>My Leave Requests</CardTitle>
          <CardDescription>View your submitted leave requests and their status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border print:border-0">
            <Table className="min-w-full border-collapse">
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead>Type</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">No leave requests found.</TableCell>
                  </TableRow>
                ) : (
                  filteredLeaves.map((req, i) => (
                    <TableRow key={req.id} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/50'}>
                      <TableCell className="font-medium">{req.type}</TableCell>
                      <TableCell>{req.start_date}</TableCell>
                      <TableCell>{req.end_date}</TableCell>
                      <TableCell className="max-w-xs truncate" title={req.reason}>{req.reason}</TableCell>
                      <TableCell><Badge className={statusColor(req.status)}>{req.status}</Badge></TableCell>
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