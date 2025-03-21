import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Eye, Check, X } from "lucide-react";
import { formatDate } from "../../lib/utils";
import { Receipt } from "../../types";
import { db, functions } from "../../firebase/firebaseConfig";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { httpsCallable } from "firebase/functions";
import { toast } from "sonner";

interface ReceiptListProps {
  isAdmin?: boolean;
}

const ReceiptList: React.FC<ReceiptListProps> = ({ isAdmin = false }) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isReceiptDetailOpen, setIsReceiptDetailOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  // Clear error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    setError(null); // Clear any previous errors

    // Create a query for the receipts collection
    const receiptsQuery = query(collection(db, "receipts"), where("ambassadorId", "==", currentUser.uid));

    // Set up a real-time listener
    const unsubscribe = onSnapshot(
      receiptsQuery,
      (snapshot) => {
        const receiptsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt || new Date(),
        })) as Receipt[];
        setReceipts(receiptsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching receipts:", error);
        setError("Failed to fetch receipts. Please try again later.");
        setLoading(false);
      }
    );

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [currentUser]);

  const handleApprove = async () => {
    if (!selectedReceipt) return;
  
    // Validate required fields
    if (!selectedReceipt.id || !selectedReceipt.senderTgId || !selectedReceipt.amount) {
      setError("Missing required fields: receiptId, senderTgId, or amount.");
      return;
    }
  
    setIsActionLoading(true); // Set loading state to true
  
    try {
      const approveReceiptFunction = httpsCallable(functions, "approveReceipt");
      await approveReceiptFunction({
        receiptId: selectedReceipt.id,
        senderId: selectedReceipt.senderTgId,
        amount: selectedReceipt.amount,
      });
  
      setIsConfirmationOpen(false);
      setIsReceiptDetailOpen(false);
      setError(null);
      toast.success("Receipt approved successfully!");
      console.log("Receipt approved:", selectedReceipt.id);
    } catch (error) {
      console.error("Error approving receipt:", error);
      setError("Failed to approve receipt. Please try again later.");
      toast.error("Failed to approve receipt.");
    } finally {
      setIsActionLoading(false); 
    }
  };
  
  const handleReject = async () => {
    if (!selectedReceipt) return;
  
    setIsActionLoading(true); 
  
    try {
      await updateDoc(doc(db, "receipts", selectedReceipt.id), { status: "rejected" });
      setIsConfirmationOpen(false);
      setIsReceiptDetailOpen(false);
      setError(null); // Clear error on success
      toast.success("Receipt rejected successfully!");
      console.log("Receipt rejected:", selectedReceipt.id);
    } catch (error) {
      console.error("Error rejecting receipt:", error);
      setError("Failed to reject receipt. Please try again later.");
      toast.error("Failed to reject receipt.");
    } finally {
      setIsActionLoading(false); // Reset loading state
    }
  };

  const openConfirmationDialog = (type: "approve" | "reject", receipt: Receipt) => {
    setActionType(type);
    setSelectedReceipt(receipt);
    setIsConfirmationOpen(true);
    setError(null); // Clear error when opening the dialog
  };

  if (loading) return <p>Loading receipts...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Receipts</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">No receipts found</TableCell>
              </TableRow>
            ) : (
              receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium">{receipt.id.slice(0, 8)}</TableCell>
                  <TableCell>{receipt.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${receipt.status === "approved" ? "bg-green-100 text-green-800" : receipt.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                      {receipt.status}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(receipt.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => { setSelectedReceipt(receipt); setIsReceiptDetailOpen(true); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {isAdmin && receipt.status === "pending" && (
                        <>
                          <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => openConfirmationDialog("approve", receipt)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => openConfirmationDialog("reject", receipt)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === "approve" ? "Approve Receipt" : "Reject Receipt"}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">Are you sure you want to {actionType} this receipt?</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsConfirmationOpen(false)} disabled={isActionLoading}>
              Cancel
            </Button>
            <Button
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={actionType === "approve" ? handleApprove : handleReject}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <span className="flex items-center">
                  {actionType === "approve" ? "Approving..." : "Rejecting..."}
                </span>
              ) : (
                actionType === "approve" ? "Approve" : "Reject"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isReceiptDetailOpen} onOpenChange={setIsReceiptDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receipt Details</DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4">
              <p><strong>ID:</strong> {selectedReceipt.id}</p>
              <p><strong>Amount:</strong> {selectedReceipt.amount.toFixed(2)}</p>
              <p><strong>Currency:</strong> {selectedReceipt.currency}</p>
              <p><strong>Status:</strong> {selectedReceipt.status}</p>
              <p><strong>Date:</strong> {formatDate(selectedReceipt.createdAt)}</p>
              <p><strong>Document:</strong></p>
              {selectedReceipt.documents && selectedReceipt.documents.length > 0 ? (
                <div className="space-y-2">
                  {selectedReceipt.documents.map((doc, index) => (
                    <a
                      key={index}
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline block"
                    >
                      View Document {index + 1}
                    </a>
                  ))}
                </div>
              ) : (
                <p>No document available</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceiptList;