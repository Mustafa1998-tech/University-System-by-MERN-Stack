import { getAllModules } from '../config/moduleCatalog';

const DEFAULT_TIMEOUT_MS = Number(process.env.REACT_APP_API_TIMEOUT || 7000);

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data?.message || data?.error?.message || `HTTP ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}

async function request(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options,
      signal: controller.signal
    });

    return parseResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout (${options.timeoutMs || DEFAULT_TIMEOUT_MS}ms)`);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const sisApi = {
  getHealth: (apiBase) => request(`${apiBase}/health`),
  getSystemInfo: (apiBase) => request(`${apiBase}/system/info`),
  getModuleItems: (apiBase, moduleId) => request(`${apiBase}/${moduleId}`),
  getModuleStats: (apiBase, moduleId) => request(`${apiBase}/${moduleId}/stats`),
  createModuleItem: (apiBase, moduleId, payload) =>
    request(`${apiBase}/${moduleId}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getPlatformSummary: async (apiBase) => {
    const modules = getAllModules();
    const statsResults = await Promise.all(
      modules.map(async (moduleItem) => {
        try {
          const stats = await sisApi.getModuleStats(apiBase, moduleItem.id);
          return {
            id: moduleItem.id,
            ok: true,
            total: stats?.data?.total ?? stats?.total ?? 0
          };
        } catch (error) {
          return {
            id: moduleItem.id,
            ok: false,
            total: 0,
            error: error.message
          };
        }
      })
    );

    return statsResults;
  }
};
