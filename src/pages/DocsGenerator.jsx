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
    workDate: "",
    inboundDate: "",

    contactName: "",
    phone: "",
    address: "",

    emergencyContact: "余崇耀 0987359611", // ⭐ 預設
    unloadMaterialPlace: "",

    installMethod: "直鋪",
    scope: "全室",
    elevator: "",
    skirting: "",
    parking: "",
    unloadPlace: "",
    cutDoorCount: "",
    note: "",
    extraFee: "",

    salesman: "余崇耀 0987359611", // ⭐ 預設
    team: TEAM_OPTIONS[0],

    otherItems: "", // ⭐ 新增：其他配件或材料
  });

  const [materials, setMaterials] = useState([emptyMaterial()]);

  function setField(key, value) {
    setF((prev) => ({ ...prev, [key]: value }));
  }

  function setMat(i, key, value) {
    setMaterials((prev) =>
      prev.map((m, idx) => (idx === i ? { ...m, [key]: value } : m))
    );
  }

  const computedMaterials = useMemo(() => {
    return materials.map((m) => {
      const c = calcBoxes(m.actualPing, m.perBoxPing);
      return { ...m, ...c };
    });
  }, [materials]);

  /* ===== 派工單 ===== */
  const workOrderText = useMemo(() => {
    const materialLines = computedMaterials
      .map((m, idx) => {
        const parts = [];
        if (m.accessoriesDivider) parts.push(`區隔條*${m.accessoriesDivider}`);
        if (m.accessoriesStarter) parts.push(`起步條*${m.accessoriesStarter}`);
        if (m.accessoriesL) parts.push(`L條*${m.accessoriesL}`);
        if (m.accessoriesMoisture) parts.push(`防潮布*${m.accessoriesMoisture}`);

        const accLine = parts.length ? `配件：${parts.join(" 、")}` : "";

        return `材料${idx + 1}：
${m.brand} ${m.model}
${m.boxes} 箱（${m.boxedTotalPing.toFixed(2)} 坪）
${accLine}`;
      })
      .join("\n\n");

    return `施工日：${f.workDate}
聯絡人：${f.contactName}
電話：${f.phone}
聯絡地址：${f.address}

${materialLines}

${f.otherItems ? `其他配件或材料：${f.otherItems}\n` : ""}
鋪設方式：${f.installMethod}
施工範圍：${f.scope}
有無電梯：${f.elevator}
是否需要處理踢腳板：${f.skirting}
有無車位：${f.parking}
卸工具、材料位置：${f.unloadPlace}
施工備註：${f.note}
額外費用：${f.extraFee}

業務：${f.salesman}
指定組別：${f.team}`;
  }, [f, computedMaterials]);

  /* ===== 叫料單 ===== */
  const purchaseOrderText = useMemo(() => {
    const materialsLine = computedMaterials
      .map((m) => `${m.brand} ${m.model} * ${m.boxes}箱`)
      .join("、");

    return `進貨日：${f.inboundDate}
聯絡地址：${f.address}

叫料品牌：${computedMaterials.map((m) => m.brand).join("、")}
材料：${materialsLine}
${f.otherItems ? `其他配件或材料：${f.otherItems}` : ""}

卸材料位置：${f.unloadMaterialPlace}

現場聯絡人：${f.contactName}
緊急聯絡人：${f.emergencyContact}`;
  }, [f, computedMaterials]);

  return (
    <div style={{ padding: 16 }}>
      <h2>派工 / 叫料 工具</h2>

      <label>緊急聯絡人</label>
      <input value={f.emergencyContact} onChange={(e) => setField("emergencyContact", e.target.value)} />

      <label>業務</label>
      <input value={f.salesman} onChange={(e) => setField("salesman", e.target.value)} />

      <label>其他配件或材料</label>
      <input
        placeholder="有填才會顯示"
        value={f.otherItems}
        onChange={(e) => setField("otherItems", e.target.value)}
      />

      <h3>派工單</h3>
      <pre>{workOrderText}</pre>

      <h3>叫料單</h3>
      <pre>{purchaseOrderText}</pre>
    </div>
  );
}
