import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { KYCApplication } from "../../types";
import { useState } from "react";

interface KYCViewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  kyc: KYCApplication | null;
  onApprove: (kycId: string) => Promise<void>; // Ensure onApprove is async
  onReject: (kycId: string) => Promise<void>; // Ensure onReject is async
}

export default function KYCViewDialog({ isOpen, onOpenChange, kyc, onApprove, onReject }: KYCViewDialogProps) {
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);  
  const [rejecting, setRejecting] = useState(false);  

  if (!kyc) return null;

  const handleImageClick = (imageUrl: string) => {
    setFullScreenImage(imageUrl);
  };

  const handleCloseFullScreen = () => {
    setFullScreenImage(null);
  };

  const handleApprove = async () => {
    if (!kyc) return;

    setApproving(true); 
    try {
      await onApprove(kyc.id); // Await the async function
    } catch (error) {
      console.error("Error approving KYC:", error);
    } finally {
      setApproving(false);  
    }
  };

  const handleReject = async () => {
    if (!kyc) return;

    setRejecting(true);  
    try {
      await onReject(kyc.id); // Await the async function
    } catch (error) {
      console.error("Error rejecting KYC:", error);
    } finally {
      setRejecting(false); 
    }
  };

  return (
    <>
      {/* Main Dialog */}
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>KYC Application</DialogTitle>
            <DialogDescription>Review the KYC application details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Grid Layout for KYC Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ambassador Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-600">Ambassador:</h3>
                  <p className="text-lg">{kyc.firstName} {kyc.lastName}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">Telegram Username:</h3>
                  <p className="text-lg">{kyc.tgUsername}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">Email:</h3>
                  <p className="text-lg">{kyc.email}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">Phone Number:</h3>
                  <p className="text-lg">{kyc.phone}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">Address:</h3>
                  <p className="text-lg">{kyc.address}</p>
                </div>
              </div>

              {/* Document Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-600">Document Type:</h3>
                  <p className="text-lg">{kyc.documentType}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">Status:</h3>
                  <p className="text-lg">{kyc.status}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">Submitted At:</h3>
                  <p className="text-lg">{new Date(kyc.submittedAt).toLocaleString()}</p>
                </div>
                {kyc.reviewedAt && (
                  <div>
                    <h3 className="font-medium text-gray-600">Reviewed At:</h3>
                    <p className="text-lg">{new Date(kyc.reviewedAt).toLocaleString()}</p>
                  </div>
                )}
                {kyc.reviewedBy && (
                  <div>
                    <h3 className="font-medium text-gray-600">Reviewed By:</h3>
                    <p className="text-lg">{kyc.reviewedBy}</p>
                  </div>
                )}
                {kyc.rejectionReason && (
                  <div>
                    <h3 className="font-medium text-gray-600">Rejection Reason:</h3>
                    <p className="text-lg">{kyc.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Images Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Profile Photo */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-600">Profile Photo:</h3>
                <img
                  src={kyc.photoUrl}
                  alt="Profile"
                  className="w-full h-48 object-cover rounded-lg cursor-pointer"
                  onClick={() => kyc.photoUrl && handleImageClick(kyc.photoUrl)}
                />
              </div>

              {/* Document Front */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-600">Document Front:</h3>
                <img
                  src={kyc.documentFrontUrl}
                  alt="Document Front"
                  className="w-full h-48 object-cover rounded-lg cursor-pointer"
                  onClick={() => handleImageClick(kyc.documentFrontUrl)}
                />
              </div>

              {/* Document Back (if available) */}
              {kyc.documentBackUrl && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-600">Document Back:</h3>
                  <img
                    src={kyc.documentBackUrl}
                    alt="Document Back"
                    className="w-full h-48 object-cover rounded-lg cursor-pointer"
                    onClick={() => handleImageClick(kyc.documentBackUrl!)}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={approving || rejecting} // Disable if either button is loading
              >
                {rejecting ? "Rejecting..." : "Reject"}
              </Button>
              <Button
                onClick={handleApprove}
                disabled={approving || rejecting} // Disable if either button is loading
              >
                {approving ? "Approving..." : "Approve"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full-Screen Image Dialog */}
      <Dialog open={!!fullScreenImage} onOpenChange={handleCloseFullScreen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>View Image</DialogTitle>
            <DialogDescription>View the selected image in full screen.</DialogDescription>
          </DialogHeader>
          {fullScreenImage && (
            <img
              src={fullScreenImage}
              alt="Full Screen"
              className="w-full h-full object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}