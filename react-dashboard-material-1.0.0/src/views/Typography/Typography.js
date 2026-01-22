/*eslint-disable*/
import React, { useState } from "react";
import * as XLSX from "xlsx";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import InputAdornment from "@material-ui/core/InputAdornment";
import Icon from "@material-ui/core/Icon";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";
import Button from "components/CustomButtons/Button.js";

const useStyles = makeStyles({
  cardTitleWhite: { 
    color: "#FFFFFF", 
    marginTop: "0px", 
    fontWeight: "700", 
    fontSize: "1.2rem",
    marginBottom: "5px"
  },
  cardCategoryWhite: { 
    color: "rgba(255,255,255,.7)", 
    margin: "0", 
    fontSize: "13px" 
  },
  darkCard: {
    backgroundColor: "#020617 !important",
    border: "1px solid #1e293b",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    marginTop: "30px", // Để CardHeader lòi ra không bị che
    overflow: "visible"
  },
  instruction: {
    color: "#94a3b8",
    fontSize: "13px",
    marginBottom: "25px",
    borderLeft: "4px solid #22c55e",
    paddingLeft: "15px",
    lineHeight: "1.6"
  },
  labelCaps: {
    color: "#64748b",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: "8px",
    display: "block",
    letterSpacing: "1px"
  },
  // Input phong cách Dark đồng bộ
  customInput: {
    width: "100%",
    boxSizing: "border-box",
    background: "#020617",
    border: "1px solid #334155",
    color: "#22c55e", 
    fontSize: "15px",
    fontWeight: "600",
    padding: "12px 15px",
    borderRadius: "10px",
    outline: "none",
    transition: "all 0.2s",
    "&:focus": {
      borderColor: "#22c55e",
      boxShadow: "0 0 8px rgba(34, 197, 94, 0.2)",
      background: "#0a0f1e"
    }
  },
  adornment: {
    color: "#64748b",
    fontSize: "13px",
    marginLeft: "-45px", // Đẩy đơn vị vào trong ô input
    fontWeight: "bold",
    pointerEvents: "none"
  }
});

export default function TypographyPage() {
  const classes = useStyles();
  const [values, setValues] = useState({
    rows: "35",
    cols: "3",
    min: "11",
    max: "17"
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const handleExport = () => {
    const ROWS = parseInt(values.rows);
    const COLS = parseInt(values.cols);
    const MIN = parseFloat(values.min) / 100;
    const MAX = parseFloat(values.max) / 100;

    const data = [];
    for (let i = 0; i < ROWS; i++) {
      const row = [];
      for (let j = 0; j < COLS; j++) {
        const raw = Math.random() * (MAX - MIN) + MIN;
        const rounded = Math.round(raw * 1000) / 1000;
        row.push({ v: rounded, t: 'n', z: '0.0%' });
      }
      data.push(row);
    }

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `BaoCao_NgauNhien_${values.min}-${values.max}%.xlsx`);
  };

  return (
    <GridContainer justify="center">
      <GridItem xs={12} sm={12} md={8}>
        <Card className={classes.darkCard}>
          <CardHeader color="success">
            <h4 className={classes.cardTitleWhite}>
              <Icon style={{ verticalAlign: "middle", marginRight: "10px" }}>assessment</Icon>
              Công Cụ Tạo Dữ Liệu Phần Trăm
            </h4>
            <p className={classes.cardCategoryWhite}>
              Tạo số ngẫu nhiên 
            </p>
          </CardHeader>
          <CardBody>
            <div className={classes.instruction}>
              {/* Hệ thống sẽ tự động tính toán dữ liệu trong khoảng chỉ định và định dạng trực tiếp thành kiểu <b>Percentage</b> khi xuất file. */}
            </div>
            
            <GridContainer>
              <GridItem xs={12} sm={6}>
                <span className={classes.labelCaps}>Số lượng dòng</span>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                  <input
                    name="rows"
                    type="number"
                    className={classes.customInput}
                    value={values.rows}
                    onChange={handleInputChange}
                  />
                  <span className={classes.adornment}></span>
                </div>
              </GridItem>

              <GridItem xs={12} sm={6}>
                <span className={classes.labelCaps}>Số lượng cột</span>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                  <input
                    name="cols"
                    type="number"
                    className={classes.customInput}
                    value={values.cols}
                    onChange={handleInputChange}
                  />
                  <span className={classes.adornment}></span>
                </div>
              </GridItem>

              <GridItem xs={12} sm={6}>
                <span className={classes.labelCaps}>Giá trị tối thiểu</span>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                  <input
                    name="min"
                    type="number"
                    className={classes.customInput}
                    value={values.min}
                    onChange={handleInputChange}
                  />
                  <span className={classes.adornment}>%</span>
                </div>
              </GridItem>

              <GridItem xs={12} sm={6}>
                <span className={classes.labelCaps}>Giá trị tối đa</span>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                  <input
                    name="max"
                    type="number"
                    className={classes.customInput}
                    value={values.max}
                    onChange={handleInputChange}
                  />
                  <span className={classes.adornment}>%</span>
                </div>
              </GridItem>
            </GridContainer>
          </CardBody>
          <CardFooter style={{ borderTop: "1px solid #1e293b", paddingTop: "15px" }}>
            <Button color="success" onClick={handleExport} fullWidth style={{ fontSize: "15px", padding: "12px" }}>
              <Icon>cloud_download</Icon> &nbsp; Xuất File Excel Ngay
            </Button>
          </CardFooter>
        </Card>
      </GridItem>
    </GridContainer>
  );
}