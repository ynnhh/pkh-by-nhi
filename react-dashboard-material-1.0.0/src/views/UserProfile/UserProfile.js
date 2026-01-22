/*eslint-disable*/
import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
import Snackbar from "@material-ui/core/Snackbar";
import { Alert } from "@material-ui/lab"; 

import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Button from "components/CustomButtons/Button.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";

const useStyles = makeStyles({
  cardTitleWhite: { color: "#FFFFFF", marginTop: "0px", fontWeight: "700", fontSize: "1.4rem" },
  darkCard: {
    backgroundColor: "#020617 !important",
    border: "1px solid #1e293b",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
  },
  orderBox: {
    background: "#0f172a",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "20px",
    border: "1px solid #1e293b"
  },
  customInput: {
    width: "100%",
    background: "#020617",
    border: "1px solid #334155",
    color: "#e5e7eb",
    fontSize: "13px",
    padding: "10px 12px",
    borderRadius: "10px",
    outline: "none",
    transition: "all 0.2s",
    "&:focus": { borderColor: "#22c55e", boxShadow: "0 0 0 2px rgba(34, 197, 94, 0.2)" }
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
    "& th": { color: "#64748b", fontSize: "12px", textAlign: "left", padding: "8px", borderBottom: "1px solid #1e293b" },
    "& td": { padding: "8px", borderBottom: "1px solid #0f172a" }
  }
});

const PURECHILL_XJ = { 1:[215,219], 2:[223,227], 3:[232,236], 4:[241,245], 5:[250,254], 6:[259,263], 7:[267,271] };
const PURECHILL = { 3:[230,239],4:[239,248],5:[248,256],6:[256,265],7:[265,274],8:[274,283],9:[283,291],10:[291,300],11:[300,309],12:[309,318],13:[318,327],14:[327,336],15:[336,344],16:[344,353],17:[353,362],18:[362,371]};

export default function UserProfile() {
  const classes = useStyles();
  const [shippingData, setShippingData] = useState({ wb: null, info: null });
  const [orders, setOrders] = useState([{ id: Date.now(), jh: "", sizes: [{ id: Date.now() + 1, s: "", p: "" }] }]);
  const [alert, setAlert] = useState({ open: false, msg: "", severity: "success" });
  
  // Refs để quản lý focus
  const inputRefs = useRef({});
  const safeNorm = x => String(x || "").trim().toUpperCase();
  const isExportReady = shippingData.wb !== null && orders.some(o => o.jh.trim() !== "");

  const handleCloseAlert = () => setAlert({ ...alert, open: false });

  // Logic Enter để chuyển ô hoặc thêm dòng (Dùng useEffect để bắt đúng lúc DOM render xong)
  const focusLastInput = (id, type) => {
    setTimeout(() => {
      const key = `${id}-${type}`;
      if (inputRefs.current[key]) {
        inputRefs.current[key].focus();
        inputRefs.current[key].select();
      }
    }, 10);
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(new Uint8Array(ev.target.result), { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        let hr = 0;
        for(let r=0; r<40 && r<aoa.length; r++) {
          if(aoa[r].map(safeNorm).some(v => v.includes("JH") || v.includes("ORDER"))) { hr = r; break; }
        }
        const h = aoa[hr].map(safeNorm);
        const pick = (...keys) => {
          const idx = h.findIndex(val => val && keys.some(k => val.includes(k)));
          return idx !== -1 ? idx : null;
        };
        setShippingData({
          wb,
          info: {
            sheet: wb.SheetNames[0], header: hr,
            jhIdx: pick("JH", "ORDER"), poIdx: pick("PO"),
            lineIdx: pick("LINE", "CHUYEN", "CHUYỀN"),
            styleIdx: pick("STYLE", "ART", "ARTICLE")
          }
        });
        setAlert({ open: true, msg: "Đã nạp file Shipping thành công!", severity: "success" });
      } catch (err) { setAlert({ open: true, msg: "Lỗi file: " + err.message, severity: "error" }); }
    };
    reader.readAsArrayBuffer(f);
  };

  const addOrder = () => setOrders([...orders, { id: Date.now(), jh: "", sizes: [{ id: Date.now() + 1, s: "", p: "" }] }]);
  
  const addSizeRow = (orderId) => {
    const newSizeId = Date.now();
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, sizes: [...o.sizes, { id: newSizeId, s: "", p: "" }] } : o
    ));
    focusLastInput(newSizeId, 's'); // Tự động focus vào ô Size mới
  };

  const handleExport = () => {
    if (!isExportReady) return;
    try {
      const rows = [["LINE", "JH", "PO", "SAMPLE", "SIZE", "L/R", "ACTUAL", "STANDARD", "RESULT"]];
      const merges = [];
      let cur = 1;
      const rRange = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

      orders.forEach(order => {
        if (!order.jh) return;
        const ws = shippingData.wb.Sheets[shippingData.info.sheet];
        const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        const target = safeNorm(order.jh);
        let meta = null;
        for(let r = shippingData.info.header + 1; r < aoa.length; r++) {
          if(safeNorm(aoa[r][shippingData.info.jhIdx]) === target) {
            const style = safeNorm(aoa[r][shippingData.info.styleIdx]);
            meta = {
              po: aoa[r][shippingData.info.poIdx] || "",
              line: aoa[r][shippingData.info.lineIdx] || "",
              stdTable: style.includes("XJ") ? PURECHILL_XJ : PURECHILL
            };
            break;
          }
        }
        if (!meta) throw new Error(`Không thấy đơn: ${order.jh}`);
        
        let sn = 1;
        const orderStart = cur;
        order.sizes.forEach(sz => {
          const s = parseInt(sz.s), p = parseInt(sz.p);
          const range = meta.stdTable[s];
          if (!range || isNaN(p)) return;
          const sizeStart = cur;
          const [min, max] = range;
          const std = `${min}-${max}`;
          for (let i = 0; i < p; i++) {
            const excelR = cur + 1;
            const formula = `IF(AND(G${excelR}>=VALUE(LEFT(H${excelR},FIND("-",H${excelR})-1)),G${excelR}<=VALUE(MID(H${excelR},FIND("-",H${excelR})+1,99))),"Pass","Fail")`;
            rows.push([meta.line, order.jh, meta.po, sn, s, "Left", rRange(min, max), std, {f: formula}]);
            rows.push(["", "", "", sn, s, "Right", rRange(min, max), std, {f: formula}]);
            merges.push({ s: { r: cur, c: 3 }, e: { r: cur + 1, c: 3 } });
            cur += 2; sn++;
          }
          merges.push({ s: { r: sizeStart, c: 4 }, e: { r: cur - 1, c: 4 } }, { s: { r: sizeStart, c: 7 }, e: { r: cur - 1, c: 7 } });
        });
        merges.push({ s: { r: orderStart, c: 0 }, e: { r: cur - 1, c: 0 } }, { s: { r: orderStart, c: 1 }, e: { r: cur - 1, c: 1 } }, { s: { r: orderStart, c: 2 }, e: { r: cur - 1, c: 2 } });
      });

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws["!merges"] = merges;
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      XLSX.writeFile(wb, "InnerLength_Final.xlsx");
      setAlert({ open: true, msg: "Xuất file thành công!", severity: "success" });
    } catch (e) { setAlert({ open: true, msg: "❌ " + e.message, severity: "error" }); }
  };

  return (
    <GridContainer justify="center">
      <GridItem xs={12} sm={12} md={10}>
        <Card className={classes.darkCard}>
          <CardHeader color="success">
            <h4 className={classes.cardTitleWhite}>InnerLength</h4>
          </CardHeader>
          <CardBody>
            <GridContainer>
              <GridItem xs={12} md={6}>
                <label style={{ color: "#64748b", fontSize: "12px", fontWeight: "600" }}>
                   {shippingData.wb ? "✔ File Shipping đã nạp" : "⚠ CHỌN FILE SHIPPING (.XLSX)"}
                </label>
                <input type="file" onChange={handleFile} className={classes.customInput} style={{ marginTop: "5px", borderColor: shippingData.wb ? "#22c55e" : "#334155" }} />
              </GridItem>
              <GridItem xs={12} md={6} style={{ textAlign: "right", alignSelf: "flex-end" }}>
                <Button color="white" simple onClick={addOrder}>+ Thêm đơn mới</Button>
                <Button color="danger" simple onClick={() => setOrders([])}>Xoá tất cả</Button>
              </GridItem>
            </GridContainer>

            <div style={{ marginTop: "30px" }}>
              {orders.map((order) => (
                <div key={order.id} className={classes.orderBox}>
                  <div style={{ color: "#22c55e", fontWeight: "bold", marginBottom: "8px" }}>📦 JHV No:</div>
                  <input
                    className={classes.customInput}
                    style={{ width: "200px", border: "1px solid #22c55e" }}
                    placeholder="Nhập mã JHV..."
                    value={order.jh}
                    onChange={(e) => setOrders(orders.map(o => o.id === order.id ? { ...o, jh: e.target.value } : o))}
                  />
                  <table className={classes.table}>
                    <thead>
                      <tr><th className="idx-col">#</th><th>Size </th><th></th><th>Số đôi</th><th></th></tr>
                    </thead>
                    <tbody>
                      {order.sizes.map((sz, idx) => (
                        <tr key={sz.id}>
                          <td style={{ color: "#475569", width: "35px", textAlign: "center" }}>{idx + 1}</td>
                          <td>
                            <input
                              type="number"
                              ref={el => inputRefs.current[`${sz.id}-s`] = el}
                              className={classes.customInput}
                              value={sz.s}
                              placeholder="Size"
                              onChange={(e) => setOrders(orders.map(o => o.id === order.id ? { ...o, sizes: o.sizes.map(s => s.id === sz.id ? { ...s, s: e.target.value } : s) } : o))}
                              onKeyDown={(e) => {
                                if(e.key === "Enter") {
                                  e.preventDefault();
                                  inputRefs.current[`${sz.id}-p`]?.focus();
                                }
                              }}
                            />
                          </td>
                          <td style={{ color: "#475569", width: "35px", textAlign: "center" }}></td>
                          <td>
                            <input
                              type="number"
                              ref={el => inputRefs.current[`${sz.id}-p`] = el}
                              className={classes.customInput}
                              value={sz.p}
                              placeholder="Số đôi"
                              onChange={(e) => setOrders(orders.map(o => o.id === order.id ? { ...o, sizes: o.sizes.map(s => s.id === sz.id ? { ...s, p: e.target.value } : s) } : o))}
                              onKeyDown={(e) => {
                                if(e.key === "Enter") {
                                  e.preventDefault();
                                  const isLast = idx === order.sizes.length - 1;
                                  if(isLast) {
                                    addSizeRow(order.id);
                                  } else {
                                    const nextId = order.sizes[idx+1].id;
                                    inputRefs.current[`${nextId}-s`]?.focus();
                                  }
                                }
                              }}
                            />
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button onClick={() => setOrders(orders.map(o => o.id === order.id ? { ...o, sizes: o.sizes.filter(s => s.id !== sz.id) } : o))} style={{ background: "none", border: "none", color: "#f97373", cursor: "pointer" }}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Button color="success" simple size="sm" onClick={() => addSizeRow(order.id)}>+ Thêm Size</Button>
                </div>
              ))}
            </div>
          </CardBody>
          <CardFooter style={{ borderTop: "1px solid #1e293b", display: "block" }}>
            <Button color="success" onClick={handleExport} fullWidth disabled={!isExportReady} style={{ fontSize: "16px", fontWeight: "bold", opacity: isExportReady ? 1 : 0.5 }}>
               {isExportReady ? "XUẤT EXCEL" : "NHẬP THÔNG TIN"}
            </Button>
          </CardFooter>
        </Card>
      </GridItem>

      <Snackbar open={alert.open} autoHideDuration={4000} onClose={handleCloseAlert} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleCloseAlert} severity={alert.severity} variant="filled">{alert.msg}</Alert>
      </Snackbar>
    </GridContainer>
  );
}