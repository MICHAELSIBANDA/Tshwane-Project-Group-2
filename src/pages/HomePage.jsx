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
          <h2>Register, log in, and top up a Tshwane Bus Card from separate routed pages.</h2>
          <p className="hero-text">
            This frontend prototype focuses on the in-scope client journey: secure sign-up, OTP verification,
            authentication, payment processing, and balance updates for a linked bus card.
          </p>

          <div className="hero-actions">
            <Link className="button button-primary" to="/register">
              Start the journey
            </Link>
            <Link className="button button-secondary" to="/scope">
              Review scope
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

      <section className="panel journey-panel">
        <div className="section-heading">
          <div>
            <p className="section-tag">User flow</p>
            <h3>Interactive client journey</h3>
          </div>
          <div className="journey-progress" aria-label="Journey progress">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="workflow-grid">
          {workflow.map((item, index) => (
            <article className="workflow-card" key={item.title}>
              <span className="workflow-index">0{index + 1}</span>
              <h4>{item.title}</h4>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default HomePage;
