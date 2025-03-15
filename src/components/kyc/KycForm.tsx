import { useState, useEffect } from "react";
import { auth, db, storage } from "../../firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getDoc } from "firebase/firestore";
import PhoneInput from "react-phone-number-input";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ArrowRight } from "lucide-react";
import { FileUpload } from "../FileUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import countries from "../../lib/countries.json";
import { KYCApplication } from "../../types";
import { E164Number } from "libphonenumber-js";
import SubmitMessage from "./SubmitMessage";

interface KYCFormProps {
  ambassadorId: string;
}

export default function KYCForm({ ambassadorId }: KYCFormProps) {
  const [activeTab, setActiveTab] = useState("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  // Form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    tgUsername: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    documentType: "Passport",
    photoUrl: "",
  });

  // File uploads
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string | null>>({
    firstName: null,
    lastName: null,
    tgUsername: null,
    email: null,
    phone: null,
    address: null,
    country: null,
    documentType: null,
    photo: null,
    idFront: null,
    idBack: null,
  });

  // Fetch ambassador data on component mount
  useEffect(() => {
    const fetchAmbassadorData = async () => {
      try {
        const ambassadorDoc = await getDoc(doc(db, "staffs", ambassadorId));
        if (ambassadorDoc.exists()) {
          const data = ambassadorDoc.data();
  
          // Set form data
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            tgUsername: data.tgUsername || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            country: data.country || "",
            documentType: data.documentType || "Passport",
            photoUrl: data.photoUrl || "",
          });
  
          // Set photo preview if photoUrl exists
          if (data.photoUrl) {
            setPhotoPreview(data.photoUrl);
          }
  
          // Fetch and set ID front and back URLs if they exist
          if (data.documentFrontUrl) {
            setIdFrontPreview(data.documentFrontUrl);
          }
          if (data.documentBackUrl) {
            setIdBackPreview(data.documentBackUrl);
          }
        }
      } catch (err) {
        console.error("Error fetching ambassador data:", err);
      }
    };
  
    fetchAmbassadorData();
  }, [ambassadorId]);
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleCountryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, country: value }));
    if (errors.country) {
      setErrors((prev) => ({ ...prev, country: null }));
    }
  };

  const handleDocumentTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, documentType: value }));
    if (errors.documentType) {
      setErrors((prev) => ({ ...prev, documentType: null }));
    }
  };

  const handlePhotoChange = (file: File | null) => {
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          photo: "File size exceeds 5MB limit",
        }));
        return;
      }

      // Validate file type (image only)
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          photo: "Only image files are allowed",
        }));
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPhotoFile(file);
      setPhotoPreview(previewUrl);

      // Clear error
      setErrors((prev) => ({ ...prev, photo: null }));
    } else {
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  };

  const handleFileChange = (
    fileType: "idFront" | "idBack",
    file: File | null
  ) => {
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          [fileType]: "File size exceeds 5MB limit",
        }));
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      if (fileType === "idFront") {
        setIdFrontFile(file);
        setIdFrontPreview(previewUrl);
      } else if (fileType === "idBack") {
        setIdBackFile(file);
        setIdBackPreview(previewUrl);
      }

      // Clear error
      setErrors((prev) => ({ ...prev, [fileType]: null }));
    } else {
      // Clear file and preview
      if (fileType === "idFront") {
        setIdFrontFile(null);
        setIdFrontPreview(null);
      } else if (fileType === "idBack") {
        setIdBackFile(null);
        setIdBackPreview(null);
      }
    }
  };

  const validatePersonalInfo = () => {
    const newErrors: Record<string, string | null> = {};
    let isValid = true;

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
      isValid = false;
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
      isValid = false;
    }

    if (!formData.documentType.trim()) {
      newErrors.documentType = "Document type is required";
      isValid = false;
    }

    if (!photoFile && !photoPreview) {
      newErrors.photo = "Profile photo is required";
      isValid = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const validateIdVerification = () => {
    const newErrors: Record<string, string | null> = {};
    let isValid = true;

    if (!idFrontFile) {
      newErrors.idFront = "Front side of ID is required";
      isValid = false;
    }

    if (!idBackFile) {
      newErrors.idBack = "Back side of ID is required";
      isValid = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleNextStep = () => {
    if (activeTab === "personal") {
      const isValid = validatePersonalInfo();
      if (isValid) {
        setActiveTab("verification");
      }
    }
  };

  const handlePrevStep = () => {
    if (activeTab === "verification") {
      setActiveTab("personal");
    }
  };

  const handlePhoneChange = (value: E164Number | undefined) => {
    setFormData((prev) => ({ ...prev, phone: value || "" }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: null }));
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Validate both steps
    const isPersonalValid = validatePersonalInfo();
    const isIdValid = validateIdVerification();
    console.log(isPersonalValid, isIdValid);
    if (!isPersonalValid) {
      setActiveTab("personal");
      return;
    }
  
    if (!isIdValid) {
      setActiveTab("verification");
      return;
    }
  
    try {
      setIsSubmitting(true);
      
      const user = auth.currentUser; 
      if (!user) {
        throw new Error("User is not authenticated.");
      }
  
      const userUid = user.uid;
  
      // Ensure the ambassadorId matches the authenticated user's UID
      if (ambassadorId !== userUid) {
        throw new Error("Unauthorized: Ambassador ID does not match authenticated user.");
      }

      // Upload profile photo
      let photoUrl = formData.photoUrl;
      if (photoFile) {
        photoUrl = await uploadFile(
          photoFile,
          `kyc/${userUid}/profile_photo.jpg`
        );
      }
  
      // Upload ID files
      const idFrontUrl = await uploadFile(
        idFrontFile as File,
        `kyc/${userUid}/id_front.jpg`
      );
      const idBackUrl = await uploadFile(
        idBackFile as File,
        `kyc/${userUid}/id_back.jpg`
      );
  
      // Create KYC application object
      const kycApplication: KYCApplication = {
        id: userUid,
        ambassadorId: userUid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        tgUsername: formData.tgUsername,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        country: formData.country,
        photoUrl: photoUrl,
        documentType: formData.documentType,
        documentFrontUrl: idFrontUrl,
        documentBackUrl: idBackUrl,
        status: "pending",
        submittedAt: new Date().toISOString(),
      };
  
      console.log("KYC Application Data:", kycApplication);
  
      // Save application to Firestore
      await setDoc(doc(db, "kycApplications", userUid), kycApplication);
  
      // Update ambassador's KYC status to "pending"
      await setDoc(
        doc(db, "staffs", userUid),
        {
          kyc: "pending",
          photoUrl,
        },
        { merge: true }
      );
  
      setSubmitSuccess(true);

    } catch (error) {
      console.error("Error submitting KYC application:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <SubmitMessage />

    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full max-w-3xl mx-auto my-5">
        <CardHeader>
          <CardTitle>Ambassador KYC Verification</CardTitle>
          <CardDescription>
            Complete your KYC verification to become an ambassador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              <TabsTrigger value="verification">ID Verification</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tgUsername">Telegram Username</Label>
                  <Input
                    id="tgUsername"
                    name="tgUsername"
                    value={formData.tgUsername}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    className={errors.tgUsername ? "border-red-500" : ""}
                  />
                  {errors.tgUsername && (
                    <p className="text-sm text-red-500">{errors.tgUsername}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="mrjohn@example.com"
                    className={errors.email ? "border-red-500" : ""}
                    disabled
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <PhoneInput
                    international
                    defaultCountry="US"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className={`w-full p-2 border ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    } rounded-md`}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={formData.country}
                    onValueChange={handleCountryChange}
                  >
                    <SelectTrigger
                      className={errors.country ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country, index) => (
                        <SelectItem
                          key={index}
                          value={country.name}
                          className="bg-gray-800 text-white"
                        >
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.country && (
                    <p className="text-sm text-red-500">{errors.country}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Type</Label>
                  <Select
                    value={formData.documentType}
                    onValueChange={handleDocumentTypeChange}
                  >
                    <SelectTrigger
                      className={errors.documentType ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Passport">Passport</SelectItem>
                      <SelectItem value="Driver's License">
                        Driver's License
                      </SelectItem>
                      <SelectItem value="National ID">National ID</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.documentType && (
                    <p className="text-sm text-red-500">
                      {errors.documentType}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main St, Apt 4B"
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="photo">Profile Photo</Label>
                  <FileUpload
                    id="file-upload"
                    label="Upload Image"
                    accept="image/png, image/jpeg"
                    onChange={handlePhotoChange}
                    previewUrl={photoPreview}
                    error={errors.photo}
                  />
                  {errors.photo && (
                    <p className="text-sm text-red-500">{errors.photo}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="verification" className="space-y-6">
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">
                    ID Verification Requirements
                  </h3>
                  <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    <li>
                      Government-issued ID (passport, driver's license, or
                      national ID)
                    </li>
                    <li>Both front and back sides of your ID</li>
                    <li>Clear, unobstructed view of the entire document</li>
                    <li>All text and photos must be clearly visible</li>
                    <li>Files must be less than 5MB in size</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUpload
                    id="idFront"
                    label="Front side of ID"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(file) => handleFileChange("idFront", file)}
                    previewUrl={idFrontPreview}
                    error={errors.idFront}
                  />

                  <FileUpload
                    id="idBack"
                    label="Back side of ID"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(file) => handleFileChange("idBack", file)}
                    previewUrl={idBackPreview}
                    error={errors.idBack}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between">
          {activeTab === "verification" ? (
            <Button type="button" variant="outline" onClick={handlePrevStep}>
              Back
            </Button>
          ) : (
            <div></div>
          )}

          {activeTab === "personal" ? (
            <Button type="button" onClick={handleNextStep} className="ml-auto">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting} className="ml-auto">
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </form>
  );
}