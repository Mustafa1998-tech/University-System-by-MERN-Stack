import React, { useEffect, useMemo, useState } from 'react';
import { useAppUI } from '../../context/AppUIContext';
import { sisApi } from '../../services/sisApi';
import { getAllModules } from '../../config/moduleCatalog';

function AnalyticsPage() {
  const { apiBase, language, text } = useAppUI();
  const [stats, setStats] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const summary = await sisApi.getPlatformSummary(apiBase);
        if (mounted) {
          setStats(summary);
        }
      } catch (requestError) {
        if (mounted) {
          setError(requestError.message || text.requestFailed);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [apiBase, text.requestFailed]);

  const moduleMap = useMemo(() => {
    const map = new Map();
    getAllModules().forEach((moduleItem) => {
      map.set(moduleItem.id, moduleItem.label[language]);
    });
    return map;
  }, [language]);

  const topStats = useMemo(() => {
    const sorted = [...stats].sort((a, b) => (b.total || 0) - (a.total || 0));
    const max = sorted[0]?.total || 1;
    return sorted.slice(0, 12).map((item) => ({
      ...item,
      label: moduleMap.get(item.id) || item.id,
      ratio: Math.max(5, Math.round(((item.total || 0) / max) * 100))
    }));
  }, [stats, moduleMap]);

  return (
    <section className="panel-card">
      <header className="panel-card__header">
        <div>
          <h1>{text.analytics}</h1>
          <p>{text.totalModules}: {stats.length}</p>
        </div>
      </header>

      {error ? <p className="status-error">{error}</p> : null}

      <div className="analytics-bars">
        {topStats.map((item) => (
          <article key={item.id} className="analytics-row">
            <div className="analytics-row__meta">
              <strong>{item.label}</strong>
              <span>{item.total}</span>
            </div>
            <div className="analytics-row__track">
              <span style={{ width: `${item.ratio}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AnalyticsPage;
