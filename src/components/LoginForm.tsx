import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface LoginFormProps {
  onSuccess?: (userRole: "admin" | "ambassador" | "superadmin", userId: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
  
    try {
      // Log in the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Force refresh the ID token to get the latest custom claims
      const idTokenResult = await user.getIdTokenResult(true);
  
      // Extract custom claims
      const { superadmin, admin, ambassador } = idTokenResult.claims;
  
      // Determine the user's role based on custom claims
      let userRole: "admin" | "ambassador" | "superadmin" = "ambassador"; // Default role
      if (superadmin) {
        userRole = "superadmin";
      } else if (admin) {
        userRole = "admin";
      } else if (ambassador) {
        userRole = "ambassador";
      }
  
      console.log("Custom Claims:", idTokenResult.claims); // Debugging
      console.log("User Role:", userRole); // Debugging
  
      if (onSuccess) {
        onSuccess(userRole, user.uid);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Login</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
          </div>

          {error && <div className="text-sm text-red-500 font-medium">{error}</div>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Log in"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button
          variant="link"
          className="text-sm text-blue-500"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot password?
        </Button>
        <Button
          variant="link"
          className="text-sm text-blue-500"
          onClick={() => navigate("/ambassador-register")}
        >
          Register as Agent
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;