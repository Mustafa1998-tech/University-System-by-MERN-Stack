import React from 'react';

function KpiCard({ title, value, subtitle, accent = 'var(--accent-indigo)' }) {
  return (
    <article className="kpi-card" style={{ '--kpi-accent': accent }}>
      <p className="kpi-card__title">{title}</p>
      <h3 className="kpi-card__value">{value}</h3>
      {subtitle ? <p className="kpi-card__subtitle">{subtitle}</p> : null}
    </article>
  );
}

export default KpiCard;
