import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { findModule } from '../../config/moduleCatalog';
import { useAppUI } from '../../context/AppUIContext';
import { sisApi } from '../../services/sisApi';
import ModuleTable from '../../components/layout/ModuleTable';

const DEFAULT_PAYLOAD = '{\n  "name": "Sample Record"\n}';

function ModulePage() {
  const { moduleId } = useParams();
  const { apiBase, language, text } = useAppUI();
  const moduleDefinition = useMemo(() => findModule(moduleId), [moduleId]);

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [payloadText, setPayloadText] = useState(DEFAULT_PAYLOAD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadData = useCallback(async () => {
    if (!moduleDefinition) {
      return;
    }

    setLoading(true);
    setError('');
    setNotice('');

    try {
      const [itemsRes, statsRes] = await Promise.all([
        sisApi.getModuleItems(apiBase, moduleId),
        sisApi.getModuleStats(apiBase, moduleId)
      ]);

      setItems(Array.isArray(itemsRes?.data) ? itemsRes.data : []);
      setStats(statsRes?.data || statsRes || null);
    } catch (requestError) {
      setError(requestError.message || text.requestFailed);
    } finally {
      setLoading(false);
    }
  }, [moduleDefinition, apiBase, moduleId, text.requestFailed]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async () => {
    setError('');
    setNotice('');

    let parsedPayload = null;
    try {
      parsedPayload = JSON.parse(payloadText);
    } catch (parseError) {
      setError(`JSON parse error: ${parseError.message}`);
      return;
    }

    try {
      await sisApi.createModuleItem(apiBase, moduleId, parsedPayload);
      setNotice(text.saveSuccess);
      loadData();
    } catch (saveError) {
      setError(saveError.message || text.saveFailed);
    }
  };

  if (!moduleDefinition) {
    return (
      <section className="panel-card">
        <h1>{text.notFound}</h1>
        <Link className="text-link" to="/">{text.backToDashboard}</Link>
      </section>
    );
  }

  return (
    <section className="panel-card">
      <header className="panel-card__header">
        <div>
          <h1>{moduleDefinition.label[language]}</h1>
          <p>{apiBase}/{moduleId}</p>
        </div>
        <div className="panel-card__actions">
          <button className="btn" type="button" onClick={loadData} disabled={loading}>
            {loading ? text.checking : text.refresh}
          </button>
          <Link className="text-link" to="/">{text.back}</Link>
        </div>
      </header>

      {error ? <p className="status-error">{error}</p> : null}
      {notice ? <p className="status-success">{notice}</p> : null}

      <div className="module-grid">
        <article className="module-block">
          <h3>{text.moduleStats}</h3>
          <pre>{JSON.stringify(stats || {}, null, 2)}</pre>
        </article>

        <article className="module-block">
          <h3>{text.createRecord}</h3>
          <label htmlFor="payload-input">{text.payloadHint}</label>
          <textarea
            id="payload-input"
            value={payloadText}
            onChange={(event) => setPayloadText(event.target.value)}
            rows={8}
          />
          <button className="btn btn--primary" type="button" onClick={handleCreate}>
            {text.submit}
          </button>
        </article>
      </div>

      <article className="module-block">
        <h3>{text.moduleData}</h3>
        {items.length === 0 ? <p>{text.noData}</p> : <ModuleTable rows={items.slice(0, 30)} />}
      </article>
    </section>
  );
}

export default ModulePage;
