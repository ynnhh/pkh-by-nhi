/*eslint-disable*/
import React from "react";
import PropTypes from "prop-types";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
// core components
import styles from "assets/jss/material-dashboard-react/components/footerStyle.js";

const useStyles = makeStyles((theme) => ({
  ...styles,
  // Thêm class để ghi đè căn giữa
  footerContainerCustom: {
    display: "flex",
    justifyContent: "center", // Căn giữa theo chiều ngang
    alignItems: "center",     // Căn giữa theo chiều dọc
    flexDirection: "column",  // Xếp chồng các dòng lên nhau
    textAlign: "center",
    width: "100%",
    padding: "15px 0"
  },
  debugText: {
    margin: "0",
    fontSize: "12px",
    textTransform: "uppercase",
    fontWeight: "500",
    color: "#64748b", // Màu xám nhẹ cho tinh tế
    letterSpacing: "1px"
  },
  copyright: {
    margin: "5px 0 0",
    fontSize: "14px",
    color: "#94a3b8"
  }
}));

export default function Footer(props) {
  const classes = useStyles();
  return (
    <footer className={classes.footer}>
      {/* Sử dụng class custom để căn giữa hoàn toàn */}
      <div className={classes.footerContainerCustom}>
        
        <p className={classes.copyright}>
          <span>
            &copy; 2025
            by nhi
          </span>
        </p>
      </div>
    </footer>
  );
}