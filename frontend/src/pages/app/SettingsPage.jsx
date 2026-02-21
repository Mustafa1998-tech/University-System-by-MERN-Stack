import React from 'react';
import { useAppUI } from '../../context/AppUIContext';

function SettingsPage() {
  const { language, setLanguage, theme, setTheme, apiBase, text } = useAppUI();

  return (
    <section className="panel-card">
      <header className="panel-card__header">
        <div>
          <h1>{text.settings}</h1>
          <p>{text.experience}</p>
        </div>
      </header>

      <div className="settings-grid">
        <article className="setting-item">
          <h3>{text.language}</h3>
          <div className="segmented-control">
            <button
              type="button"
              className={language === 'en' ? 'is-selected' : ''}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
            <button
              type="button"
              className={language === 'ar' ? 'is-selected' : ''}
              onClick={() => setLanguage('ar')}
            >
              AR
            </button>
          </div>
        </article>

        <article className="setting-item">
          <h3>{text.theme}</h3>
          <div className="segmented-control">
            <button
              type="button"
              className={theme === 'light' ? 'is-selected' : ''}
              onClick={() => setTheme('light')}
            >
              {text.light}
            </button>
            <button
              type="button"
              className={theme === 'dark' ? 'is-selected' : ''}
              onClick={() => setTheme('dark')}
            >
              {text.dark}
            </button>
          </div>
        </article>

        <article className="setting-item">
          <h3>{text.uiDirection}</h3>
          <p>{language === 'ar' ? text.rtl : text.ltr}</p>
        </article>

        <article className="setting-item">
          <h3>{text.apiBase}</h3>
          <p>{apiBase}</p>
        </article>
      </div>
    </section>
  );
}

export default SettingsPage;
