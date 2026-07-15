import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <section className="panel notfound-panel">
      <p className="section-tag">404</p>
      <h2>That page does not exist.</h2>
      <p className="hero-text">Use the navigation to go back to the Tshwane Bus Services pages.</p>
      <Link className="button button-primary" to="/">
        Return home
      </Link>
    </section>
  );
}

export default NotFoundPage;
