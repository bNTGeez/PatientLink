// Helper function to calculate age from date of birth
export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

// Helper function to get full name from patient object
export const getFullName = (patient: any): string => {
  if (!patient) return "Unknown User";

  const firstName = patient.first_name || "";
  const lastName = patient.last_name || "";

  if (!firstName && !lastName) {
    return "Unknown User";
  }

  return `${firstName} ${lastName}`.trim();
};

// Helper function to format date
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};
