import { scopeItems } from '../busServicesData';

function ScopePage() {
  return (
    <>
      <section className="panel scope-panel single-page-panel">
        <div className="section-heading compact">
          <div>
            <p className="section-tag">Project scope</p>
            <h3>Included and excluded functionality</h3>
          </div>
        </div>

        <div className="scope-grid">
          <div className="scope-box scope-included">
            <h4>In scope</h4>
            <ul>
              {scopeItems.included.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="scope-box scope-excluded">
            <h4>Out of scope</h4>
            <ul>
              {scopeItems.excluded.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="info-grid">
        <article className="panel info-card">
          <p className="section-tag">Constraints</p>
          <h3>External dependencies and security expectations</h3>
          <p>
            The top-up flow depends on a responsive Bank API. Sensitive client and card data should be transmitted and
            stored securely, even though the banking side is assumed to handle the complex compliance requirements.
          </p>
        </article>
        <article className="panel info-card">
          <p className="section-tag">Assumptions</p>
          <h3>What this prototype assumes</h3>
          <p>
            The client already owns a Tshwane Bus Card. This app manages the digital account experience and the card
            balance, not the physical issuance of the card itself.
          </p>
        </article>
      </section>
    </>
  );
}

export default ScopePage;
