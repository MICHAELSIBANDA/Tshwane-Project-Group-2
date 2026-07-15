import { Link } from 'react-router-dom';
import { useAppState } from '../AppState';
import { workflow } from '../busServicesData';

function HomePage() {
  const { formattedBalance, message, progress } = useAppState();

  return (
    <>
      <section className="hero panel">
        <div className="hero-copy">
          <p className="section-tag">Digital bus card management</p>
          <h2>Register, log in, and top up a Tshwane Bus Card.</h2>
          <p className="hero-text">
            This frontend prototype focuses on the in-scope client journey: secure sign-up, OTP verification,
            authentication, payment processing, and balance updates for a linked bus card.
          </p>

          <div className="hero-actions">
            <Link className="button button-primary" to="/register">
              Start the journey
            </Link>
          </div>
        </div>

        <div className="hero-card">
          <div className="card-header">
            <p>Wallet snapshot</p>
            <span>{progress}% journey complete</span>
          </div>
          <div className="balance-ring">
            <div>
              <span>Current balance</span>
              <strong>{formattedBalance}</strong>
            </div>
          </div>
          <div className={`status-banner status-${message.tone}`}>
            <strong>{message.title}</strong>
            <p>{message.body}</p>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;
