// Public recruitment details. Add only the club's confirmed payment instructions.
// Leave the receiving number empty until it has been supplied by the club.
export const recruitmentPayment = {
  amount: 100,
  bkash: { number: "", action: "", instructions: "" },
  nagad: { number: "", action: "", instructions: "" },
  rocket: { number: "", action: "", instructions: "" },
  bank: { instructions: "" },
  cash: { instructions: "Pay ৳100 to a club representative. Enter their name and any receipt reference." },
};

export const paymentMethods = ["bKash", "Nagad", "Rocket", "Bank transfer", "Cash"];

export function paymentInstructions(method) {
  const key = method === "Bank transfer" ? "bank" : method.toLowerCase();
  return recruitmentPayment[key]?.instructions || `Confirm the club's ${method} instructions before paying.`;
}

export function paymentRecipient(method) {
  const details = recruitmentPayment[method.toLowerCase()];
  return details?.number ? `${details.action || "Club receiving number"}: ${details.number}` : "";
}
