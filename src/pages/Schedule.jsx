import { useEffect, useMemo, useState } from "react";
import { loadList, saveList, STORAGE_KEYS } from "../utils/storage";
import { SCHEDULE_FIELDS } from "../config/scheduleFields";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function toLower(s) {
  return (s ?? "").toString().toLowerCase();
}

function projectLabel(p) {
  const parts = [
    p.title || "（未命名案件）",
    p.planStartDate ? `預計:${p.planStartDate}` : null,
    p.areaPing ? `${p.areaPing}坪` : null,
    p.floorModel ? `型號:${p.floorModel}` : null,
  ].filter(Boolean);
  return parts.join(" / ");
}

export default function Schedule() {
  const [projects, setProjects] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [q, setQ] = useState("");

  const [form, setForm] = useState(() => {
    const init = { projectId: "" };
    for (const f of SCHEDULE_FIELDS) init[f.key] = "";
    init.timeSlot = "全天";
    init.task = "鋪設";
    init.status = "已安排";
    return init;
  });

  useEffect(() => {
    setProjects(loadList(STORAGE_KEYS.projects));
    setSchedules(loadList(STORAGE_KEYS.schedules));
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return schedules;

    return schedules.filter((w) => {
      const p = projects.find((x) => x.id === w.projectId);
      const hay = `${w.date} ${w.timeSlot} ${w.crew} ${w.task} ${w.status} ${
        w.note || ""
      } ${p?.title || ""} ${p?.floorModel || ""}`;
      return toLower(hay).includes(s);
    });
  }, [schedules, q, projects]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate() {
    if (!form.projectId) {
      alert("請先選擇案件");
      return false;
    }
    for (const f of SCHEDULE_FIELDS) {
      if (f.required && !String(form[f.key] ?? "").trim()) {
        alert(`請填寫：${f.label}`);
        return false;
      }
    }
    return true;
  }

  // ✅ 你要的規則：同一天 + 同工班 => 一律衝突（不管上午/下午/全天）
  function isConflict(newItem) {
    return schedules.some(
      (w) => w.date === newItem.date && w.crew === newItem.crew
    );
  }

  function addSchedule(e) {
    e.preventDefault();
    if (!validate()) return;

    const record = { id: uid(), createdAt: new Date().toISOString(), ...form };

    if (isConflict(record)) {
      alert(
        "排程衝突：同一天同工班已經有安排，請改日期或改工班。"
      );
      return;
    }

    const next = [record, ...schedules];
    setSchedules(next);
    saveList(STORAGE_KEYS.schedules, next);

    // 清空（保留常用預設）
    const cleared = { projectId: "" };
    for (const f of SCHEDULE_FIELDS) cleared[f.key] = "";
    cleared.timeSlot = "全天";
    cleared.task = "鋪設";
    cleared.status = "已安排";
    setForm(cleared);
  }

  function removeSchedule(id) {
    const ok = confirm("確定要刪除這筆排程？");
    if (!ok) return;
    const next = schedules.filter((w) => w.id !== id);
    setSchedules(next);
    saveList(STORAGE_KEYS.schedules, next);
  }

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 12 }}>排工</h1>

      <form
        onSubmit={addSchedule}
        style={{
          background: "white",
          border: "1px solid #e5e5e5",
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <div style={{ fontWeight: 900, marginBottom: 10 }}>
          新增工單 / 排程
        </div>

        {/* 選案件 */}
        <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>
            選擇案件<span style={{ color: "#b42318" }}>（必填）</span>
          </div>
          <select
            value={form.projectId}
            onChange={(e) => setField("projectId", e.target.value)}
            style={inputStyle}
          >
            <option value="">請選擇案件</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {projectLabel(p)}
              </option>
            ))}
          </select>

          {projects.length === 0 && (
            <div style={{ fontSize: 12, color: "#b42318" }}>
              目前沒有案件資料，請先到「案件」建立。
            </div>
          )}
        </label>

        <div style={{ display: "grid", gap: 12 }}>
          {SCHEDULE_FIELDS.map((f) => (
            <Field
              key={f.key}
              field={f}
              value={form[f.key]}
              onChange={(v) => setField(f.key, v)}
            />
          ))}

          <button type="submit" style={btnStyle}>
            + 新增排程
          </button>
        </div>
      </form>

      <div style={{ marginBottom: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜尋：日期/工班/案件/型號/備註…"
          style={inputStyle}
        />
      </div>

      <div style={{ color: "#666", marginBottom: 8 }}>
        共 {filtered.length} 筆（總共 {schedules.length} 筆）
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {filtered.map((w) => {
          const p = projects.find((x) => x.id === w.projectId);
          return (
            <div
              key={w.id}
              style={{
                background: "white",
                border: "1px solid #e5e5e5",
                borderRadius: 16,
                padding: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                      alignItems: "baseline",
                    }}
                  >
                    <div style={{ fontSize: 18, fontWeight: 900 }}>
                      {w.date}（{w.timeSlot}）
                    </div>
                    <span style={badgeStyle}>{w.crew}</span>
                    <span style={badgeStyle}>{w.task}</span>
                    <span style={badgeStyle}>{w.status}</span>
                  </div>

                  <div style={{ fontSize: 13, color: "#444", marginTop: 8 }}>
                    <span style={{ color: "#777" }}>案件：</span>
                    {p
                      ? `${p.title || "（未命名）"} / ${p.floorModel || "—"}`
                      : "（找不到案件，可能被刪除）"}
                  </div>

                  {w.note && (
                    <div
                      style={{
                        fontSize: 13,
                        marginTop: 8,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      <span style={{ color: "#777" }}>備註：</span>
                      {w.note}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => removeSchedule(w.id)}
                  style={{
                    border: "1px solid #f1c4c4",
                    color: "#b42318",
                    background: "#fff",
                    borderRadius: 12,
                    padding: "8px 10px",
                    height: 40,
                    cursor: "pointer",
                  }}
                >
                  刪除
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ padding: 20, color: "#666" }}>
            目前沒有排程資料（或搜尋不到）。
          </div>
        )}
      </div>

      <div style={{ height: 80 }} />
    </div>
  );
}

function Field({ field, value, onChange }) {
  const { label, required, type, placeholder, options } = field;

  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#333" }}>
        {label}
        {required && <span style={{ color: "#b42318" }}>（必填）</span>}
      </div>

      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...inputStyle, height: 90, paddingTop: 10 }}
        />
      ) : type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        >
          <option value="">請選擇</option>
          {options?.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type={type || "text"}
          style={inputStyle}
        />
      )}
    </label>
  );
}

const inputStyle = {
  height: 44,
  borderRadius: 12,
  border: "1px solid #e5e5e5",
  padding: "0 12px",
  outline: "none",
  fontSize: 14,
  background: "white",
  color: "#111",
};

const btnStyle = {
  height: 44,
  borderRadius: 12,
  border: "1px solid #111",
  background: "#111",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};

const badgeStyle = {
  fontSize: 12,
  padding: "3px 8px",
  borderRadius: 999,
  border: "1px solid #e5e5e5",
  color: "#333",
  background: "#fafafa",
};
