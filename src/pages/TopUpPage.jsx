import { paymentMethods } from '../busServicesData';
import { useAppState } from '../AppState';

function TopUpPage() {
  const { access, formattedBalance, payment, handleTopUp, updatePayment } = useAppState();

  return (
    <section className="grid-two single-page-grid">
      <article className="panel form-panel accent-panel">
        <div className="section-heading compact">
          <div>
            <p className="section-tag">Top up</p>
            <h3>Process a payment and update the card balance</h3>
          </div>
          <span className="pill pill-accent">Bank API simulated</span>
        </div>

        <form className="stack" onSubmit={handleTopUp}>
          <label>
            Top-up amount
            <div className="amount-grid">
              {[25, 50, 100, 200].map((amount) => (
                <button
                  key={amount}
                  className={`amount-chip ${Number(payment.amount) === amount ? 'amount-chip-active' : ''}`}
                  type="button"
                  onClick={() => updatePayment('amount', amount)}
                >
                  R {amount}
                </button>
              ))}
            </div>
            <input value={payment.amount} onChange={(event) => updatePayment('amount', event.target.value)} type="number" min="1" />
          </label>

          <div className="field-grid">
            <label>
              Card holder
              <input value={payment.cardHolder} onChange={(event) => updatePayment('cardHolder', event.target.value)} />
            </label>
            <label>
              Card number
              <input value={payment.cardNumber} onChange={(event) => updatePayment('cardNumber', event.target.value)} />
            </label>
          </div>

          <div className="field-grid">
            <label>
              Expiry
              <input value={payment.expiry} onChange={(event) => updatePayment('expiry', event.target.value)} />
            </label>
            <label>
              CVV
              <input value={payment.cvv} onChange={(event) => updatePayment('cvv', event.target.value)} inputMode="numeric" />
            </label>
          </div>

          <label>
            Payment method
            <select value={payment.method} onChange={(event) => updatePayment('method', event.target.value)}>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </label>

          <button className="button button-primary" type="submit">
            Authorize payment
          </button>
        </form>
      </article>

      <article className="panel summary-panel single-page-panel">
        <div className="section-heading compact">
          <div>
            <p className="section-tag">Account summary</p>
            <h3>Linked bus card and recent transactions</h3>
          </div>
          <span className={`pill ${access.loggedIn ? 'pill-success' : 'pill-muted'}`}>
            {access.loggedIn ? 'Active' : 'Awaiting login'}
          </span>
        </div>

        <div className="summary-card">
          <div>
            <span>Bus card</span>
            <strong>AY-4829-3310</strong>
          </div>
          <div>
            <span>Balance</span>
            <strong>{formattedBalance}</strong>
          </div>
          <div>
            <span>Registration</span>
            <strong>{access.verified ? 'Verified' : 'In progress'}</strong>
          </div>
        </div>

        <p className="page-note">Top-up updates are available after a successful login session.</p>
      </article>
    </section>
  );
}

export default TopUpPage;
