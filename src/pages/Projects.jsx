import { useEffect, useMemo, useState } from "react";
import { PROJECT_FIELDS } from "../config/projectFields";
import { CUSTOMER_FIELDS } from "../config/customerFields";
import { loadList, saveList, STORAGE_KEYS } from "../utils/storage";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function toLower(s) {
  return (s ?? "").toString().toLowerCase();
}

function pickCustomerLabel(c) {
  // 顯示：姓名 + 電話1
  const phone1 = c?.phone1 ? ` / ${c.phone1}` : "";
  return `${c?.name || "未命名"}${phone1}`;
}

export default function Projects() {
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [q, setQ] = useState("");

  // 表單：案件欄位
  const [form, setForm] = useState(() => {
    const init = { customerId: "" };
    for (const f of PROJECT_FIELDS) init[f.key] = "";
    // 預設狀態
    init.status = init.status || "洽談";
    init.wastePct = init.wastePct || "7";
    return init;
  });

  useEffect(() => {
    setCustomers(loadList(STORAGE_KEYS.customers));
    setProjects(loadList(STORAGE_KEYS.projects));
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return projects;

    return projects.filter((p) => {
      const customer = customers.find((c) => c.id === p.customerId);
      const customerText = customer
        ? CUSTOMER_FIELDS.map((f) => customer[f.key]).join(" ")
        : "";

      const projectText = PROJECT_FIELDS.map((f) => p[f.key]).join(" ");

      return toLower(`${customerText} ${projectText}`).includes(s);
    });
  }, [projects, q, customers]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate() {
    if (!form.customerId) {
      alert("請先選擇客戶");
      return false;
    }
    for (const f of PROJECT_FIELDS) {
      if (f.required && !String(form[f.key] ?? "").trim()) {
        alert(`請填寫：${f.label}`);
        return false;
      }
    }
    return true;
  }

  function addProject(e) {
    e.preventDefault();
    if (!validate()) return;

    const now = new Date().toISOString();
    const record = { id: uid(), createdAt: now, ...form };

    const next = [record, ...projects];
    setProjects(next);
    saveList(STORAGE_KEYS.projects, next);

    // 清空（保留一些預設）
    const cleared = { customerId: "" };
    for (const f of PROJECT_FIELDS) cleared[f.key] = "";
    cleared.status = "洽談";
    cleared.wastePct = "7";
    setForm(cleared);
  }

  function removeProject(id) {
    const ok = confirm("確定要刪除這個案件？");
    if (!ok) return;
    const next = projects.filter((p) => p.id !== id);
    setProjects(next);
    saveList(STORAGE_KEYS.projects, next);
  }

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 12 }}>案件</h1>

      {/* 新增案件 */}
      <form
        onSubmit={addProject}
        style={{
          background: "white",
          border: "1px solid #e5e5e5",
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <div style={{ fontWeight: 900, marginBottom: 10 }}>新增案件</div>

        {/* 選客戶 */}
        <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>
            選擇客戶<span style={{ color: "#b42318" }}>（必填）</span>
          </div>
          <select
            value={form.customerId}
            onChange={(e) => setField("customerId", e.target.value)}
            style={inputStyle}
          >
            <option value="">請選擇客戶</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {pickCustomerLabel(c)}
              </option>
            ))}
          </select>
          {customers.length === 0 && (
            <div style={{ fontSize: 12, color: "#b42318" }}>
              目前沒有客戶資料，請先到「客戶」新增。
            </div>
          )}
        </label>

        <div style={{ display: "grid", gap: 12 }}>
          {PROJECT_FIELDS.map((f) => (
            <Field
              key={f.key}
              field={f}
              value={form[f.key]}
              onChange={(v) => setField(f.key, v)}
            />
          ))}

          <button type="submit" style={btnStyle}>
            + 建立案件
          </button>
        </div>
      </form>

      {/* 搜尋 */}
      <div style={{ marginBottom: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜尋：客戶/地址/型號/狀態/備註…（任何文字都行）"
          style={inputStyle}
        />
      </div>

      <div style={{ color: "#666", marginBottom: 8 }}>
        共 {filtered.length} 筆（總共 {projects.length} 筆）
      </div>

      {/* 列表 */}
      <div style={{ display: "grid", gap: 10 }}>
        {filtered.map((p) => {
          const c = customers.find((x) => x.id === p.customerId);
          return (
            <div
              key={p.id}
              style={{
                background: "white",
                border: "1px solid #e5e5e5",
                borderRadius: 16,
                padding: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>
                      {p.title || "（未命名案件）"}
                    </div>
                    <span style={badgeStyle}>{p.status || "—"}</span>
                  </div>

                  <div style={{ fontSize: 13, color: "#444", marginTop: 6 }}>
                    <span style={{ color: "#777" }}>客戶：</span>
                    {c ? pickCustomerLabel(c) : "（找不到客戶，可能被刪除）"}
                  </div>

                  {/* 快速摘要 */}
                  <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
                    {p.planStartDate && (
                      <div style={{ fontSize: 13 }}>
                        <span style={{ color: "#777" }}>預計施工：</span>
                        {p.planStartDate}
                      </div>
                    )}
                    {(p.areaPing || p.floorModel || p.floorType) && (
                      <div style={{ fontSize: 13 }}>
                        <span style={{ color: "#777" }}>面積/材料：</span>
                        {p.areaPing ? `${p.areaPing} 坪` : "—"}
                        {" / "}
                        {p.floorType || "—"}
                        {" / "}
                        {p.floorModel || "—"}
                      </div>
                    )}
                    {p.totalPrice && (
                      <div style={{ fontSize: 13 }}>
                        <span style={{ color: "#777" }}>總價：</span>
                        {Number(p.totalPrice).toLocaleString()} 元
                        {p.payStatus ? `（${p.payStatus}）` : ""}
                      </div>
                    )}
                    {p.note && (
                      <div style={{ fontSize: 13, whiteSpace: "pre-wrap" }}>
                        <span style={{ color: "#777" }}>備註：</span>
                        {p.note}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => removeProject(p.id)}
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
          <div style={{ padding: 20, color: "#666" }}>目前沒有案件資料（或搜尋不到）。</div>
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
