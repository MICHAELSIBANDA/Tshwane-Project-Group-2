import { useAppState } from '../AppState';

function LoginPage() {
  const { access, login, handleLogin, updateLogin, message } = useAppState();

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
        <label>
          Bus card number
          <input value={login.cardNumber} onChange={(event) => updateLogin('cardNumber', event.target.value)} />
        </label>
        <label>
          PIN
          <input
            value={login.pin}
            onChange={(event) => updateLogin('pin', event.target.value)}
            type="password"
            inputMode="numeric"
          />
        </label>
        <button className="button button-secondary" type="submit">
          Log in
        </button>
        <p className="page-note">{message.body}</p>
      </form>
    </section>
  );
}

export default LoginPage;
