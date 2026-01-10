import { HashRouter, NavLink, Route, Routes, Navigate } from "react-router-dom";
import Customers from "./pages/Customers";
import Projects from "./pages/Projects";
import Schedule from "./pages/Schedule";
import Inventory from "./pages/Inventory";
import DocsGenerator from "./pages/DocsGenerator";

const navStyle = {
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 0,
  height: 64,
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  borderTop: "1px solid #e5e5e5",
  background: "white",
};

const linkStyle = ({ isActive }) => ({
  display: "grid",
  placeItems: "center",
  textDecoration: "none",
  color: isActive ? "#111" : "#777",
  fontWeight: isActive ? 900 : 600,
  fontSize: 13,
});

export default function App() {
  return (
    <HashRouter>
      <div style={{ paddingBottom: 80 }}>
        <Routes>
          {/* ⭐ 首頁直接導向輸出單 */}
          <Route path="/" element={<Navigate to="/docs" replace />} />

          <Route path="/docs" element={<DocsGenerator />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/inventory" element={<Inventory />} />
        </Routes>

        <nav style={navStyle}>
          <NavLink to="/docs" style={linkStyle}>輸出單</NavLink>
          <NavLink to="/customers" style={linkStyle}>客戶</NavLink>
          <NavLink to="/projects" style={linkStyle}>案件</NavLink>
          <NavLink to="/schedule" style={linkStyle}>排工</NavLink>
          <NavLink to="/inventory" style={linkStyle}>成本</NavLink>
        </nav>
      </div>
    </HashRouter>
  );
}
