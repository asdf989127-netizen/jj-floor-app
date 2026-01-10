export const SERIES_COST_FIELDS = [
  { key: "series", label: "系列 / 型號", type: "text", required: true, placeholder: "例如：HT90-902 / IWF-A12" },
  { key: "type", label: "類型", type: "select", required: true, options: ["SPC 石塑", "超耐磨木地板", "海島型木地板", "IWF 無機地板", "其他"] },
  { key: "unit", label: "計價單位", type: "select", required: true, options: ["元/坪", "元/m²"] },

  { key: "materialCost", label: "材料成本", type: "number", required: true, placeholder: "例如：2300" },
  { key: "laborCost", label: "代工費", type: "number", required: true, placeholder: "例如：600" },

  { key: "underlayCost", label: "底墊成本（選填）", type: "number", required: false, placeholder: "例如：120" },
  { key: "skirtingCost", label: "踢腳線成本（選填）", type: "number", required: false, placeholder: "例如：80" },
  { key: "trimAvgCost", label: "收邊/門檻平均成本（選填）", type: "number", required: false, placeholder: "例如：300" },

  { key: "defaultWastePct", label: "預設損耗率（%）", type: "number", required: false, placeholder: "例如：7" },
  { key: "note", label: "備註", type: "textarea", required: false, placeholder: "供應商、特殊規格、限制…" },
];
