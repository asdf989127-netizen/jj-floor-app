import { useMemo, useState } from "react";

/* ===== 小工具 ===== */
const num = (v) => Number(v) || 0;
const ceilInt = (v) => Math.ceil(Number(v) || 0);
const money = (v) => {
  const n = Math.round(Number(v) || 0);
  return n.toLocaleString("zh-TW");
};

export default function QuoteCalc() {
  const [f, setF] = useState({
    pricePerPing: "", // 每坪價錢（可用來參考，不一定要用在計算；先保留輸入）
    pricePerBox: "",  // 每箱牌價
    actualPing: "",   // 實際坪數
    perBoxPing: "",   // 每箱材料坪數
  });

  function setField(key, value) {
    setF((prev) => ({ ...prev, [key]: value }));
  }

  const calc = useMemo(() => {
    const actual = num(f.actualPing);
    const perBox = num(f.perBoxPing);
    const afterWastePing = actual * 1.1; // +10%
    const boxes = perBox > 0 ? ceilInt(afterWastePing / perBox) : 0;
    const totalPingByBoxes = boxes * perBox;

    const boxPrice = num(f.pricePerBox);
    const estimatedCost = boxes * boxPrice;

    // 另算一個「每坪價×含損耗坪」的參考成本（可不用顯示，看你要不要）
    const pingPrice = num(f.pricePerPing);
    const estimatedCostByPing = afterWastePing * pingPrice;

    return {
      actual,
      perBox,
      afterWastePing,
      boxes,
      totalPingByBoxes,
      boxPrice,
      estimatedCost,
      pingPrice,
      estimatedCostByPing,
    };
  }, [f]);

  const clientText = useMemo(() => {
    // 按你的句型輸出
    return `經過計算後，您這邊含損耗料大概需要 ${calc.boxes || ""} 箱，每箱 ${money(calc.boxPrice)} 元，費用大概落在 ${money(calc.estimatedCost)} 元。`.trim();
  }, [calc]);

  return (
    <div style={page}>
      <h1 style={{ marginBottom: 12, color: "#111" }}>客戶材料估價（箱數＋費用）</h1>

      <div style={layout}>
        {/* 左：輸入 */}
        <div style={col}>
          <Card title="輸入資料">
            <TwoCol>
              <Field
                label="每坪價錢（元/坪）"
                type="number"
                value={f.pricePerPing}
                onChange={(v) => setField("pricePerPing", v)}
                placeholder="例如：2680"
              />
              <Field
                label="每箱牌價（元/箱）"
                type="number"
                value={f.pricePerBox}
                onChange={(v) => setField("pricePerBox", v)}
                placeholder="例如：1150"
              />
              <Field
                label="實際坪數（坪）"
                type="number"
                value={f.actualPing}
                onChange={(v) => setField("actualPing", v)}
                placeholder="例如：18"
              />
              <Field
                label="每箱材料坪數（坪/箱）"
                type="number"
                value={f.perBoxPing}
                onChange={(v) => setField("perBoxPing", v)}
                placeholder="例如：1.62"
              />
            </TwoCol>

            <div style={hintRow}>
              <div style={hintBox}>
                含損耗坪數(10%)：<b>{calc.afterWastePing.toFixed(2)}</b>
              </div>
              <div style={hintBox}>
                所需箱數（無條件進位）：<b>{calc.boxes}</b>
              </div>
              <div style={hintBox}>
                材料總坪數（箱×每箱）：<b>{calc.totalPingByBoxes.toFixed(2)}</b>
              </div>
            </div>

            <div style={{ marginTop: 10, color: "#111", fontSize: 13 }}>
              估算費用（箱數×每箱牌價）：<b>{money(calc.estimatedCost)}</b> 元
            </div>
          </Card>
        </div>

        {/* 右：即時輸出 */}
        <div style={col}>
          <Preview title="要傳給客戶的文字（即時）" text={clientText} />
        </div>
      </div>

      <div style={{ height: 80 }} />
    </div>
  );
}

/* ===== 小元件 ===== */
function Card({ title, children }) {
  return (
    <div style={card}>
      <div style={{ fontWeight: 900, marginBottom: 10, color: "#111" }}>{title}</div>
      {children}
    </div>
  );
}

function TwoCol({ children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#111" }}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={input}
      />
    </label>
  );
}

function Preview({ title, text }) {
  function copy() {
    navigator.clipboard.writeText(text);
    alert("已複製到剪貼簿");
  }
  return (
    <div style={preview}>
      <div style={previewHeader}>
        <div style={{ fontWeight: 900, color: "#111" }}>{title}</div>
        <button onClick={copy} style={copyBtn}>
          一鍵複製
        </button>
      </div>
      <pre style={previewText}>{text}</pre>
    </div>
  );
}

/* ===== 樣式：強制黑字 + 白底（跟你的工具頁同風格） ===== */
const page = {
  padding: 16,
  maxWidth: 1300,
  margin: "0 auto",
  background: "#f6f6f6",
  color: "#111",
};

const layout = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
};

const col = { display: "grid", gap: 16 };

const card = {
  background: "#fff",
  border: "1px solid #e5e5e5",
  borderRadius: 16,
  padding: 16,
  color: "#111",
};

const input = {
  height: 44,
  borderRadius: 12,
  border: "1px solid #e5e5e5",
  padding: "0 12px",
  fontSize: 14,
  outline: "none",
  background: "#fff",
  color: "#111",
  caretColor: "#111",
};

const preview = {
  background: "#fff",
  border: "1px solid #e5e5e5",
  borderRadius: 16,
  padding: 12,
  color: "#111",
};

const previewHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
};

const previewText = {
  whiteSpace: "pre-wrap",
  fontSize: 13,
  lineHeight: 1.6,
  background: "#fafafa",
  border: "1px solid #eee",
  borderRadius: 12,
  padding: 12,
  maxHeight: 520,
  overflow: "auto",
  color: "#111",
};

const copyBtn = {
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
  borderRadius: 10,
  padding: "6px 10px",
  fontWeight: 900,
  fontSize: 12,
  cursor: "pointer",
};

const hintRow = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 8,
  marginTop: 10,
};

const hintBox = {
  background: "#fafafa",
  border: "1px solid #eee",
  borderRadius: 12,
  padding: 10,
  color: "#111",
  fontSize: 13,
};