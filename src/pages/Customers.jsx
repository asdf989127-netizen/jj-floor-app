import { useEffect, useMemo, useState } from "react";
import { CUSTOMER_FIELDS } from "../config/customerFields";
import { loadList, saveList, STORAGE_KEYS } from "../utils/storage";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function toLower(s) {
  return (s ?? "").toString().toLowerCase();
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [q, setQ] = useState("");

  // 表單狀態：用一個物件裝所有欄位
  const [form, setForm] = useState(() => {
    const init = {};
    for (const f of CUSTOMER_FIELDS) init[f.key] = "";
    return init;
  });

  useEffect(() => {
    setCustomers(loadList(STORAGE_KEYS.customers));
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return customers;
    return customers.filter((c) => {
      const hay = CUSTOMER_FIELDS.map((f) => c[f.key]).join(" ");
      return toLower(hay).includes(s);
    });
  }, [customers, q]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate() {
    for (const f of CUSTOMER_FIELDS) {
      if (f.required && !String(form[f.key] ?? "").trim()) {
        alert(`請填寫：${f.label}`);
        return false;
      }
    }
    return true;
  }

  function addCustomer(e) {
    e.preventDefault();
    if (!validate()) return;

    const now = new Date().toISOString();
    const record = { id: uid(), createdAt: now, ...form };

    const next = [record, ...customers];
    setCustomers(next);
    saveList(STORAGE_KEYS.customers, next);

    // 清空表單（全部欄位）
    const cleared = {};
    for (const f of CUSTOMER_FIELDS) cleared[f.key] = "";
    setForm(cleared);
  }

  function removeCustomer(id) {
    const ok = confirm("確定要刪除這位客戶？");
    if (!ok) return;
    const next = customers.filter((c) => c.id !== id);
    setCustomers(next);
    saveList(STORAGE_KEYS.customers, next);
  }

  return (
    <div style={{ padding: 16, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 12 }}>客戶</h1>

      {/* 新增客戶 */}
      <form
        onSubmit={addCustomer}
        style={{
          background: "white",
          border: "1px solid #e5e5e5",
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: 10 }}>新增客戶</div>

        <div style={{ display: "grid", gap: 12 }}>
          {CUSTOMER_FIELDS.map((f) => (
            <Field
              key={f.key}
              field={f}
              value={form[f.key]}
              onChange={(v) => setField(f.key, v)}
            />
          ))}

          <button type="submit" style={btnStyle}>
            + 新增
          </button>
        </div>
      </form>

      {/* 搜尋 */}
      <div style={{ marginBottom: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜尋：任何欄位（姓名/電話/地址/備註…）"
          style={inputStyle}
        />
      </div>

      <div style={{ color: "#666", marginBottom: 8 }}>
        共 {filtered.length} 位（總共 {customers.length} 位）
      </div>

      {/* 列表 */}
      <div style={{ display: "grid", gap: 10 }}>
        {filtered.map((c) => (
          <div
            key={c.id}
            style={{
              background: "white",
              border: "1px solid #e5e5e5",
              borderRadius: 16,
              padding: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 900 }}>
                  {c.name || "（未命名）"}
                </div>

                <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
                  {CUSTOMER_FIELDS.filter((f) => f.key !== "name").map((f) => {
                    const val = c[f.key];
                    if (!val) return null;
                    return (
                      <div key={f.key} style={{ fontSize: 13, color: "#444" }}>
                        <span style={{ color: "#777" }}>{f.label}：</span>
                        {val}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => removeCustomer(c.id)}
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

function Field({ field, value, onChange }) {
  const { label, required, type, placeholder, options } = field;

  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>
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
