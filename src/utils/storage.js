// 讀取清單（共用）
export function loadList(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("loadList error:", err);
    return [];
  }
}

// 儲存清單（共用）
export function saveList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

// 所有 localStorage key 統一在這裡管理
export const STORAGE_KEYS = {
  customers: "jj_customers_v2",
  projects: "jj_projects_v1",
  schedules: "jj_schedules_v1",
  seriesCosts: "jj_series_costs_v1",
};
