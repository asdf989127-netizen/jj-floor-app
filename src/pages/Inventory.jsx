import { useEffect, useMemo, useState } from "react";
import { SERIES_COST_FIELDS } from "../config/seriesCostFields";
import { loadList, saveList, STORAGE_KEYS } from "../utils/storage";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function toLower(s) {
  return (s ?? "").toString().toLowerCase();
}

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");

  const [form, setForm] = useState(() => {
    const init = {};
    for (const f of SERIES_COST_FIELDS) init[f.key] = "";
    init.type = "SPC 石塑";
    init.unit = "元/坪";
    init.defaultWastePct = "7";
    return init;
  });

  useEffect(() => {
    setItems(loadList(STORAGE_KEYS.seriesCosts));
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) => {
      const hay = SERIES_COST_FIELDS.map((f) => it[f.key]).join(" ");
      return toLower(hay).includes(s);
    });
  }, [items, q]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate() {
    for (const f of SERIES_COST_FIELDS) {
      if (f.required && !String(form[f.key] ?? "").trim()) {
        alert(`請填寫：${f.label}`);
        return false;
      }
    }
    return true;
  }

  function addItem(e) {
    e.preventDefault();
    if (!validate()) return;

    const record = { id: uid(), createdAt: new Date().toISOString(), ...form };
    const next = [record, ...items];
    setItems(next);
    saveList(STORAGE_KEYS.seriesCosts, next);

    const cleared = {};
    for (const f of SERIES_COST_FIELDS) cleared[f.key] = "";
    cleared.type = "SPC 石塑";
    cleared.unit = "元/坪";
    cleared.defaultWastePct = "7";
    setForm(cleared);
  }

  function removeItem(id) {
    const ok = confirm("確定要刪除這筆系列成本？");
    if (!ok) return;
    const next = items.filter((x) => x.id !== id);
    setItems(next);
    saveList(STORAGE_KEYS.seriesCosts, next);
  }

  function totalCostPerUnit(it) {
    const n = (v) => (Number(v) || 0);
    return (
      n(it.materialCost) +
      n(it.laborCost) +
      n(it.underlayCost) +
      n(it.skirtingCost) +
      n(it.trimAvgCost)
    );
  }

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 12 }}>叫料＆成本</h1>

      <div style={{ marginBottom: 10, color: "#666" }}>
        目前這頁先做「系列成本表」。下一步我們再加「叫料單」。
      </div>

      <form
        onSubmit={addItem}
        style={{
          background: "white",
          border: "1px solid #e5e5e5",
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <div style={{ fontWeight: 900, marginBottom: 10 }}>新增系列成本</div>

        <div style={{ display: "grid", gap: 12 }}>
          {SERIES_COST_FIELDS.map((f) => (
            <Field
              key={f.key}
              field={f}
              value={form[f.key]}
              onChange={(v) => setField(f.key, v)}
            />
          ))}

          <button type="submit" style={btnStyle}>
            + 新增系列
          </button>
        </div>
      </form>

      <div style={{ marginBottom: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜尋：系列/類型/備註…"
          style={inputStyle}
        />
      </div>

      <div style={{ color: "#666", marginBottom: 8 }}>
        共 {filtered.length} 筆（總共 {items.length} 筆）
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {filtered.map((it) => (
          <div
            key={it.id}
            style={{
              background: "white",
              border: "1px solid #e5e5e5",
              borderRadius: 16,
              padding: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>
                    {it.series || "（未命名系列）"}
                  </div>
                  <span style={badgeStyle}>{it.type}</span>
                  <span style={badgeStyle}>{it.unit}</span>
                </div>

                <div style={{ display: "grid", gap: 6, marginTop: 10, fontSize: 13 }}>
                  <Line label="材料成本" value={it.materialCost} unit={it.unit} />
                  <Line label="代工費" value={it.laborCost} unit={it.unit} />
                  {it.underlayCost && <Line label="底墊成本" value={it.underlayCost} unit={it.unit} />}
                  {it.skirtingCost && <Line label="踢腳線成本" value={it.skirtingCost} unit={it.unit} />}
                  {it.trimAvgCost && <Line label="收邊/門檻平均" value={it.trimAvgCost} unit={it.unit} />}

                  <div style={{ marginTop: 6, fontWeight: 900 }}>
                    <span style={{ color: "#777" }}>合計成本：</span>
                    {totalCostPerUnit(it).toLocaleString()}（{it.unit}）
                  </div>

                  {it.defaultWastePct && (
                    <div style={{ color: "#444" }}>
                      <span style={{ color: "#777" }}>預設損耗：</span>
                      {it.defaultWastePct}%
                    </div>
                  )}

                  {it.note && (
                    <div style={{ whiteSpace: "pre-wrap" }}>
                      <span style={{ color: "#777" }}>備註：</span>
                      {it.note}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => removeItem(it.id)}
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
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: 20, color: "#666" }}>目前沒有資料（或搜尋不到）。</div>
        )}
      </div>

      <div style={{ height: 80 }} />
    </div>
  );
}

function Line({ label, value, unit }) {
  return (
    <div>
      <span style={{ color: "#777" }}>{label}：</span>
      {Number(value || 0).toLocaleString()}（{unit}）
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
        <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
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
