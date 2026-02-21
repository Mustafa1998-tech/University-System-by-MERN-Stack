import React, { useMemo, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { moduleCatalog } from '../../config/moduleCatalog';
import { useAppUI } from '../../context/AppUIContext';

function LayoutShell() {
  const { language, setLanguage, theme, setTheme, text } = useAppUI();
  const [menuOpen, setMenuOpen] = useState(false);

  const categoryLinks = useMemo(() => {
    return moduleCatalog.map((category) => ({
      ...category,
      title: category.name[language],
      items: category.modules.map((item) => ({
        id: item.id,
        label: item.label[language]
      }))
    }));
  }, [language]);

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));

  return (
    <div className="shell">
      <aside className={`shell__sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="shell__brand">
          <h2>SIS</h2>
          <p>{text.appSubtitle}</p>
        </div>

        <nav className="shell__nav">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
            {text.dashboard}
          </NavLink>
          <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
            {text.analytics}
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
            {text.settings}
          </NavLink>

          {categoryLinks.map((category) => (
            <section key={category.id} className="nav-group">
              <h4>
                <span>{category.icon}</span> {category.title}
              </h4>
              {category.items.map((item) => (
                <NavLink
                  key={item.id}
                  to={`/modules/${item.id}`}
                  className={({ isActive }) => `nav-link nav-link--module ${isActive ? 'is-active' : ''}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </section>
          ))}
        </nav>
      </aside>

      <div className="shell__main">
        <header className="shell__topbar">
          <button className="menu-toggle" type="button" onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? '✕' : '☰'}
          </button>

          <div className="topbar-actions">
            <div className="segmented-control" role="group" aria-label={text.language}>
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

            <button type="button" className="theme-toggle" onClick={toggleTheme}>
              {text.theme}: {theme === 'dark' ? text.dark : text.light}
            </button>
          </div>
        </header>

        <div className="shell__content" onClick={() => menuOpen && setMenuOpen(false)}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default LayoutShell;
