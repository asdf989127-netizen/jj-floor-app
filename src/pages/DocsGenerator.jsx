import { useMemo, useState } from "react";

/* ===== 小工具 ===== */
const num = (v) => Number(v) || 0;
const ceilInt = (v) => Math.ceil(Number(v) || 0);

function calcBoxes(actualPing, perBoxPing) {
  const a = num(actualPing);
  const p = num(perBoxPing);
  const materialTotalPing = a * 1.1; // +10% 損耗
  const boxes = p > 0 ? ceilInt(materialTotalPing / p) : 0;
  const boxedTotalPing = boxes * p;
  return { materialTotalPing, boxes, boxedTotalPing };
}

const TEAM_OPTIONS = [
  "0920784500 小蔡",
  "0905136685 阿峰",
  "0976609779 林正中",
  "0982634533 王邵維",
  "0939147167 阿志",
  "0989133442 吳大寶",
  "0963168340 達元",
  "0909467770 歐噴匠",
  "0955458239 周庭賢",
  "0939081541 高于翔",
  "0958688221 阿源",
  "0988259831 阿銘",
  "其他",
];

function emptyMaterial() {
  return {
    brand: "",
    model: "",
    actualPing: "",
    perBoxPing: "",
    accessoriesDivider: "",
    accessoriesStarter: "",
    accessoriesL: "",
    accessoriesMoisture: "",
  };
}

export default function DocsGenerator() {
  const [f, setF] = useState({
    // 不要年份：MM/DD
    workDate: "",

    contactName: "",
    phone: "",
    address: "",

    // 叫料單需要：進貨日、緊急聯絡人、卸材料位置
    inboundDate: "", // MM/DD
    emergencyContact: "",
    unloadMaterialPlace: "",

    // 施工資訊預設
    installMethod: "直鋪",
    scope: "全室",
    elevator: "",
    skirting: "",
    parking: "",
    unloadPlace: "",
    cutDoorCount: "",
    note: "",
    extraFee: "",

    salesman: "",
    team: TEAM_OPTIONS[0],
  });

  // 多筆材料
  const [materials, setMaterials] = useState([emptyMaterial()]);

  function setField(key, value) {
    setF((prev) => ({ ...prev, [key]: value }));
  }

  function setMat(i, key, value) {
    setMaterials((prev) => prev.map((m, idx) => (idx === i ? { ...m, [key]: value } : m)));
  }

  function addMaterial() {
    setMaterials((prev) => [...prev, emptyMaterial()]);
  }

  function removeMaterial(i) {
    setMaterials((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, idx) => idx !== i);
    });
  }

  const computedMaterials = useMemo(() => {
    return materials.map((m) => {
      const c = calcBoxes(m.actualPing, m.perBoxPing);
      return { ...m, ...c };
    });
  }, [materials]);

  const overall = useMemo(() => {
    const actualSum = computedMaterials.reduce((s, m) => s + num(m.actualPing), 0);
    const afterWasteSum = computedMaterials.reduce((s, m) => s + num(m.materialTotalPing), 0);
    return { actualSum, afterWasteSum };
  }, [computedMaterials]);

  /* ===== 派工單文字（維持原本較完整） ===== */
  const workOrderText = useMemo(() => {
    const materialLines = computedMaterials
      .map((m, idx) => {
        const model = (m.model || "").trim();
        const brand = (m.brand || "").trim();
        const perBox = m.perBoxPing ? `${m.perBoxPing}` : "";
        const actual = m.actualPing ? `${m.actualPing}` : "";

        const parts = [];
        if (m.accessoriesDivider) parts.push(`區隔條*${m.accessoriesDivider}`);
        if (m.accessoriesStarter) parts.push(`起步條*${m.accessoriesStarter}`);
        if (m.accessoriesL) parts.push(`L條*${m.accessoriesL}`);
        if (m.accessoriesMoisture) parts.push(`防潮布*${m.accessoriesMoisture}`);

        const accLine = parts.length ? `  配件：${parts.join(" 、")}\n` : "";

        return `材料${computedMaterials.length > 1 ? `（${idx + 1}）` : ""}：
  品牌：${brand}
  型號：${model}
  實際坪數：${actual}
  每箱坪數：${perBox}
  箱數：${m.boxes} 箱（材料總坪數 ${m.boxedTotalPing.toFixed(2)} 坪）
${accLine}`.trimEnd();
      })
      .join("\n\n");

    const cutDoorLine = (f.cutDoorCount || "").toString().trim()
      ? `有無需要切門：有 ${f.cutDoorCount} 門，現場評估是否切門，如有裁切提前回報`
      : `有無需要切門： 門，現場評估是否切門，如有裁切提前回報`;

    return `施工日：${f.workDate || ""}
聯絡人：${f.contactName || ""}
電話：${f.phone || ""}
聯絡地址：${f.address || ""}

${materialLines}

鋪設方式：${f.installMethod || ""}
施工範圍：${f.scope || ""}
有無電梯：${f.elevator || ""}
是否需要處理踢腳板：${f.skirting || ""}
有無車位：${f.parking || ""}
卸工具、材料位置：${f.unloadPlace || ""}
${cutDoorLine}
施工備註：${f.note || ""}
額外費用：${f.extraFee || ""}

業務：${f.salesman || ""}
指定組別：${f.team || ""}`.trim();
  }, [f, computedMaterials]);

  /* ===== 叫料單文字（依你指定的最精簡格式） ===== */
  const purchaseOrderText = useMemo(() => {
    // 叫料品牌（去重、保留順序）
    const brandList = [];
    const addBrand = (b) => {
      const t = (b || "").trim();
      if (!t) return;
      if (!brandList.includes(t)) brandList.push(t);
    };
    computedMaterials.forEach((m) => addBrand(m.brand));

    const brandLine = brandList.length ? brandList.join("、") : "";

    const materialLine = computedMaterials
      .map((m) => {
        const brand = (m.brand || "").trim();
        const model = (m.model || "").trim();
        const tag = [brand, model].filter(Boolean).join(" ");
        return `${tag} * ${m.boxes}箱`;
      })
      .filter(Boolean)
      .join("、");

    // 配件：把每筆材料的配件彙總成清單（不合併數量，先以文字列出最直覺）
    const accLines = computedMaterials
      .map((m) => {
        const brand = (m.brand || "").trim();
        const model = (m.model || "").trim();
        const head = [brand, model].filter(Boolean).join(" ");

        const parts = [];
        if (m.accessoriesDivider) parts.push(`區隔條*${m.accessoriesDivider}`);
        if (m.accessoriesStarter) parts.push(`起步條*${m.accessoriesStarter}`);
        if (m.accessoriesL) parts.push(`L條*${m.accessoriesL}`);
        if (m.accessoriesMoisture) parts.push(`防潮布*${m.accessoriesMoisture}`);

        if (!parts.length) return null;
        return `${head ? `${head}：` : ""}${parts.join("、")}`;
      })
      .filter(Boolean)
      .join("\n");

    const accessoriesBlock = accLines || "";

    return `進貨日：${f.inboundDate || ""}
聯絡地址：${f.address || ""}

叫料品牌：${brandLine}
材料：${materialLine}
配件：
${accessoriesBlock}

卸材料位置：${f.unloadMaterialPlace || ""}

現場聯絡人：${f.contactName || ""}
緊急聯絡人：${f.emergencyContact || ""}`.trim();
  }, [f, computedMaterials]);

  return (
    <div style={page}>
      <h1 style={{ marginBottom: 12, color: "#111" }}>工具｜箱數計算＋派工／叫料文字輸出</h1>

      <div style={layout}>
        {/* 左：輸入 */}
        <div style={col}>
          <Card title="基本資訊">
            <TwoCol>
              <Field
                label="施工日（MM/DD）"
                value={f.workDate}
                onChange={(v) => setField("workDate", v)}
                placeholder="例如：01/18"
              />
              <Field
                label="進貨日（MM/DD）"
                value={f.inboundDate}
                onChange={(v) => setField("inboundDate", v)}
                placeholder="例如：01/16"
              />
              <Field label="聯絡人（現場）" value={f.contactName} onChange={(v) => setField("contactName", v)} />
              <Field label="電話" value={f.phone} onChange={(v) => setField("phone", v)} />
              <Field label="聯絡地址" value={f.address} onChange={(v) => setField("address", v)} placeholder="完整地址" />
              <Field label="緊急聯絡人" value={f.emergencyContact} onChange={(v) => setField("emergencyContact", v)} placeholder="姓名/電話" />
              <Field label="卸材料位置" value={f.unloadMaterialPlace} onChange={(v) => setField("unloadMaterialPlace", v)} placeholder="例如：B1卸貨區/管理室旁" />
            </TwoCol>
          </Card>

          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <span>材料（可多筆）</span>
                <button type="button" onClick={addMaterial} style={btnAdd}>
                  + 新增材料
                </button>
              </div>
            }
          >
            <div style={{ display: "grid", gap: 12 }}>
              {computedMaterials.map((m, idx) => (
                <div key={idx} style={matCard}>
                  <div style={matHeader}>
                    <div style={{ fontWeight: 900, color: "#111" }}>
                      材料{computedMaterials.length > 1 ? `（${idx + 1}）` : ""}
                    </div>
                    <button type="button" onClick={() => removeMaterial(idx)} style={btnRemove}>
                      刪除
                    </button>
                  </div>

                  <TwoCol>
                    <Field
                      label="材料品牌"
                      value={materials[idx].brand}
                      onChange={(v) => setMat(idx, "brand", v)}
                      placeholder="例如：展匠 / HOTON / 其他"
                    />
                    <Field
                      label="材料型號"
                      value={materials[idx].model}
                      onChange={(v) => setMat(idx, "model", v)}
                      placeholder="例如：HT90-902"
                    />
                    <Field
                      label="實際坪數"
                      type="number"
                      value={materials[idx].actualPing}
                      onChange={(v) => setMat(idx, "actualPing", v)}
                      placeholder="例如：18"
                    />
                    <Field
                      label="材料每箱坪數"
                      type="number"
                      value={materials[idx].perBoxPing}
                      onChange={(v) => setMat(idx, "perBoxPing", v)}
                      placeholder="例如：1.62"
                    />
                  </TwoCol>

                  <div style={hintRow}>
                    <div style={hintBox}>
                      損耗後坪數(10%)：<b>{m.materialTotalPing.toFixed(2)}</b>
                    </div>
                    <div style={hintBox}>
                      箱數（無條件進位）：<b>{m.boxes}</b>
                    </div>
                    <div style={hintBox}>
                      材料總坪數（箱×每箱）：<b>{m.boxedTotalPing.toFixed(2)}</b>
                    </div>
                  </div>

                  <div style={{ marginTop: 10, fontWeight: 900, color: "#111" }}>配件</div>
                  <TwoCol>
                    <Field
                      label="區隔條"
                      value={materials[idx].accessoriesDivider}
                      onChange={(v) => setMat(idx, "accessoriesDivider", v)}
                      placeholder="例如：2支"
                    />
                    <Field
                      label="起步條"
                      value={materials[idx].accessoriesStarter}
                      onChange={(v) => setMat(idx, "accessoriesStarter", v)}
                      placeholder="例如：1支"
                    />
                    <Field
                      label="L條"
                      value={materials[idx].accessoriesL}
                      onChange={(v) => setMat(idx, "accessoriesL", v)}
                      placeholder="例如：3支"
                    />
                    <Field
                      label="防潮布"
                      value={materials[idx].accessoriesMoisture}
                      onChange={(v) => setMat(idx, "accessoriesMoisture", v)}
                      placeholder="例如：1捲"
                    />
                  </TwoCol>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 10, color: "#111", fontSize: 13 }}>
              總實際坪數：<b>{overall.actualSum.toFixed(2)}</b>　｜　總損耗後坪數：<b>{overall.afterWasteSum.toFixed(2)}</b>
            </div>
          </Card>

          <Card title="施工資訊（派工單用）">
            <TwoCol>
              <Field label="鋪設方式（預設直鋪）" value={f.installMethod} onChange={(v) => setField("installMethod", v)} />
              <Field label="施工範圍（預設全室）" value={f.scope} onChange={(v) => setField("scope", v)} />
              <Field label="有無電梯" value={f.elevator} onChange={(v) => setField("elevator", v)} />
              <Field label="是否需要處理踢腳板" value={f.skirting} onChange={(v) => setField("skirting", v)} />
              <Field label="有無車位" value={f.parking} onChange={(v) => setField("parking", v)} />
              <Field label="卸工具、材料位置" value={f.unloadPlace} onChange={(v) => setField("unloadPlace", v)} />
              <Field label="需要切門（門數）" type="number" value={f.cutDoorCount} onChange={(v) => setField("cutDoorCount", v)} placeholder="例如：2" />
            </TwoCol>

            <Field label="施工備註" type="textarea" value={f.note} onChange={(v) => setField("note", v)} />
            <Field label="額外費用" value={f.extraFee} onChange={(v) => setField("extraFee", v)} placeholder="例如：搬運 / 整平 / 拆除" />
          </Card>

          <Card title="人員（派工單用）">
            <TwoCol>
              <Field label="業務" value={f.salesman} onChange={(v) => setField("salesman", v)} />
              <SelectField label="指定組別（選單）" value={f.team} onChange={(v) => setField("team", v)} options={TEAM_OPTIONS} />
            </TwoCol>
          </Card>
        </div>

        {/* 右：即時輸出 */}
        <div style={col}>
          <Preview title="派工單（即時）" text={workOrderText} />
          <Preview title="叫料單（即時/精簡）" text={purchaseOrderText} />
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
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...input, height: 96, paddingTop: 10 }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={input}
        />
      )}
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#111" }}>{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={input}>
        {options.map((op) => (
          <option key={op} value={op} style={{ color: "#111" }}>
            {op}
          </option>
        ))}
      </select>
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
        <button onClick={copy} style={copyBtn}>一鍵複製</button>
      </div>
      <pre style={previewText}>{text}</pre>
    </div>
  );
}

/* ===== 樣式：強制黑字 + 白底 ===== */
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

const btnAdd = {
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
  borderRadius: 10,
  padding: "6px 10px",
  fontWeight: 900,
  fontSize: 12,
  cursor: "pointer",
};

const matCard = {
  border: "1px solid #eee",
  borderRadius: 14,
  padding: 12,
  background: "#fff",
};

const matHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  marginBottom: 8,
};

const btnRemove = {
  border: "1px solid #f1c4c4",
  background: "#fff",
  color: "#b42318",
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
