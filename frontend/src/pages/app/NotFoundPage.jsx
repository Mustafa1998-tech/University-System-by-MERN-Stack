import React from 'react';
import { Link } from 'react-router-dom';
import { useAppUI } from '../../context/AppUIContext';

function NotFoundPage() {
  const { text } = useAppUI();

  return (
    <section className="panel-card">
      <h1>{text.notFound}</h1>
      <p>{text.experienceDesc}</p>
      <Link to="/" className="text-link">{text.backToDashboard}</Link>
    </section>
  );
}

export default NotFoundPage;
