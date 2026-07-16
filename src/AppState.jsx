import React, { createContext, useContext, useState, useEffect } from 'react';

const AppStateContext = createContext();

export function AppStateProvider({ children }) {
  // Session tracking: maps to active user email
  const [activeUserEmail, setActiveUserEmail] = useState("user@example.com");

  // HomePage metric variables
  const [progress, setProgress] = useState(0);
  const [formattedBalance, setFormattedBalance] = useState("R 0.00");
  const [message, setMessage] = useState({ 
    title: "Loading...", 
    body: "Awaiting system processing initialization.", 
    tone: "muted" 
  });

  // RegisterPage / TopUpPage / LoginPage session flags
  const [access, setAccess] = useState({ 
    registered: false, 
    verified: false,
    loggedIn: false // 👈 Changed to false by default so login functionality can be fully demonstrated [1]
  });

  // RegisterPage form tracking attributes
  const [registration, setRegistration] = useState({ 
    firstName: '', 
    lastName: '', 
    contact: '', 
    idNumber: '', 
    otp: '' 
  });

  // TopUpPage form tracking attributes
  const [payment, setPayment] = useState({
    amount: '',
    cardHolder: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    method: 'Visa'
  });

  // 👈 NEW: LoginPage state parameters to prevent empty/undefined render crashes
  const [login, setLogin] = useState({
    cardNumber: '',
    pin: ''
  });

  // Handler state updates
  const updateRegistration = (field, value) => {
    setRegistration(prev => ({ ...prev, [field]: value }));
  };

  const updatePayment = (field, value) => {
    setPayment(prev => ({ ...prev, [field]: value }));
  };

  // 👈 NEW: Dynamic input handler helper explicitly mapping typing keys for LoginPage inputs [1]
  const updateLogin = (field, value) => {
    setLogin(prev => ({ ...prev, [field]: value }));
  };

  // 1. LIVE REFRESH FOR DASHBOARD COMPONENT CARD
  const fetchWalletSnapshot = async (email) => {
    try {
      const response = await fetch(`http://localhost:8000/api/wallet/snapshot?email=${email}`);
      if (!response.ok) throw new Error("Dashboard metrics mismatch.");
      
      const data = await response.json();
      setFormattedBalance(data.formattedBalance);
      setProgress(data.progress);
      setMessage(data.message);
    } catch (error) {
      console.error("Dashboard connection error:", error);
    }
  };

  useEffect(() => {
    if (activeUserEmail) {
      fetchWalletSnapshot(activeUserEmail);
    }
  }, [activeUserEmail]);

  // 2. DISPATCH SUBMISSIONS TO FASTAPI BACKEND
  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: registration.firstName,
          lastName: registration.lastName,
          contact: registration.contact,
          idNumber: registration.idNumber,
          otp: registration.otp
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Registration Error: ${errorData.detail}`);
        return;
      }

      const data = await response.json();
      setAccess(prev => ({ ...data.status, loggedIn: prev.loggedIn }));
      
      if (data.status.verified) {
        setActiveUserEmail(registration.contact);
      }
      
      alert(data.message);
    } catch (error) {
      console.error("Connection error:", error);
      alert("Could not connect to the local FastAPI backend server.");
    }
  };

  // 3. POST HANDLER TO TRANSFER TOP-UP TRANSACTIONS INTO MYSQL TABLES
  const handleTopUp = async (event) => {
    event.preventDefault();

    if (!payment.amount || !payment.cardNumber) {
      alert("Please complete the payment fields before validation.");
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
        alert(`Payment Rejected: ${err.detail}`);
        return;
      }

      const data = await response.json();
      alert(data.message);
      fetchWalletSnapshot(activeUserEmail);
      setPayment({ amount: '', cardHolder: '', cardNumber: '', expiry: '', cvv: '', method: 'Visa' });
    } catch (error) {
      console.error("Top-up communication error:", error);
      alert("Failed to reach out to payment network servers.");
    }
  };

  // 4. 👈 NEW: SUBMIT HANDLER DISPATCHING PAYLOAD TO FASTAPI LOGIN ROUTE [1]
  const handleLogin = async (event) => {
    event.preventDefault();

    if (!login.cardNumber || !login.pin) {
      alert("Please enter your Bus Card number and PIN.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardNumber: login.cardNumber,
          pin: login.pin
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Login Failed: ${errorData.detail}`);
        return;
      }

      const data = await response.json();
      
      // Update access state: toggle loggedIn to true and merge existing verified state
      setAccess(prev => ({ ...prev, loggedIn: true }));
      
      // Update session tracking to use the user email sent back by the backend database lookup
      setActiveUserEmail(data.email);
      
      alert(data.message);
      
      // Reset input form fields upon successful authorization
      setLogin({ cardNumber: '', pin: '' });
    } catch (error) {
      console.error("Login verification network error:", error);
      alert("Unable to reach the backend application gateway server.");
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
      // 👈 NEW: Exporting login utilities out into context subscribers [1]
      login,
      updateLogin,
      handleLogin
    }}>
      {children}
    </AppStateContext.Provider>
  );
}

export const useAppState = () => useContext(AppStateContext);
