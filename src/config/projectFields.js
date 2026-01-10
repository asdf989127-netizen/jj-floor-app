export const PROJECT_FIELDS = [
  // 基本
  { key: "title", label: "案件名稱", type: "text", required: true, placeholder: "例如：王先生八德宅 / 陳小姐龜山" },
  { key: "status", label: "案件狀態", type: "select", required: true, options: ["洽談", "已丈量", "已報價", "已成交", "施工中", "完工", "保固中", "結案"] },

  // 日期
  { key: "measureDate", label: "丈量日期", type: "date", required: false },
  { key: "planStartDate", label: "預計施工日", type: "date", required: false },
  { key: "doneDate", label: "完工日期", type: "date", required: false },

  // 面積/條件
  { key: "areaPing", label: "施工面積（坪）", type: "number", required: false, placeholder: "例如：18" },
  { key: "wastePct", label: "損耗率（%）", type: "number", required: false, placeholder: "例如：7" },
  { key: "needLeveling", label: "需要整平", type: "select", required: false, options: ["不確定", "需要", "不需要"] },
  { key: "needRemoval", label: "需要拆除", type: "select", required: false, options: ["不確定", "需要", "不需要"] },

  // 材料
  { key: "floorType", label: "地板類型", type: "select", required: false, options: ["SPC 石塑", "超耐磨木地板", "海島型木地板", "IWF 無機地板", "其他"] },
  { key: "floorModel", label: "型號 / 系列", type: "text", required: false, placeholder: "例如：HOTON HT90-902" },
  { key: "underlay", label: "底墊", type: "text", required: false, placeholder: "例如：2mm IXPE / 靜音墊" },
  { key: "skirting", label: "踢腳線", type: "text", required: false, placeholder: "例如：9cm PVC / 實木" },

  // 金額
  { key: "pricePerPing", label: "單價（元/坪）", type: "number", required: false, placeholder: "例如：3890" },
  { key: "totalPrice", label: "總價（元）", type: "number", required: false, placeholder: "例如：128000" },
  { key: "deposit", label: "訂金（元）", type: "number", required: false, placeholder: "例如：30000" },
  { key: "payStatus", label: "付款狀態", type: "select", required: false, options: ["未收", "已收訂金", "已收部分", "已收全款"] },

  // 備註
  { key: "note", label: "案件備註", type: "textarea", required: false, placeholder: "施工注意事項、客戶偏好、現場限制…" },
];
