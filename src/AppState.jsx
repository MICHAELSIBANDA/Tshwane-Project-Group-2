import { createContext, useContext, useMemo, useState } from 'react';
import {
  defaultTransactions,
  initialLogin,
  initialPayment,
  initialRegistration,
} from './busServicesData';

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [registration, setRegistration] = useState(initialRegistration);
  const [login, setLogin] = useState(initialLogin);
  const [payment, setPayment] = useState(initialPayment);
  const [balance, setBalance] = useState(286.75);
  const [history, setHistory] = useState(defaultTransactions);
  const [message, setMessage] = useState({
    title: 'Ready for your next top-up',
    body: 'Register, verify, log in, and complete a top-up in one guided flow.',
    tone: 'neutral',
  });
  const [access, setAccess] = useState({ registered: false, loggedIn: false, verified: false });

  const formattedBalance = useMemo(() => `R ${balance.toFixed(2)}`, [balance]);
  const progress = access.registered ? (access.loggedIn ? 100 : 66) : 33;

  function updateRegistration(field, value) {
    setRegistration((current) => ({ ...current, [field]: value }));
  }

  function updateLogin(field, value) {
    setLogin((current) => ({ ...current, [field]: value }));
  }

  function updatePayment(field, value) {
    setPayment((current) => ({ ...current, [field]: value }));
  }

  function notify(title, body, tone = 'neutral') {
    setMessage({ title, body, tone });
  }

  function handleRegister(event) {
    event.preventDefault();

    if (!registration.firstName || !registration.lastName || !registration.contact || !registration.idNumber) {
      notify('Complete the registration form', 'All personal details are required before the OTP can be sent.', 'warning');
      return;
    }

    if (!registration.otp) {
      setAccess((current) => ({ ...current, registered: true, verified: false }));
      notify('OTP sent', 'A one-time pin has been dispatched to the registered contact method.', 'success');
      return;
    }

    if (registration.otp !== '246810') {
      notify('OTP did not match', 'Enter the six-digit OTP to verify the new client profile.', 'warning');
      return;
    }

    setAccess((current) => ({ ...current, registered: true, verified: true }));
    notify('Client verified', 'The profile is authenticated and ready for secure login.', 'success');
  }

  function handleLogin(event) {
    event.preventDefault();

    if (!access.verified) {
      notify('Verify the profile first', 'The user must complete OTP verification before login.', 'warning');
      return;
    }

    if (!login.cardNumber || !login.pin) {
      notify('Missing login details', 'Enter the bus card number and PIN to continue.', 'warning');
      return;
    }

    if (login.cardNumber !== 'AY-4829-3310' || login.pin !== '2514') {
      notify('Login failed', 'Credentials do not match the client record in this demo.', 'warning');
      return;
    }

    setAccess((current) => ({ ...current, loggedIn: true }));
    notify('Welcome back', 'Secure session established. You can now top up the linked bus card.', 'success');
  }

  function handleTopUp(event) {
    event.preventDefault();

    if (!access.loggedIn) {
      notify('Login required', 'Authenticate before starting a top-up.', 'warning');
      return;
    }

    if (!payment.amount || Number(payment.amount) <= 0) {
      notify('Enter a valid amount', 'The top-up value must be greater than zero.', 'warning');
      return;
    }

    if (!payment.cardHolder || !payment.cardNumber || !payment.expiry || !payment.cvv) {
      notify('Payment details incomplete', 'Bank card details are required for authorization.', 'warning');
      return;
    }

    const nextBalance = balance + Number(payment.amount);
    setBalance(nextBalance);
    setHistory((current) => [
      { label: 'Top-up approved', amount: `+ R ${Number(payment.amount).toFixed(2)}`, tone: 'success' },
      { label: 'Updated balance', amount: `R ${nextBalance.toFixed(2)}`, tone: 'accent' },
      ...current,
    ]);
    notify('Payment approved', `R ${Number(payment.amount).toFixed(2)} has been credited to the bus card balance.`, 'success');
  }

  const value = {
    registration,
    login,
    payment,
    balance,
    history,
    message,
    access,
    formattedBalance,
    progress,
    updateRegistration,
    updateLogin,
    updatePayment,
    handleRegister,
    handleLogin,
    handleTopUp,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }

  return context;
}
