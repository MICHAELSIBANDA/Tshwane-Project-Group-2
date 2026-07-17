import React, { createContext, useContext, useState, useEffect } from 'react';

const AppStateContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const defaultAccess = {
  registered: false,
  verified: false,
  loggedIn: false,
  user: null,
};

const defaultMessage = {
  title: 'Ready to start',
  body: 'Log in or register to load your wallet snapshot from the backend.',
  tone: 'muted',
};

async function readErrorMessage(response) {
  try {
    const errorData = await response.json();
    return errorData.detail || errorData.message || 'Unknown server error.';
  } catch {
    return 'Unknown server error.';
  }
}

export function AppStateProvider({ children }) {
  // Session tracking: maps to the active verified client's email context
  const [activeUserEmail, setActiveUserEmail] = useState(null);

  // HomePage dashboard visualization metrics
  const [progress, setProgress] = useState(0);
  const [formattedBalance, setFormattedBalance] = useState("R 0.00");
  const [message, setMessage] = useState(defaultMessage);

  // Client lifecycle workflow session status flags
  const [access, setAccess] = useState(defaultAccess);

  // RegisterPage input attributes (Maps to custom Client table schema)
  const [registration, setRegistration] = useState({ 
    firstName: '', 
    lastName: '', 
    contact: '', // VARCHAR(100)
    phoneNumber: '', // Phone number field
    idNumber: '', // VARCHAR(13)
    password: '', // VARCHAR(255)
    otp: '' 
  });

  // TopUpPage financial entry configuration models
  const [payment, setPayment] = useState({
    amount: '',
    cardHolder: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    method: 'Visa'
  });

  // LoginPage state attributes defensively bound to Email and Cryptographic Password fields
  const [login, setLogin] = useState({
    contact: '',  // Tracks input address string targets
    password: ''  // Tracks clear text input password strings before encryption matches
  });

  // --- Dynamic Real-time Text Mappers ---
  const updateRegistration = (field, value) => {
    setRegistration(prev => ({ ...prev, [field]: value }));
  };

  const updatePayment = (field, value) => {
    setPayment(prev => ({ ...prev, [field]: value }));
  };

  const updateLogin = (field, value) => {
    setLogin(prev => ({ ...prev, [field]: value }));
  };

  const persistSession = (nextAccess, nextUser) => {
    localStorage.setItem('appUser', JSON.stringify(nextUser));
    localStorage.setItem('appAccess', JSON.stringify(nextAccess));
  };

  const applySessionUpdate = (nextAccess, nextUser) => {
    setAccess(nextAccess);
    setActiveUserEmail(nextUser?.email ?? null);
    persistSession(nextAccess, nextUser);
  };

  // --- 1. DYNAMIC REFRESH FOR DASHBOARD COMPONENT METRICS ---
  const fetchWalletSnapshot = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wallet/snapshot?email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }
      
      const data = await response.json();
      setFormattedBalance(data.formattedBalance);
      setProgress(data.progress);
      setMessage(data.message);
    } catch (error) {
      console.error("Dashboard connection sync error:", error);
      setMessage(defaultMessage);
    }
  };

  useEffect(() => {
    if (activeUserEmail) {
          if (login.password.length < 6) {
            alert("Defensive Programming Guard:\nPassword must be at least 6 characters long.");
            return;
          }
      fetchWalletSnapshot(activeUserEmail);
    }
  }, [activeUserEmail]);

  // --- 1b. RESTORE SESSION FROM LOCALSTORAGE ON MOUNT ---
  // Defensive Guard: Automatically re-authenticate users with valid stored tokens
  useEffect(() => {
    const storedUser = localStorage.getItem('appUser');
    const storedAccess = localStorage.getItem('appAccess');
    
    if (storedUser && storedAccess) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const parsedAccess = JSON.parse(storedAccess);
        const restoredAccess = {
          ...defaultAccess,
          ...parsedAccess,
          user: parsedAccess.user ?? parsedUser,
        };

        setAccess(restoredAccess);
        setActiveUserEmail(parsedUser?.email ?? restoredAccess.user?.email ?? null);
      } catch (error) {
        console.error("Session restoration error - localStorage corruption detected:", error);
        // Clear corrupted data and require fresh login
        localStorage.removeItem('appUser');
        localStorage.removeItem('appAccess');
      }
    }
  }, []);

  // --- 2. DEFENSIVE DISPATCH FOR USER REGISTRATION PIPELINE ---
  const handleRegister = async (event) => {
    event.preventDefault();

    // 🛑 DEFENSIVE GUARD: Pre-emptively intercept bad lengths before database trips
    if (!access.registered && registration.idNumber.length !== 13) {
      alert("Defensive Programming Guard:\nSubmission blocked locally. Your Identification Number does not conform to the strict 13-character model constraint inside the MySQL Client table.");
      return;
    }

    if (registration.contact.length > 100) {
      alert("Defensive Programming Guard:\nSubmission blocked locally. Your Email length exceeds the maximum allowed VARCHAR(100) spatial boundaries inside the system database layout.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: registration.firstName,
          lastName: registration.lastName,
          contact: registration.contact,
          phoneNumber: registration.phoneNumber,
          idNumber: registration.idNumber,
          password: registration.password,
          otp: registration.otp
        })
      });

      if (!response.ok) {
        const errorMessage = await readErrorMessage(response);
        alert(`Database Server Rejection:\n${errorMessage}`);
        return;
      }

      const data = await response.json();
      
      // Preserve current user login status during intermediate state transitions
      setAccess(prev => ({ ...data.status, loggedIn: prev.loggedIn }));
      
      if (data.status.verified) {
        setActiveUserEmail(registration.contact);
      }

      alert(data.message);
    } catch (error) {
      console.error("Registration network interface exception:", error);
      alert("Could not reach the local FastAPI backend server application gateway.");
    }
  };

  // --- 3. DEFENSIVE DISPATCH FOR WALLET FUND INCREMENTATION (TOP-UP) ---
  const handleTopUp = async (event) => {
    event.preventDefault();

    if (!access.loggedIn || !access.user?.email) {
      alert("Please log in before attempting a top-up.");
      return;
    }

    const needsNewBankCard = !access.user.bankCardId;

    if (!payment.amount || (needsNewBankCard && !payment.cardNumber)) {
      alert("Please complete the payment fields before proceeding.");
      return;
    }

    // 🛑 DEFENSIVE GUARD: Enforce maximum sizes matching BankCard and Transaction schema fields
    if (needsNewBankCard && (payment.cardNumber.length < 12 || payment.cardNumber.length > 20)) {
      alert("Defensive Programming Guard:\nSubmission rejected. Bank Card Number size must sit between 12 and 20 digits to remain compliant with database constraints.");
      return;
    }

    try {
      const email = access.user.email;
      let bankCardId = access.user.bankCardId;

      if (!access.user.cardNumber) {
        const linkResponse = await fetch(`${API_BASE_URL}/api/wallet/link-card`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contact: email }),
        });

        if (!linkResponse.ok) {
          const errorMessage = await readErrorMessage(linkResponse);
          if (!errorMessage.toLowerCase().includes('already has a linked bus card')) {
            alert(`Bus Card Setup Failure:\n${errorMessage}`);
            return;
          }
        } else {
          const linkData = await linkResponse.json();
          const updatedUser = { ...access.user, cardNumber: linkData.cardNumber };
          const updatedAccess = { ...access, user: updatedUser };
          setAccess(updatedAccess);
          persistSession(updatedAccess, updatedUser);
        }
      }

      if (!bankCardId) {
        const addCardResponse = await fetch(`${API_BASE_URL}/api/wallet/add-bank-card`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contact: email,
            cardNumber: payment.cardNumber,
            cardHolderName: payment.cardHolder,
            expiryDate: payment.expiry,
            bankName: payment.method,
          }),
        });

        if (!addCardResponse.ok) {
          const errorMessage = await readErrorMessage(addCardResponse);
          alert(`Bank Card Setup Failure:\n${errorMessage}`);
          return;
        }

        const addCardData = await addCardResponse.json();
        bankCardId = addCardData.bankCardId;
        const updatedUser = { ...access.user, bankCardId };
        const updatedAccess = { ...access, user: updatedUser };
        setAccess(updatedAccess);
        persistSession(updatedAccess, updatedUser);
      }

      const response = await fetch(`${API_BASE_URL}/api/wallet/topup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: email,
          amount: parseFloat(payment.amount),
          bankCardId,
        })
      });

      if (!response.ok) {
        const errorMessage = await readErrorMessage(response);
        alert(`Payment Transaction Failure:\n${errorMessage}`);
        return;
      }

      const data = await response.json();
      alert(data.message);
      
      // Force instantaneous graphical loop updates for the dashboard ring and values
      fetchWalletSnapshot(activeUserEmail);
      
      // Clean payment form parameters out of volatile memory tracking states
      setPayment({ amount: '', cardHolder: '', cardNumber: '', expiry: '', cvv: '', method: 'Visa' });
    } catch (error) {
      console.error("Top-up transaction gateway error:", error);
      alert("Failed to communicate transaction parameters across network pipes.");
    }
  };

  // --- 4. DISPATCH FOR EMAIL & PASSWORD USER AUTHENTICATION (LOGIN) ---
  const handleLogin = async (event) => {
    event.preventDefault();

    if (!login.contact || !login.password) {
      alert("Please complete your email and password.");
      return;
    }

    if (login.contact.length > 100) {
      alert("Defensive Programming Guard:\nLogin attempt blocked. Input length violates system schema capacity parameters.");
      return;
    }

    if (login.password.length < 6) {
      alert("Defensive Programming Guard:\nPassword must be at least 6 characters long.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: login.contact,
          password: login.password,
        }),
      });

      if (!response.ok) {
        const errorMessage = await readErrorMessage(response);
        alert(`Authentication Failure:\n${errorMessage}`);
        return;
      }

      const data = await response.json();
      const userData = data.user ?? {
        name: login.contact.split('@')[0],
        email: login.contact,
        cardNumber: null,
      };
      const nextAccess = {
        ...access,
        ...data.status,
        loggedIn: true,
        user: userData,
      };

      applySessionUpdate(nextAccess, userData);

      alert(`Authentication Success:\nWelcome back, ${userData.name}! Your session has been restored.`);

      setLogin({ contact: '', password: '' });
    } catch (error) {
      console.error("Authentication network exception:", error);
      alert("Could not reach the local FastAPI backend server application gateway.");
    }
  };

  // --- 4b. LOGOUT HANDLER ---
  // Clears user session from state and localStorage
  const handleLogout = () => {
    // Clear persistent storage
    localStorage.removeItem('appUser');
    localStorage.removeItem('appAccess');
    
    // Reset session state
    setAccess(defaultAccess);
    setProgress(0);
    setFormattedBalance("R 0.00");
    
    setActiveUserEmail(null);
    setLogin({ contact: '', password: '' });
    setMessage(defaultMessage);
    
    alert("You have been logged out successfully.");
  };

  return (
    <AppStateContext.Provider value={{ 
      access, 
      registration, 
      formattedBalance, 
      message, 
      progress, 
      updateRegistration, 
      handleRegister, 
      payment, 
      updatePayment, 
      handleTopUp, 
      login, 
      updateLogin, 
      handleLogin,
      handleLogout
    }}>
      {children}
    </AppStateContext.Provider>
  );
}

export const useAppState = () => useContext(AppStateContext);