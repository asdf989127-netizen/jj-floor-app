export const CUSTOMER_FIELDS = [
  // 基本
  { key: "name", label: "客戶姓名 / 稱呼", type: "text", required: true, placeholder: "例如：王先生 / 李小姐" },
  { key: "phone1", label: "電話 1", type: "tel", required: true, placeholder: "主要聯絡電話" },
  { key: "phone2", label: "電話 2", type: "tel", required: false, placeholder: "備用電話（選填）" },
  { key: "lineId", label: "LINE ID", type: "text", required: false, placeholder: "選填" },
  { key: "email", label: "Email", type: "email", required: false, placeholder: "選填" },

  // 地址/現場
  { key: "address", label: "施工地址", type: "text", required: true, placeholder: "完整地址" },
  { key: "area", label: "區域", type: "text", required: false, placeholder: "例如：桃園 八德 / 新北 板橋" },
  { key: "floor", label: "樓層", type: "text", required: false, placeholder: "例如：3F / 15F" },
  { key: "elevator", label: "電梯", type: "select", required: false, options: ["有", "無", "不確定"] },
  { key: "parkingNote", label: "停車 / 卸貨說明", type: "textarea", required: false, placeholder: "例如：社區可臨停10分鐘、需走樓梯…" },

  // 來源/偏好
  { key: "source", label: "來源", type: "select", required: false, options: ["Facebook", "介紹", "路過", "Google", "其他"] },
  { key: "budget", label: "預算區間", type: "select", required: false, options: ["未提", "10萬內", "10–20萬", "20–30萬", "30萬以上"] },
  { key: "preference", label: "偏好（顏色/風格）", type: "textarea", required: false, placeholder: "例如：淺木紋、偏灰、現代風…" },

  // 備註
  { key: "note", label: "備註", type: "textarea", required: false, placeholder: "重要注意事項（寵物/工期/禁忌/特殊要求）" },
];
