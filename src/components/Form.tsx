import { useState } from "react";
import {
  Form as UIForm,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  verifyPatient,
  type VerifiedPatient,
} from "../services/patientService";

const formSchema = z.object({
  first_name: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50),
  last_name: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15),
  date_of_birth: z.string().min(1, "Date of birth is required"),
});

interface PatientFormProps {
  onSubmit: (verifiedPatient: VerifiedPatient) => void;
  onCancel?: () => void;
  getAccessTokenSilently: () => Promise<string>;
}

export default function PatientForm({
  onSubmit,
  onCancel,
  getAccessTokenSilently,
}: PatientFormProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      date_of_birth: "",
    },
  });

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsVerifying(true);
    setVerificationError(null);

    try {
      const accessToken = await getAccessTokenSilently();
      const verifiedPatient = await verifyPatient(
        {
          email: values.email,
          first_name: values.first_name,
          last_name: values.last_name,
          phone: values.phone,
          date_of_birth: values.date_of_birth,
        },
        accessToken
      );

      if (!verifiedPatient) {
        setVerificationError(
          "Patient not found. Please ensure the patient has created an account and verify all details are correct."
        );
        return;
      }
      if (verifiedPatient.role !== "patient") {
        setVerificationError("This user is not registered as a patient.");
        return;
      }
      if (
        verifiedPatient.doctor_id !== null &&
        verifiedPatient.doctor_id !== undefined &&
        verifiedPatient.doctor_id !== ""
      ) {
        setVerificationError(
          "This patient is already assigned to another doctor."
        );
        return;
      }
      // Patient verified successfully
      onSubmit(verifiedPatient);
    } catch (error) {
      setVerificationError(
        error instanceof Error
          ? error.message
          : "Verification failed. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="border-2 border-gray-200 rounded-lg max-w-2xl mx-auto p-6">
      <UIForm {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-6"
        >
          {/* Verification Error Display */}
          {verificationError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Verification Failed
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{verificationError}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date_of_birth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-blue-400 hover:bg-blue-500 text-white"
              disabled={isVerifying}
            >
              {isVerifying ? "Verifying Patient..." : "Add Patient"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </form>
      </UIForm>
    </div>
  );
}
