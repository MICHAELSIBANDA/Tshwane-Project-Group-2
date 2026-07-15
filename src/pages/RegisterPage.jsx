import { useAppState } from '../AppState';

function RegisterPage() {
  const { access, registration, handleRegister, updateRegistration } = useAppState();

  return (
    <section className="panel form-panel single-page-panel">
      <div className="section-heading compact">
        <div>
          <p className="section-tag">Sign-up</p>
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
            <input value={registration.firstName} onChange={(event) => updateRegistration('firstName', event.target.value)} />
          </label>
          <label>
            Last name
            <input value={registration.lastName} onChange={(event) => updateRegistration('lastName', event.target.value)} />
          </label>
        </div>
        <label>
          Contact email
          <input
            value={registration.contact}
            onChange={(event) => updateRegistration('contact', event.target.value)}
            type="email"
          />
        </label>
        <label>
          Identity number
          <input
            value={registration.idNumber}
            onChange={(event) => updateRegistration('idNumber', event.target.value)}
            inputMode="numeric"
          />
        </label>
        <label>
          OTP
          <input
            value={registration.otp}
            onChange={(event) => updateRegistration('otp', event.target.value)}
            placeholder="Use 246810 for this demo"
            inputMode="numeric"
          />
        </label>
        <button className="button button-primary" type="submit">
          Verify profile
        </button>
      </form>
    </section>
  );
}

export default RegisterPage;
