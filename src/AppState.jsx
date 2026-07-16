import React, { createContext, useContext, useState, useEffect } from 'react';

const AppStateContext = createContext();

export function AppStateProvider({ children }) {
  // Session tracking: maps to active user email
  const [activeUserEmail, setActiveUserEmail] = useState("user@example.com");

  // HomePage metric variables
  const [progress, setProgress] = useState(0);
  const [formattedBalance, setFormattedBalance] = useState("R 0.00");
  const [message, setMessage] = useState({ title: "Loading...", body: "", tone: "muted" });

  // RegisterPage form attributes
  const [access, setAccess] = useState({ registered: false, verified: false });
  const [registration, setRegistration] = useState({
    firstName: '',
    lastName: '',
    contact: '',
    idNumber: '',
    otp: ''
  });

  const updateRegistration = (field, value) => {
    setRegistration(prev => ({ ...prev, [field]: value }));
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
      setAccess(data.status);
      
      if (data.status.verified) {
        setActiveUserEmail(registration.contact);
      }
      
      alert(data.message);
    } catch (error) {
      console.error("Connection error:", error);
      alert("Could not connect to the local FastAPI backend server.");
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
      handleRegister
    }}>
      {children}
    </AppStateContext.Provider>
  );
}

export const useAppState = () => useContext(AppStateContext);
