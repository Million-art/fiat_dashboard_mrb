import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { CheckCircle } from 'lucide-react';
import { functions } from "../firebase/firebaseConfig";
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { E164Number } from "libphonenumber-js";
import { httpsCallable } from "firebase/functions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import countries from "../lib/countries.json"; 

export default function AmbassadorRegister() {
  const router = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    tgUsername: "",
    email: "",
    phone: "",
    password: "",
    country: "", 
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string | null>>({
    firstName: null,
    lastName: null,
    tgUsername: null,
    email: null,
    phone: null,
    password: null,
    country: null, // Added country error
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handlePhoneChange = (value: E164Number | undefined) => {
    const formattedPhone = value ? value.replace(/\s/g, "") : ""; 
    setFormData((prev) => ({ ...prev, phone: formattedPhone }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: null }));
    }
  };

  const handleCountryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, country: value }));
    if (errors.country) {
      setErrors((prev) => ({ ...prev, country: null }));
    }
  };

  const validateForm = () => {
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

    if (!formData.tgUsername.trim()) {
      newErrors.tgUsername = "Telegram username is required";
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
    } else if (!isValidPhoneNumber(formData.phone)) {
      newErrors.phone = "Phone number is invalid";
      isValid = false;
    } else if (!formData.phone.startsWith("+58") || formData.phone.length < 11) {
      newErrors.phone = "Enter a valid Venezuelan number (e.g., +58XXXXXXXXXX)";
      isValid = false;
    }
    

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Call Cloud Function to Create Ambassador User
      const createAmbassadorUser = httpsCallable(functions, "createAmbassadorUser");
      const response = await createAmbassadorUser({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        tgUsername: formData.tgUsername,
        phone: formData.phone,
        country: formData.country,  
      });

      console.log("Ambassador Created Successfully:", response.data);

      setSubmitSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        router("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Error submitting registration:", error);

      // Handle specific errors
      if (error.code === "already-exists") {
        setErrors((prev) => ({ ...prev, email: "Email is already in use." }));
      } else if (error.code === "invalid-argument") {
        setErrors((prev) => ({ ...prev, email: "Invalid email or password." }));
      } else {
        setErrors((prev) => ({ ...prev, email: "An error occurred. Please try again." }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Registration Successful</CardTitle>
          <CardDescription className="text-center">
            An activation link has been sent to your email.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <p className="text-center max-w-md">
            Please check your email and click the activation link to complete your registration.
            You will be redirected to the login page.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full max-w-3xl mx-auto my-5">
        <CardHeader>
          <CardTitle>Ambassador Registration</CardTitle>
          <CardDescription>
            Complete your registration to become an ambassador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                placeholder="@username"
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
                placeholder="john@example.com"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <PhoneInput
                international
                defaultCountry="VE" 
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
                <SelectTrigger className={errors.country ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country, index) => (
                    <SelectItem key={index} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && (
                <p className="text-sm text-red-500">{errors.country}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="********"
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Register"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}