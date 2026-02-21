import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { moduleCatalog } from '../../config/moduleCatalog';
import { useAppUI } from '../../context/AppUIContext';
import { sisApi } from '../../services/sisApi';
import KpiCard from '../../components/layout/KpiCard';

function DashboardPage() {
  const { apiBase, language, text } = useAppUI();

  const [health, setHealth] = useState(null);
  const [systemInfo, setSystemInfo] = useState(null);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastCheckedAt, setLastCheckedAt] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [healthRes, infoRes, summaryRes] = await Promise.all([
          sisApi.getHealth(apiBase),
          sisApi.getSystemInfo(apiBase),
          sisApi.getPlatformSummary(apiBase)
        ]);

        if (!mounted) return;
        setHealth(healthRes);
        setSystemInfo(infoRes);
        setStats(summaryRes);
      } catch (requestError) {
        if (!mounted) return;
        setError(requestError.message || text.requestFailed);
      } finally {
        if (mounted) {
          setLoading(false);
          setLastCheckedAt(new Date().toISOString());
        }
      }
    };

    load();
    const timer = setInterval(load, 30000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [apiBase, text.requestFailed, refreshTick]);

  const totals = useMemo(() => {
    const totalRecords = stats.reduce((sum, stat) => sum + (stat.total || 0), 0);
    return {
      records: totalRecords,
      modules: stats.length,
      categories: moduleCatalog.length
    };
  }, [stats]);

  const categorySummary = useMemo(() => {
    return moduleCatalog.map((category) => {
      const categoryStats = stats.filter((stat) => category.modules.some((item) => item.id === stat.id));
      const categoryTotal = categoryStats.reduce((sum, stat) => sum + (stat.total || 0), 0);
      return {
        ...category,
        total: categoryTotal,
        title: category.name[language],
        summary: category.summary[language],
        modules: category.modules.map((moduleItem) => ({
          ...moduleItem,
          total: categoryStats.find((stat) => stat.id === moduleItem.id)?.total || 0,
          label: moduleItem.label[language]
        }))
      };
    });
  }, [stats, language]);

  return (
    <div className="page-grid">
      <section className="hero-card">
        <p className="hero-card__eyebrow">{text.systemStatus}</p>
        <h1>{text.appTitle}</h1>
        <p>{text.experienceDesc}</p>
        <div className="hero-card__meta">
          <span>{text.apiBase}: {apiBase}</span>
          <span>{text.environment}: {health?.environment || '-'}</span>
          <span>{text.database}: {health?.services?.database || '-'}</span>
          <span>{text.lastCheck}: {lastCheckedAt ? new Date(lastCheckedAt).toLocaleString() : '-'}</span>
          <span>
            {text.systemStatus}: {loading ? text.checking : health ? text.connected : text.disconnected}
          </span>
        </div>
        <div className="hero-card__actions">
          <button className="btn" type="button" onClick={() => setRefreshTick((value) => value + 1)} disabled={loading}>
            {loading ? text.checking : text.checkNow}
          </button>
        </div>
        {error ? <p className="status-error">{error}</p> : null}
      </section>

      <section className="kpi-grid">
        <KpiCard title={text.totalRecords} value={totals.records} subtitle={text.sectionModules} accent="var(--accent-indigo)" />
        <KpiCard title={text.totalModules} value={totals.modules} subtitle={text.loadedRoutes} accent="var(--accent-cyan)" />
        <KpiCard title={text.categories} value={totals.categories} subtitle={text.systemStatus} accent="var(--accent-orange)" />
        <KpiCard
          title={text.loadedRoutes}
          value={systemInfo?.loadedRoutes?.length || 0}
          subtitle={`${text.missingRoutes}: ${systemInfo?.missingRoutes?.length || 0}`}
          accent="var(--accent-green)"
        />
      </section>

      <section className="category-list">
        {categorySummary.map((category) => (
          <article key={category.id} className="category-card" style={{ '--category-accent': category.color }}>
            <header>
              <h2>{category.icon} {category.title}</h2>
              <span>{category.total}</span>
            </header>
            <p>{category.summary}</p>

            <div className="module-chip-grid">
              {category.modules.map((moduleItem) => (
                <Link key={moduleItem.id} to={`/modules/${moduleItem.id}`} className="module-chip">
                  <strong>{moduleItem.label}</strong>
                  <small>{moduleItem.total}</small>
                </Link>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default DashboardPage;
