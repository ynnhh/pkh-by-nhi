/*eslint-disable*/
import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";

import imagine1 from "assets/img/sidebar-1.jpg";
import imagine2 from "assets/img/sidebar-2.jpg";
import imagine3 from "assets/img/sidebar-3.jpg";
import imagine4 from "assets/img/sidebar-4.jpg";

export default function FixedPlugin(props) {
  // 1. Mặc định chỉ để "dropdown", bỏ "show" để menu ẩn lúc đầu
  const [classes, setClasses] = React.useState("dropdown");
  const [bgImage, setBgImage] = React.useState(props.bgImage);

  const handleClick = () => {
    // Đảo ngược trạng thái ẩn hiện khi click vào icon bánh răng
    if (classes.indexOf("show") !== -1) {
      setClasses("dropdown");
    } else {
      setClasses("dropdown show");
    }
    props.handleFixedClick();
  };

  return (
    <div
      className={classnames("fixed-plugin", {
        "rtl-fixed-plugin": props.rtlActive
      })}
      style={{
        bottom: "30px", // Cố định cách đáy 30px
        top: "auto"     // Hủy bỏ vị trí top nếu có
      }}
    >
      <div id="fixedPluginClasses" className={classes}>
        <div onClick={handleClick} style={{ cursor: "pointer" }}>
          <i className="fa fa-cog fa-2x" />
        </div>
        <ul className="dropdown-menu">
          <li className="header-title">SIDEBAR FILTERS</li>
          <li className="adjustments-line">
            <a className="switch-trigger">
              <div>
                {["purple", "blue", "green", "red", "orange"].map((color) => (
                  <span
                    key={color}
                    className={
                      props.bgColor === color
                        ? `badge filter badge-${color} active`
                        : `badge filter badge-${color}`
                    }
                    data-color={color}
                    onClick={() => props.handleColorClick(color)}
                  />
                ))}
              </div>
            </a>
          </li>
          <li className="header-title">Images</li>
          {[imagine1, imagine2, imagine3, imagine4].map((img, index) => (
            <li key={index} className={bgImage === img ? "active" : ""}>
              <a
                className="img-holder switch-trigger"
                onClick={() => {
                  setBgImage(img);
                  props.handleImageClick(img);
                }}
              >
                <img src={img} alt="..." />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

FixedPlugin.propTypes = {
  bgImage: PropTypes.string,
  handleFixedClick: PropTypes.func,
  rtlActive: PropTypes.bool,
  fixedClasses: PropTypes.string,
  bgColor: PropTypes.oneOf(["purple", "blue", "green", "orange", "red"]),
  handleColorClick: PropTypes.func,
  handleImageClick: PropTypes.func
};