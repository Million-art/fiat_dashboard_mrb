import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { collection, getDocs, query, where, addDoc, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/firebaseConfig";
import type { Ambassador, Receipt, Transaction } from "../types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import Deposit from "../components/ambassador/Deposit";
import Receipts from "../components/ambassador/Receipts";
import Transactions from "../components/ambassador/Transactions";
import LoadingScreen from "./Loading";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Info } from "lucide-react";
import { Tooltip } from "../components/ui/tooltip";

const AmbassadorDashboard: React.FC = () => {
  const [ambassador, setAmbassador] = useState<Ambassador | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isReceiptViewOpen, setIsReceiptViewOpen] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);

  // Extract userId from URL
  const [searchParams] = useSearchParams();
  const ambassadorId = searchParams.get("userId");

  useEffect(() => {
    const fetchData = async () => {
      if (!ambassadorId) return;

      setLoading(true);
      try {
        // Fetch ambassador data
        const ambassadorDoc = await getDoc(doc(db, "staffs", ambassadorId));
        if (ambassadorDoc.exists()) {
          const ambassadorData = {
            id: ambassadorDoc.id,
            ...ambassadorDoc.data(),
          } as Ambassador;
          setAmbassador(ambassadorData);

          // Log the KYC status
          console.log("Ambassador KYC Status:", ambassadorData.kyc);
        }

        // Fetch receipts
        const receiptsQuery = query(collection(db, "receipts"), where("ambassadorId", "==", ambassadorId));
        const receiptsSnapshot = await getDocs(receiptsQuery);
        const receiptsData = receiptsSnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
            }) as Receipt,
        );
        setReceipts(receiptsData);

        // Fetch transactions
        const transactionsQuery = query(collection(db, "transactions"), where("ambassadorId", "==", ambassadorId));
        const transactionsSnapshot = await getDocs(transactionsQuery);
        const transactionsData = transactionsSnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
            }) as Transaction,
        );
        setTransactions(transactionsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ambassadorId]);

  const handleViewReceipt = (receipt: Receipt) => {
    setCurrentReceipt(receipt);
    setIsReceiptViewOpen(true);
  };

  const handleSubmitDeposit = async (amount: number, currency: string, receiptImage: File): Promise<void> => {
    if (!ambassadorId) {
      throw new Error("Ambassador ID is missing.");
    }

    try {
      const storageRef = ref(storage, `receipts/${ambassadorId}/${Date.now()}_${receiptImage.name}`);
      const uploadResult = await uploadBytes(storageRef, receiptImage);
      const imageUrl = await getDownloadURL(uploadResult.ref);

      const receiptData = {
        amount,
        currency,
        status: "pending",
        ambassadorId,
        imageUrl,
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, "receipts"), receiptData);

      const newReceipt: Receipt = {
        id: docRef.id,
        ...receiptData,
      };

      setReceipts((prevReceipts) => [...prevReceipts, newReceipt]);
    } catch (error) {
      console.error("Error submitting deposit:", error);
      throw error;
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Ambassador Dashboard</h1>

      {/* KYC Warning Banner */}
      {ambassador?.kyc === "pending" && (
        <Alert variant="warning" className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Your KYC is pending. Please{" "}
            <Link to="/complete-kyc" className="text-primary underline">
              complete your KYC
            </Link>{" "}
            to access all features.
          </AlertDescription>
        </Alert>
      )}

      {ambassador && (
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-shrink-0">
            <img
              src={ambassador.photoUrl || "/placeholder.svg"}
              alt={ambassador.firstName}
              className="w-32 h-32 rounded-full object-cover"
            />
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold">{ambassador.firstName + " " + ambassador.lastName}</h2>
            <p className="text-gray-500 mb-4">{ambassador.email}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p>{ambassador.phone}</p>
              </div>

              <div>
                <p className="text-sm font-medium">Country</p>
                <p>{ambassador.country}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="deposit">
        <TabsList className="mb-4">
          {/* Deposit Tab Trigger */}
          <Tooltip
            content="Deposit is disabled because your KYC is not verified."
            disabled={ambassador?.kyc === "verified"} // Only show tooltip if KYC is not verified
          >
            <TabsTrigger
              value="deposit"
              disabled={ambassador?.kyc !== "verified"} // Disable if KYC is not verified
            >
              Make Deposit
            </TabsTrigger>
          </Tooltip>

          <TabsTrigger value="receipts">My Receipts</TabsTrigger>
          <TabsTrigger value="transactions">My Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="deposit">
          {ambassador?.kyc === "verified" ? (
            <Deposit onSubmit={handleSubmitDeposit} />
          ) : (
            <Alert variant="warning" className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Deposit is disabled because your KYC is not verified. Please{" "}
                <Link to="/complete-kyc" className="text-primary underline">
                  complete your KYC
                </Link>{" "}
                to enable this feature.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="receipts">
          <Receipts receipts={receipts} onViewReceipt={handleViewReceipt} />
        </TabsContent>

        <TabsContent value="transactions">
          <Transactions transactions={transactions} />
        </TabsContent>
      </Tabs>

      {/* Receipt View Dialog */}
      <Dialog open={isReceiptViewOpen} onOpenChange={setIsReceiptViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receipt Details</DialogTitle>
          </DialogHeader>

          {currentReceipt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Amount</p>
                  <p>
                    {currentReceipt.amount.toFixed(2)} {currentReceipt.currency}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p
                    className={`px-2 py-1 rounded-full text-xs inline-block ${
                      currentReceipt.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : currentReceipt.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {currentReceipt.status}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p>{new Date(currentReceipt.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {currentReceipt.imageUrl && (
                <div>
                  <p className="text-sm font-medium mb-2">Receipt Image</p>
                  <img
                    src={currentReceipt.imageUrl || "/placeholder.svg"}
                    alt="Receipt"
                    className="max-h-64 mx-auto rounded-md"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AmbassadorDashboard;