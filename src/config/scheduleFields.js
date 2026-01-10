export const SCHEDULE_FIELDS = [
  { key: "date", label: "施工日期", type: "date", required: true },
  { key: "timeSlot", label: "時段", type: "select", required: true, options: ["全天", "上午", "下午"] },
  { key: "crew", label: "工班 / 師傅", type: "select", required: true, options: ["A工班", "B工班", "C工班", "外包1", "外包2"] },
  { key: "task", label: "施工內容", type: "select", required: true, options: ["鋪設", "拆除", "整平", "收邊", "丈量", "補修", "其他"] },
  { key: "status", label: "狀態", type: "select", required: true, options: ["已安排", "施工中", "完工", "延後"] },
  { key: "note", label: "備註", type: "textarea", required: false, placeholder: "例如：需要保護電梯、地坪高低差、門框修整…" },
];
