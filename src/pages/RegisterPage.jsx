import { useAppState } from '../AppState';

function RegisterPage() {
  const { access, registration, handleRegister, updateRegistration } = useAppState();

  // Defensive Checks based on MySQL Database Constraints
  const isInvalidID = registration.idNumber.length > 0 && registration.idNumber.length !== 13;
  const isInvalidEmail = registration.contact.length > 100;
  const isInvalidPassword = registration.password.length > 0 && registration.password.length < 6;

  return (
    <section className="panel form-panel single-page-panel">
      <div className="section-heading compact">
        <div>
          <p className="section-tag"></p>
          <h3>Create a verified client profile</h3>
        </div>
        <span className={`pill ${access.registered ? 'pill-success' : 'pill-muted'}`}>
          {access.verified ? 'Verified' : access.registered ? 'OTP sent' : 'Pending'}
        </span>
      </div>

      <form className="stack" onSubmit={handleRegister}>
        <div className="field-grid">
          <label>
            First name
            <input 
              value={registration.firstName} 
              onChange={(event) => updateRegistration('firstName', event.target.value)} 
              required 
            />
          </label>
          <label>
            Last name
            <input 
              value={registration.lastName} 
              onChange={(event) => updateRegistration('lastName', event.target.value)} 
              required 
            />
          </label>
        </div>

        {/* Defensive Guard: Email Constraint (VARCHAR(100)) */}
        <label>
          Contact email (Unique database index)
          <input 
            className={isInvalidEmail ? 'input-error' : ''}
            value={registration.contact} 
            onChange={(event) => updateRegistration('contact', event.target.value)} 
            type="email" 
            required 
          />
          {isInvalidEmail && (
            <p className="error-text" style={{ color: 'red', fontSize: '0.8rem', marginTop: '4px' }}>
              ⚠️ Constraint Error: Email exceeds MySQL specification of 100 characters.
            </p>
          )}
        </label>

        {/* Defensive Guard: Password Strength Check */}
        <label>
          Account Password
          <input 
            className={isInvalidPassword ? 'input-error' : ''}
            value={registration.password} 
            onChange={(event) => updateRegistration('password', event.target.value)} 
            type="password" 
            placeholder="Create a password" 
            required={!access.registered}
          />
          {isInvalidPassword && (
            <p className="error-text" style={{ color: 'red', fontSize: '0.8rem', marginTop: '4px' }}>
              ⚠️ Defensive Guard: Password must be at least 6 characters long for hashing.
            </p>
          )}
        </label>

        {/* Defensive Guard: Identity Number Constraint (VARCHAR(13)) */}
        <label>
          Identity number (Must be exactly 13 digits)
          <input 
            className={isInvalidID ? 'input-error' : ''}
            value={registration.idNumber} 
            onChange={(event) => updateRegistration('idNumber', event.target.value)} 
            inputMode="numeric" 
            maxLength={13} 
            placeholder="South African ID Number" 
            required 
          />
          {isInvalidID && (
            <p className="error-text" style={{ color: 'red', fontSize: '0.8rem', marginTop: '4px' }}>
              ⚠️ Constraint Error: MySQL requires exactly 13 digits. Current count: {registration.idNumber.length}/13
            </p>
          )}
        </label>

        <label>
          OTP
          <input 
            value={registration.otp} 
            onChange={(event) => updateRegistration('otp', event.target.value)} 
            placeholder="Use 246810 for this demo" 
            inputMode="numeric" 
            maxLength={6} 
          />
        </label>

        {/* Defensive Button Disabling */}
        <button 
          className="button button-primary" 
          type="submit"
          disabled={isInvalidID || isInvalidEmail || isInvalidPassword}
          style={{ opacity: (isInvalidID || isInvalidEmail || isInvalidPassword) ? 0.5 : 1 }}
        >
          {access.registered ? 'Verify OTP Code' : 'Verify profile'}
        </button>
      </form>
    </section>
  );
}

export default RegisterPage;
