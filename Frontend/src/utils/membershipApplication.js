import { studentFields as applicationFields, validPhone, validateStudentDetails } from "./studentDetails";
import { paymentMethods, recruitmentPayment } from "../data/recruitment";

export { studentFields as applicationFields } from "./studentDetails";

export const initialApplication = {
  fullName: "", studentId: "", department: "", semester: "", gender: "", email: "", phone: "",
  paymentMethod: "", bkashSender: "", transactionId: "", nagadSender: "", nagadTransactionId: "",
  rocketSender: "", rocketTransactionId: "", senderBank: "", bankReference: "",
  cashReceivedBy: "", cashReference: "", consent: false,
};

export function paymentFields(method) {
  if (method === "bKash") return [
    { name: "bkashSender", label: "bKash sender number", type: "tel", maxLength: 25, placeholder: "Number used to pay", required: true },
    { name: "transactionId", label: "Transaction ID", maxLength: 30, autoComplete: "off", placeholder: "From your bKash receipt", required: true },
  ];
  if (method === "Nagad" || method === "Rocket") {
    const prefix = method.toLowerCase();
    return [
      { name: `${prefix}Sender`, label: `${method} sender number`, type: "tel", maxLength: 25, placeholder: "Number used to pay", required: true },
      { name: `${prefix}TransactionId`, label: "Transaction ID", maxLength: 60, autoComplete: "off", placeholder: `From your ${method} receipt`, required: true },
    ];
  }
  if (method === "Bank transfer") return [
    { name: "senderBank", label: "Sender bank", maxLength: 100, placeholder: "Bank used for the transfer", required: true },
    { name: "bankReference", label: "Transfer reference", maxLength: 100, autoComplete: "off", placeholder: "From your transfer receipt", required: true },
  ];
  if (method === "Cash") return [
    { name: "cashReceivedBy", label: "Cash received by", maxLength: 100, placeholder: "Club representative’s name", required: true },
    { name: "cashReference", label: "Receipt / reference", maxLength: 60, placeholder: "If a receipt was provided", required: false },
  ];
  return [];
}

export function validateApplication(values) {
  const errors = validateStudentDetails(values);
  if (!paymentMethods.includes(values.paymentMethod)) errors.paymentMethod = "Choose a payment method.";
  paymentFields(values.paymentMethod).forEach(({ name, label, required }) => {
    if (required && !values[name].trim()) errors[name] = `Enter the ${label.toLowerCase()}.`;
  });
  if (values.paymentMethod === "bKash") {
    if (values.bkashSender.trim() && !validPhone(values.bkashSender)) errors.bkashSender = "Enter a valid bKash sender number.";
    if (values.transactionId.trim() && !/^[A-Za-z0-9]{6,30}$/.test(values.transactionId.trim())) errors.transactionId = "Enter the transaction ID from your bKash receipt, using letters and numbers only.";
  }
  if (values.paymentMethod === "Nagad" || values.paymentMethod === "Rocket") {
    const name = `${values.paymentMethod.toLowerCase()}Sender`;
    if (values[name].trim() && !validPhone(values[name])) errors[name] = `Enter a valid ${values.paymentMethod} sender number.`;
  }
  if (!values.consent) errors.consent = "Please agree to be contacted about your application.";
  return errors;
}

export function paymentSummary(values) {
  return [
    ["Registration fee", `BDT ${recruitmentPayment.amount}`],
    ["Payment method", values.paymentMethod],
    ...paymentFields(values.paymentMethod).map(({ name, label }) => [label, values[name].trim() || "Not provided"]),
    ["Payment status", "Pending club verification"],
  ];
}

export function formatApplication(values) {
  return [
    "ARPC membership application", "",
    ...applicationFields.map(({ name, label }) => `${label}: ${values[name].trim()}`),
    "", "Transaction information:",
    ...paymentSummary(values).map(([label, value]) => `${label}: ${value}`),
    "", "I agree to be contacted about this membership application.",
  ].join("\n");
}

export function applicationEmail(values) {
  return `mailto:info@arpc.club?subject=${encodeURIComponent("ARPC membership application")}&body=${encodeURIComponent(formatApplication(values))}`;
}
