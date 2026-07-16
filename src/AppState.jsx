import React, { createContext, useContext, useState, useEffect } from 'react';

const AppStateContext = createContext();

export function AppStateProvider({ children }) {
  // Session tracking: maps to the active verified client's email context
  const [activeUserEmail, setActiveUserEmail] = useState("user@example.com");

  // HomePage dashboard visualization metrics
  const [progress, setProgress] = useState(0);
  const [formattedBalance, setFormattedBalance] = useState("R 0.00");
  const [message, setMessage] = useState({ 
    title: "Loading...", 
    body: "Awaiting system processing initialization.", 
    tone: "muted" 
  });

  // Client lifecycle workflow session status flags
  const [access, setAccess] = useState({ 
    registered: false, 
    verified: false, 
    loggedIn: false 
  });

  // RegisterPage input attributes (Maps to custom Client table schema)
  const [registration, setRegistration] = useState({ 
    firstName: '', 
    lastName: '', 
    contact: '', // VARCHAR(100)
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

  // --- 1. DYNAMIC REFRESH FOR DASHBOARD COMPONENT METRICS ---
  const fetchWalletSnapshot = async (email) => {
    try {
      const response = await fetch(`http://localhost:8000/api/wallet/snapshot?email=${email}`);
      if (!response.ok) throw new Error("Dashboard metrics schema parsing breakdown.");
      
      const data = await response.json();
      setFormattedBalance(data.formattedBalance);
      setProgress(data.progress);
      setMessage(data.message);
    } catch (error) {
      console.error("Dashboard connection sync error:", error);
    }
  };

  useEffect(() => {
    if (activeUserEmail) {
      fetchWalletSnapshot(activeUserEmail);
    }
  }, [activeUserEmail]);

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
      const response = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: registration.firstName,
          lastName: registration.lastName,
          contact: registration.contact,
          idNumber: registration.idNumber,
          password: registration.password,
          otp: registration.otp
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Database Server Rejection:\n${errorData.detail}`);
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

    if (!payment.amount || !payment.cardNumber) {
      alert("Please complete the payment fields before proceeding.");
      return;
    }

    // 🛑 DEFENSIVE GUARD: Enforce maximum sizes matching BankCard and Transaction schema fields
    if (payment.cardNumber.length < 12 || payment.cardNumber.length > 20) {
      alert("Defensive Programming Guard:\nSubmission rejected. Bank Card Number size must sit between 12 and 20 digits to remain compliant with database constraints.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: activeUserEmail,
          amount: parseFloat(payment.amount),
          cardHolder: payment.cardHolder,
          cardNumber: payment.cardNumber,
          expiry: payment.expiry,
          method: payment.method
        })
      });

      if (!response.ok) {
        const err = await response.json();
        alert(`Payment Transaction Failure:\n${err.detail}`);
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

  // --- 4. DEFENSIVE DISPATCH FOR EMAIL & SECURE PASSWORD USER AUTHENTICATION (LOGIN) ---
  const handleLogin = async (event) => {
    event.preventDefault();

    if (!login.contact || !login.password) {
      alert("Please complete your account profile email and password parameters.");
      return;
    }

    // 🛑 DEFENSIVE GUARD: Pre-check boundaries locally to prevent database strain attacks
    if (login.contact.length > 100) {
      alert("Defensive Programming Guard:\nLogin attempt blocked. Input length violates system schema capacity parameters.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: login.contact,   // Maps directly to your backend LoginRequest model validation attributes
          password: login.password  // Maps directly to your backend LoginRequest model validation attributes
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Authentication Failure:\n${errorData.detail}`);
        return;
      }

      const data = await response.json();
      
      // Toggle session permissions
      setAccess(prev => ({ ...prev, loggedIn: true }));
      
      // Point live session context to the target user account returned from your MySQL schema join lookup
      setActiveUserEmail(data.email);
      
      alert(data.message);
      
      // Clear password memory configurations cleanly upon authorization approval
      setLogin({ contact: '', password: '' });
    } catch (error) {
      console.error("Secure authorization pipeline exception:", error);
      alert("Unable to safely reach the backend core authentication engine gateway.");
    }
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
      handleLogin 
    }}>
      {children}
    </AppStateContext.Provider>
  );
}

export const useAppState = () => useContext(AppStateContext);
