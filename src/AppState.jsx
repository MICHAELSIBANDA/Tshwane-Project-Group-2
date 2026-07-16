import { createContext, useContext, useEffect, useState } from 'react';
import {
  defaultTransactions,
  initialLogin,
  initialPayment,
  initialRegistration,
} from './busServicesData';

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [activeUserEmail, setActiveUserEmail] = useState(initialRegistration.contact);
  const [registration, setRegistration] = useState(initialRegistration);
  const [login, setLogin] = useState(initialLogin);
  const [payment, setPayment] = useState(initialPayment);
  const [balance, setBalance] = useState(286.75);
  const [history, setHistory] = useState(defaultTransactions);
  const [formattedBalance, setFormattedBalance] = useState('R 286.75');
  const [progress, setProgress] = useState(33);
  const [message, setMessage] = useState({
    title: 'Ready for your next top-up',
    body: 'Register, verify, log in, and complete a top-up in one guided flow.',
    tone: 'neutral',
  });
  const [access, setAccess] = useState({ registered: false, loggedIn: false, verified: false });

  function setLocalAccess(nextAccess) {
    setAccess((current) => ({ ...current, ...nextAccess }));
  }

  async function fetchWalletSnapshot(email) {
    try {
      const response = await fetch(`http://localhost:8000/api/wallet/snapshot?email=${email}`);

      if (!response.ok) {
        throw new Error('Dashboard metrics mismatch.');
      }

      const data = await response.json();

      if (typeof data.formattedBalance === 'string') {
        setFormattedBalance(data.formattedBalance);
      }

      if (typeof data.progress === 'number') {
        setProgress(data.progress);
      }

      if (data.message && typeof data.message === 'object') {
        setMessage(data.message);
      }
    } catch (error) {
      console.error('Dashboard connection error:', error);
    }
  }

  useEffect(() => {
    if (activeUserEmail) {
      fetchWalletSnapshot(activeUserEmail);
    }
  }, [activeUserEmail]);

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
      setLocalAccess({ registered: true, verified: false, loggedIn: false });
      setProgress(33);
      notify('OTP sent', 'A one-time pin has been dispatched to the registered contact method.', 'success');
      return;
    }

    if (registration.otp !== '246810') {
      notify('OTP did not match', 'Enter the six-digit OTP to verify the new client profile.', 'warning');
      return;
    }

    setLocalAccess({ registered: true, verified: true });
    setActiveUserEmail(registration.contact);
    setProgress(66);
    notify('Client verified', 'The profile is authenticated and ready for secure login.', 'success');
  }

  function handleLogin(event) {
    event.preventDefault();

    if (!access.verified) {
      notify('Verification required', 'Complete the backend registration and OTP verification before login.', 'warning');
      return;
    }

    if (!login.cardNumber || !login.pin) {
      notify('Missing login details', 'Enter the bus card number and PIN to continue.', 'warning');
      return;
    }

    if (login.cardNumber !== 'AY-4829-3310' || login.pin !== '2514') {
      notify('Login failed', 'The current backend branch does not expose a login endpoint yet, so this page still uses local validation.', 'warning');
      return;
    }

    setLocalAccess({ loggedIn: true });
    setProgress(100);
    notify('Session ready', 'Login is currently frontend-gated until the backend adds a login route.', 'success');
  }

  function handleTopUp(event) {
    event.preventDefault();

    if (!access.loggedIn) {
      notify('Login required', 'Login is still frontend-gated because the backend branch does not expose a top-up route yet.', 'warning');
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
    setFormattedBalance(`R ${nextBalance.toFixed(2)}`);
    setHistory((current) => [
      { label: 'Top-up approved', amount: `+ R ${Number(payment.amount).toFixed(2)}`, tone: 'success' },
      { label: 'Updated balance', amount: `R ${nextBalance.toFixed(2)}`, tone: 'accent' },
      ...current,
    ]);
    notify('Payment approved', `R ${Number(payment.amount).toFixed(2)} has been credited locally. The backend branch still needs a top-up endpoint to persist it.`, 'success');
  }

  const value = {
    activeUserEmail,
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
