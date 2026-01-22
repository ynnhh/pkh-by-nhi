/*eslint-disable*/
import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";

// Core Material UI Components
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Snackbar from "@material-ui/core/Snackbar";

// Theme components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";
import Button from "components/CustomButtons/Button.js";

const useStyles = makeStyles({
  cardTitleWhite: { color: "#FFFFFF", fontWeight: "700", fontSize: "1.2rem", marginBottom: "5px" },
  cardCategoryWhite: { color: "rgba(255,255,255,.7)", fontSize: "13px" },
  darkCard: {
    backgroundColor: "#020617 !important",
    border: "1px solid #1e293b",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    marginTop: "30px",
  },
  inputControl: {
    width: "100%",
    background: "#020617",
    border: "1px solid #334155",
    color: "#22c55e",
    padding: "10px 12px",
    borderRadius: "8px",
    outline: "none",
    fontSize: "14px",
    "&:focus": { borderColor: "#22c55e", background: "#0a0f1e" }
  },
  labelCaps: { color: "#64748b", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px", display: "block" },
  orderRow: { display: "flex", gap: "10px", marginBottom: "10px", alignItems: "center" },
  paperDark: { backgroundColor: "#0f172a !important", color: "#fff !important", borderRadius: "15px !important", border: "1px solid #334155" }
});

export default function HumidityReport() {
  const classes = useStyles();
  const [orderList, setOrderList] = useState([{ orderId: "", cartons: "" }]);
  const [shippingData, setShippingData] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const inputRefs = useRef([]);

  // State Notifications
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, msg: "", severity: "success" });

  const showNotify = (msg, severity = "success") => setSnackbar({ open: true, msg, severity });

  // Logic nạp file Shipping (Giống hệt logic map cột của bạn)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const sh = wb.Sheets[wb.SheetNames[0]];
        const aoa = XLSX.utils.sheet_to_json(sh, { header: 1, defval: "" });
        
        const mapped = aoa.map(r => ({
          order: r[4],    // JHV.NO
          country: r[5],
          po: r[6],
          style: r[8],
          art: r[9],
          pairs: r[10]
        })).filter(r => r.order);

        setShippingData(mapped);
        setIsLoaded(true);
        showNotify("✔ Nạp Shipping thành công!");
      } catch (err) {
        showNotify("❌ Lỗi đọc file!", "error");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // GIỮ NGUYÊN LOGIC XUẤT FILE CỦA CODE MẪU
  const handleExport = () => {
    if (!isLoaded) return;

    let blocks = [];
    orderList.forEach(item => {
      if (!item.orderId || !item.cartons) return;
      const match = shippingData.find(r => 
        String(r.order).trim().toLowerCase() === item.orderId.trim().toLowerCase()
      );
      if (match) {
        blocks.push({ 
          order: item.orderId.trim(), 
          carton: parseInt(item.cartons), 
          d: match 
        });
      }
    });

    if (blocks.length === 0) {
      showNotify("❌ Không tìm thấy dữ liệu khớp!", "error");
      return;
    }

    // Khởi tạo dòng tiêu đề (Y hệt code mẫu)
    const rows = [
      ["THEO DÕI ĐỘ ẨM CỦA VẬT ĐÓNG GÓI"],
      ["Độ ẩm tiêu chuẩn: <=6%"],
      [],
      ["Ngày", "Đơn hàng", "Số PO", "Mã dép", "Số lượng đơn", "Thị trường", "Art màu", "Số thùng", "Mẫu", "Vị trí"]
    ];

    let merges = [];

    blocks.forEach(b => {
      const d = b.d;
      let firstRow = rows.length;

      // Logic mỗi thùng = 3 dòng (Y hệt code mẫu)
      for (let thung = 1; thung <= b.carton; thung++) {
        const r1 = [
          new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
          b.order,
          d.po,
          d.art,
          d.pairs,
          d.country,
          d.style,
          thung, "", ""
        ];
        const r2 = ["", "", "", "", "", "", "", thung, "", ""];
        const r3 = ["", "", "", "", "", "", "", thung, "", ""];

        rows.push(r1, r2, r3);
      }

      let lastRow = rows.length - 1;

      // Logic Merge A–G theo block đơn hàng (Y hệt code mẫu)
      for (let col = 0; col <= 6; col++) {
        merges.push({
          s: { r: firstRow, c: col },
          e: { r: lastRow, c: col }
        });
      }

      // Logic Merge cột số thùng theo từng 3 dòng (Y hệt code mẫu)
      for (let thung = 1; thung <= b.carton; thung++) {
        const start = firstRow + (thung - 1) * 3;
        merges.push({
          s: { r: start, c: 7 },
          e: { r: start + 2, c: 7 }
        });
      }
    });

    // Tạo file
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!merges"] = merges;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BaoCao");
    XLSX.writeFile(wb, "BaoCaoDoAm.xlsx");
    showNotify("✔ Xuất file thành công!");
  };

  // Các hàm phụ trợ UI
  const addRow = () => setOrderList([...orderList, { orderId: "", cartons: "" }]);
  const removeRow = (index) => {
    const newList = orderList.filter((_, i) => i !== index);
    setOrderList(newList.length ? newList : [{ orderId: "", cartons: "" }]);
  };
  const handleRowChange = (index, field, value) => {
    const newList = [...orderList];
    newList[index][field] = value;
    setOrderList(newList);
  };
  const handleKeyDown = (e, index, field) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (field === "orderId") inputRefs.current[index]?.cartons?.focus();
      else if (field === "cartons") {
        if (index < orderList.length - 1) inputRefs.current[index + 1]?.orderId?.focus();
        else addRow();
      }
    }
  };

  useEffect(() => {
    const lastIdx = orderList.length - 1;
    if (inputRefs.current[lastIdx]?.orderId && !orderList[lastIdx].orderId) {
      inputRefs.current[lastIdx].orderId.focus();
    }
  }, [orderList.length]);

  return (
    <GridContainer justify="center">
      <GridItem xs={12} sm={12} md={10}>
        
        <Snackbar 
          open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <div style={{ backgroundColor: snackbar.severity === "error" ? "#ef4444" : "#22c55e", color: "white", padding: "12px 24px", borderRadius: "8px", fontWeight: "bold" }}>
            {snackbar.msg}
          </div>
        </Snackbar>

        <Card className={classes.darkCard}>
          <CardHeader color="success">
            <h4 className={classes.cardTitleWhite}>📦 Quản Lý Báo Cáo Độ Ẩm</h4>
          </CardHeader>
          <CardBody>
            <span className={classes.labelCaps}>Bước 1: Nhập Shipping Data</span>
            <input type="file" onChange={handleFileChange} style={{ color: "#94a3b8", marginBottom: "20px" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className={classes.labelCaps}>Bước 2: Nhập đơn hàng</span>
              <Button color="danger" simple size="sm" onClick={() => setOrderList([{ orderId: "", cartons: "" }])}>Xóa sạch</Button>
            </div>

            {orderList.map((row, index) => (
              <div key={index} className={classes.orderRow}>
                <input
                  ref={(el) => { if (!inputRefs.current[index]) inputRefs.current[index] = {}; inputRefs.current[index].orderId = el; }}
                  className={classes.inputControl} style={{ flex: 3 }} placeholder="Mã đơn (VD: J-AD-...)"
                  value={row.orderId} onChange={(e) => handleRowChange(index, "orderId", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index, "orderId")}
                />
                <input
                  ref={(el) => { if (!inputRefs.current[index]) inputRefs.current[index] = {}; inputRefs.current[index].cartons = el; }}
                  className={classes.inputControl} style={{ flex: 1 }} type="number" placeholder="Số thùng"
                  value={row.cartons} onChange={(e) => handleRowChange(index, "cartons", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index, "cartons")}
                />
                <Button justIcon color="transparent" onClick={() => removeRow(index)}>
                  <Icon style={{ color: "#f97373" }}>delete_outline</Icon>
                </Button>
              </div>
            ))}

            {/* <Button color="blue" simple onClick={addRow}><Icon>add_circle</Icon> Thêm dòng</Button> */}
          </CardBody>
          <CardFooter>
            <Button color="success" fullWidth disabled={!isLoaded} onClick={handleExport}>
              <Icon>file_download</Icon> &nbsp; XUẤT EXCEL BÁO CÁO
            </Button>
          </CardFooter>
        </Card>
      </GridItem>
    </GridContainer>
  );
}