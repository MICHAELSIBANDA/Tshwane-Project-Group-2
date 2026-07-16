export const workflow = [
  {
    title: 'Register',
    description: 'Create a client profile with personal details and verify contact information with OTP.',
  },
  {
    title: 'Authenticate',
    description: 'Use a secure login flow to access the account and linked bus card balance.',
  },
  {
    title: 'Top up',
    description: 'Choose an amount, submit payment details, and confirm the deposited value.',
  },
  {
    title: 'Update card',
    description: 'The system applies the payment result to the linked Tshwane Bus Card balance.',
  },
];

export const defaultTransactions = [
  { label: 'Card linked', amount: 'AY-4829-3310', tone: 'success' },
  { label: 'Previous balance', amount: 'R 286.75', tone: 'muted' },
];

export const paymentMethods = ['Debit card', 'Credit card', 'Instant EFT'];

export const initialRegistration = {
  firstName: 'Naledi',
  lastName: 'Mokoena',
  contact: 'naledi.mokoena@example.co.za',
  idNumber: '9304115867082',
  otp: '',
};

export const initialLogin = {
  cardNumber: 'AY-4829-3310',
  pin: '2514',
};

export const initialPayment = {
  amount: 50,
  cardHolder: 'Naledi Mokoena',
  cardNumber: '4242 4242 4242 4242',
  expiry: '08/28',
  cvv: '246',
  method: 'Debit card',
};
