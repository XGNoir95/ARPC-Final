export const studentFields = [
  { name: "fullName", label: "Full name", autoComplete: "name", maxLength: 100 },
  { name: "studentId", label: "Student ID", maxLength: 30, autoComplete: "off" },
  { name: "department", label: "Department", options: [
    "Computer Science & Engineering", "Electrical & Electronic Engineering", "Mechanical Engineering",
    "Industrial & Production Engineering", "Civil Engineering", "Textile Engineering", "Bachelor of Business Administration", "Architecture",
  ] },
  { name: "semester", label: "Semester", options: ["1.1", "1.2", "2.1", "2.2", "3.1", "3.2", "4.1", "4.2", "5.1", "5.2"] },
  { name: "gender", label: "Gender", options: ["Female", "Male", "Other", "Prefer not to say"] },
  { name: "email", label: "Email address", type: "email", autoComplete: "email", maxLength: 150 },
  { name: "phone", label: "Mobile number", type: "tel", autoComplete: "tel", maxLength: 25, placeholder: "+880 1XXXXXXXXX" },
];

export const validPhone = (value) => /^\+?\d{7,15}$/.test(value.replace(/[\s()-]/g, ""));

export function validateStudentDetails(values, fields = studentFields) {
  const errors = {};
  fields.forEach(({ name, label, options }) => {
    const value = values[name]?.trim() || "";
    if (!value) errors[name] = `${options ? "Select" : "Enter"} your ${label.toLowerCase()}.`;
    else if (options && !options.includes(value)) errors[name] = `Select a valid ${label.toLowerCase()}.`;
    else if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors[name] = "Enter a valid email address.";
    else if (name === "phone" && !validPhone(value)) errors[name] = "Enter a valid mobile number, including your country code if needed.";
  });
  return errors;
}
