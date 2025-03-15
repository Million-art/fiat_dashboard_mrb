import { CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

const SubmitMessage = () => {
  return (
    <div>
        <Card className="w-full max-w-3xl mx-auto mt-10">
        <CardHeader>
          <CardTitle className="text-center">Application Submitted</CardTitle>
          <CardDescription className="text-center">
            Your KYC application has been submitted successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <p className="text-center max-w-md">
            Thank you for submitting your KYC application. We will review your
            information and get back to you shortly. You will be redirected to
            your dashboard.
          </p>
          <button className="px-4 py-2 bg-primary rounded-lg mt-5">
            <a href="/ambassador">Back to Home</a>
          </button>
        </CardContent>
      </Card>
    </div>
  )
}

export default SubmitMessage