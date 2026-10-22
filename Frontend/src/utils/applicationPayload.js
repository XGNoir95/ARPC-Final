const studentKeys=['fullName','studentId','department','semester','gender','email','phone'];
export const studentPayload=values=>Object.fromEntries(studentKeys.map(key=>[key,values[key] || '']));
export function membershipPayload(values) {
  const method=values.paymentMethod;
  const sender=method==='bKash'?values.bkashSender:method==='Nagad'?values.nagadSender:method==='Rocket'?values.rocketSender:method==='Bank transfer'?values.senderBank:'';
  const reference=method==='bKash'?values.transactionId:method==='Nagad'?values.nagadTransactionId:method==='Rocket'?values.rocketTransactionId:method==='Bank transfer'?values.bankReference:values.cashReference;
  return {type:'membership',details:studentPayload(values),consent:values.consent,payment:{method,sender:sender || '',reference:reference || '',receivedBy:method==='Cash'?values.cashReceivedBy || '':''}};
}
