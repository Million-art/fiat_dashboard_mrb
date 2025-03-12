import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import StatsCards from "../components/admin/StatsCards";
import AmbassadorList from "../components/admin/AmbassadorList";
import ReceiptList from "../components/admin/ReceiptList";
import TransactionList from "../components/admin/TransactionList";
 import AmbassadorViewDialog from "../components/admin/AmbassadorViewDialog";
import ReceiptViewDialog from "../components/admin/ReceiptViewDialog";
import KYCViewDialog from "../components/kyc/KYCViewDialog "; 
import LoadingScreen from "./Loading";
import { Ambassador, Receipt, Transaction, KYCApplication } from "../types"; 
import KycList from "../components/kyc/KycList";

export default function AdminDashboard() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [kycApplications, setKYCApplications] = useState<KYCApplication[]>([]);  
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isReceiptViewOpen, setIsReceiptViewOpen] = useState(false);
  const [isKYCViewOpen, setIsKYCViewOpen] = useState(false); 
  const [currentAmbassador, setCurrentAmbassador] = useState<Ambassador | null>(null);
  const [currentReceipt, setCurrentReceipt] = useState<Receipt | null>(null);
  const [currentKYC, setCurrentKYC] = useState<KYCApplication | null>(null);  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch data from Firestore
        const [staffSnapshot, receiptsSnapshot, transactionsSnapshot, kycSnapshot] = await Promise.all([
          getDocs(collection(db, "staffs")),
          getDocs(collection(db, "receipts")),
          getDocs(collection(db, "transactions")),
          getDocs(collection(db, "kycApplications")),
        ]);
  
        // Process data
        const staffData = staffSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Ambassador));
        const receiptsData = receiptsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Receipt));
        const transactionsData = transactionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Transaction));
        const kycData = kycSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as KYCApplication));  
  
        // Filter staff by role: "ambassador"
        const ambassadorsData = staffData.filter((staff) => staff.role === "ambassador");
  
        setAmbassadors(ambassadorsData);
        setReceipts(receiptsData);
        setTransactions(transactionsData);
        setKYCApplications(kycData); 
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        console.log("Loading state set to false"); 
      }
    };
  
    fetchData();
  }, []);

  const handleDeleteAmbassador = async (ambassadorId: string) => {
    if (!confirm("Are you sure you want to delete this ambassador?")) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "staffs", ambassadorId));

      // Update local state
      setAmbassadors(ambassadors.filter((amb) => amb.id !== ambassadorId));
    } catch (error) {
      console.error("Error deleting ambassador:", error);
    }
  };

  const handleApproveReceipt = async (receiptId: string) => {
    try {
      // Update the receipt status to "approved" in Firestore
      await updateDoc(doc(db, "receipts", receiptId), {
        status: "approved",
      });
  
      // Update the local state
      setReceipts((prevReceipts) =>
        prevReceipts.map((receipt) =>
          receipt.id === receiptId ? { ...receipt, status: "approved" } : receipt
        )
      );
    } catch (error) {
      console.error("Error approving receipt:", error);
    }
  };
  
  const handleRejectReceipt = async (receiptId: string) => {
    try {
      // Update the receipt status to "rejected" in Firestore
      await updateDoc(doc(db, "receipts", receiptId), {
        status: "rejected",
      });
  
      // Update the local state
      setReceipts((prevReceipts) =>
        prevReceipts.map((receipt) =>
          receipt.id === receiptId ? { ...receipt, status: "rejected" } : receipt
        )
      );
    } catch (error) {
      console.error("Error rejecting receipt:", error);
    }
  };

 

  const handleApproveKYC = async (kycId: string) => {
    try {
      // Update the KYC status to "approved" in Firestore
      await updateDoc(doc(db, "kycApplications", kycId), {
        status: "approved",
      });
  
      // Update the local state
      setKYCApplications((prevKYC) =>
        prevKYC.map((kyc) =>
          kyc.id === kycId ? { ...kyc, status: "approved" } : kyc
        )
      );
    } catch (error) {
      console.error("Error approving KYC:", error);
    }
  };
  
  const handleRejectKYC = async (kycId: string) => {
    try {
      // Update the KYC status to "rejected" in Firestore
      await updateDoc(doc(db, "kycApplications", kycId), {
        status: "rejected",
      });
  
      // Update the local state
      setKYCApplications((prevKYC) =>
        prevKYC.map((kyc) =>
          kyc.id === kycId ? { ...kyc, status: "rejected" } : kyc
        )
      );
    } catch (error) {
      console.error("Error rejecting KYC:", error);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <StatsCards
        ambassadorsCount={ambassadors.length}
        pendingReceiptsCount={receipts.filter((r) => r.status === "pending").length}
        transactionsCount={transactions.length}
        totalDeposits={transactions
          .filter((t) => t.type === "deposit" && t.status === "completed")
          .reduce((sum, t) => sum + t.amount, 0)}
        pendingKYCCount={kycApplications.filter((k) => k.status === "pending").length} 
      />

      <Tabs defaultValue="ambassadors">
      <TabsList className="mb-4 relative flex border-b border-gray-300">
  <TabsTrigger
    value="ambassadors"
    className="relative px-4 py-2  data-[state=active]:text-primary data-[state=active]:font-semibold"
  >
    Ambassadors
    <span className="absolute left-0  h-[3px] w-full   scale-0 data-[state=active]:scale-100 transition-transform"></span>
  </TabsTrigger>

  <TabsTrigger
    value="receipts"
    className="relative px-4 py-2  data-[state=active]:text-primary data-[state=active]:font-semibold"
  >
    Receipts
    <span className="absolute  h-[3px] w-full bg-primary scale-0 data-[state=active]:scale-100 transition-transform"></span>
  </TabsTrigger>

  <TabsTrigger
    value="transactions"
    className="relative px-4 py-2  data-[state=active]:text-primary data-[state=active]:font-semibold"
  >
    Transactions
    <span className="absolute  h-[3px] w-full bg-primary scale-0 data-[state=active]:scale-100 transition-transform"></span>
  </TabsTrigger>

  <TabsTrigger
    value="kyc"
    className="relative px-4 py-2  data-[state=active]:text-primary data-[state=active]:font-semibold"
  >
    KYC
    <span className="absolute  h-[3px] w-full bg-primary scale-0 data-[state=active]:scale-100 transition-transform"></span>
  </TabsTrigger>
</TabsList>


        <TabsContent value="ambassadors" className="space-y-4">
          <AmbassadorList
            ambassadors={ambassadors}
            onDelete={handleDeleteAmbassador}
            onView={(ambassador) => {
              setCurrentAmbassador(ambassador);
              setIsViewOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="receipts">
          <ReceiptList
            receipts={receipts}
            onViewReceipt={(receipt) => {
              setCurrentReceipt(receipt);
              setIsReceiptViewOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionList transactions={transactions} />
        </TabsContent>

        <TabsContent value="kyc">
          <KycList
            kycApplications={kycApplications}
            onViewKYC={(kyc:KYCApplication) => {
              setCurrentKYC(kyc);
              setIsKYCViewOpen(true);
            }}
          />
        </TabsContent>
      </Tabs>

      <AmbassadorViewDialog
        isOpen={isViewOpen}
        onOpenChange={setIsViewOpen}
        ambassador={currentAmbassador}
      />

      <ReceiptViewDialog
        isOpen={isReceiptViewOpen}
        onOpenChange={setIsReceiptViewOpen}
        receipt={currentReceipt}
        onApprove={handleApproveReceipt}
        onReject={handleRejectReceipt}
      />

      <KYCViewDialog
        isOpen={isKYCViewOpen}
        onOpenChange={setIsKYCViewOpen}
        kyc={currentKYC}
        onApprove={handleApproveKYC}
        onReject={handleRejectKYC}
      />
    </div>
  );
}