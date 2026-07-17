import { Link } from 'react-router-dom';
import { useAppState } from '../AppState';
import { workflow } from '../busServicesData';

function HomePage() {
  const { formattedBalance, message, progress } = useAppState();

  return (
    <>
      <section className="hero panel">
        <div className="hero-copy">
          <p className="section-tag">Bus card management</p>
          <h2>Connecting the Capital.</h2>
          <p className="hero-text">
          Welcome to the Tshwane Bus Services self-service portal.
          Manage your Connector card, check your balance, and top up all in one place.

          The City of Tshwane no longer accepts cash or paper tickets. To ride any TBS or A Re Yeng bus, simply get a Connector card, load it with funds, and tap to board. It's quick, safe, and easy.
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
