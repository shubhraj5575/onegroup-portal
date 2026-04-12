"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, IndianRupee } from "lucide-react";
import { toast } from "sonner";

interface ScheduleItem {
  id: string;
  instalmentNo: number;
  label: string;
  dueDate: string;
  amount: string;
  status: string;
  bookingRef: string;
  customerName: string;
  projectName: string;
}

export default function AdminPaymentsPage() {
  const { accessToken } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMode: "NEFT",
    referenceNumber: "",
  });

  useEffect(() => {
    if (!accessToken) return;

    async function fetchSchedules() {
      try {
        const res = await fetch("/api/admin/payments/pending", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSchedules(data.schedules || []);
        }
      } catch (err) {
        console.error("Failed to load:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSchedules();
  }, [accessToken]);

  const handleMarkPayment = async () => {
    if (!markingId || !paymentForm.amount) return;

    try {
      const res = await fetch("/api/admin/payments/mark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          scheduleId: markingId,
          amount: parseFloat(paymentForm.amount),
          paymentDate: paymentForm.paymentDate,
          paymentMode: paymentForm.paymentMode,
          referenceNumber: paymentForm.referenceNumber,
        }),
      });

      if (res.ok) {
        toast.success("Payment recorded successfully");
        setSchedules((prev) => prev.filter((s) => s.id !== markingId));
        setMarkingId(null);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to record payment");
      }
    } catch {
      toast.error("Failed to record payment");
    }
  };

  const openMark = (item: ScheduleItem) => {
    setMarkingId(item.id);
    setPaymentForm({
      amount: item.amount,
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMode: "NEFT",
      referenceNumber: "",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
        <p className="text-gray-500 mt-1">
          Record payments and manage payment schedules
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Pending & Overdue Payments ({schedules.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Instalment</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.customerName}
                  </TableCell>
                  <TableCell>{item.bookingRef}</TableCell>
                  <TableCell>{item.label}</TableCell>
                  <TableCell>
                    {new Date(item.dueDate).toLocaleDateString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <span className="inline-flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      {Number(item.amount).toLocaleString("en-IN")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === "OVERDUE" ? "destructive" : "secondary"
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => openMark(item)}>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Mark Paid
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {schedules.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-gray-500 py-8"
                  >
                    No pending payments
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mark Payment Dialog */}
      <Dialog open={!!markingId} onOpenChange={() => setMarkingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm((p) => ({ ...p, amount: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Payment Date</Label>
              <Input
                type="date"
                value={paymentForm.paymentDate}
                onChange={(e) =>
                  setPaymentForm((p) => ({ ...p, paymentDate: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Payment Mode</Label>
              <select
                value={paymentForm.paymentMode}
                onChange={(e) =>
                  setPaymentForm((p) => ({ ...p, paymentMode: e.target.value }))
                }
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="NEFT">NEFT</option>
                <option value="RTGS">RTGS</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
                <option value="Online">Online</option>
              </select>
            </div>
            <div>
              <Label>Reference / Cheque Number</Label>
              <Input
                value={paymentForm.referenceNumber}
                onChange={(e) =>
                  setPaymentForm((p) => ({
                    ...p,
                    referenceNumber: e.target.value,
                  }))
                }
                placeholder="Transaction or cheque number"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setMarkingId(null)}>
                Cancel
              </Button>
              <Button onClick={handleMarkPayment}>Confirm Payment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
