import { useAppState } from '../AppState';

function LoginPage() {
  const { access, login, handleLogin, updateLogin, message } = useAppState();

  // 🛑 DEFENSIVE PROGRAMMING CONTRAINTS: Real-time validation checks
  // Enforces Client.Email VARCHAR(100) and standard cryptographic minimum size rules
  const isInvalidEmailLength = login.contact.length > 100;
  const isInvalidPasswordLength = login.password.length > 0 && login.password.length < 6;

  return (
    <section className="panel form-panel single-page-panel">
      <div className="section-heading compact">
        <div>
          <p className="section-tag">Login</p>
          <h3>Secure access to the linked account</h3>
        </div>
        <span className={`pill ${access.loggedIn ? 'pill-success' : 'pill-muted'}`}>
          {access.loggedIn ? 'Session open' : 'Locked'}
        </span>
      </div>

      <form className="stack" onSubmit={handleLogin}>
        
        {/* Email Input Field — Defensively managed against MySQL VARCHAR(100) constraints */}
        <label>
          Contact email address
          <input 
            className={isInvalidEmailLength ? 'input-error' : ''}
            value={login.contact} 
            onChange={(event) => updateLogin('contact', event.target.value)} 
            type="email"
            placeholder="Enter your registered account email"
            required
          />
          {isInvalidEmailLength && (
            <p className="error-text" style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '6px', fontWeight: '500' }}>
              ⚠️ Constraint Error: Input length violates MySQL spec limits. Max allocation: 100 characters. ({login.contact.length}/100)
            </p>
          )}
        </label>

        {/* Password Input Field — Defensively checked before executing cryptographic matches */}
        <label>
          Account Password
          <input 
            className={isInvalidPasswordLength ? 'input-error' : ''}
            value={login.password} 
            onChange={(event) => updateLogin('password', event.target.value)} 
            type="password" 
            placeholder="Enter your account secure password"
            required
          />
          {isInvalidPasswordLength && (
            <p className="error-text" style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '6px', fontWeight: '500' }}>
              ⚠️ Defensive Guard: Input value must be 6 or more characters to evaluate database string context hashes safely.
            </p>
          )}
        </label>

        {/* 🛑 DEFENSIVE TRANSMISSION GUARD BUTTON */}
        {/* Disables button interaction, sets opacity, and flags cursor type to enforce rules locally */}
        <button 
          className="button button-secondary" 
          type="submit"
          disabled={isInvalidEmailLength || isInvalidPasswordLength}
          style={{ 
            opacity: (isInvalidEmailLength || isInvalidPasswordLength) ? 0.5 : 1,
            cursor: (isInvalidEmailLength || isInvalidPasswordLength) ? 'not-allowed' : 'pointer'
          }}
        >
          Log in
        </button>

        <p className="page-note" style={{ transition: 'color 0.2s ease' }}>{message.body}</p>
      </form>
    </section>
  );
}

export default LoginPage;
