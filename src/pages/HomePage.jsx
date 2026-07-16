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
          <h2>Connecting the Capital.</h2>
          <p className="hero-text">
            Welcome to the Tshwane Bus Services self-service portal. Here, you can manage your bus card account,
             authenticating, and topping up a linked bus card balance.The City offers a transport service to all
              Tshwane residents. In order to use the service, commuters have to get a Connector card, which enables them to board City of Tshwane buses, namely Tshwane Bus Services (TBS) and A Re Yeng. The City no longer accepts cash or paper tickets on any of its buses.
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
