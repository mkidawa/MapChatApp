import React from "react";
import "./NightToggler.style.scss";
import Moon from "../../assets/svg/moon.svg";

const NightToggler = ({ isChecked, toggleNightMode }) => {
  return (
    <label className="nighttoggler__wrapper">
      <img src={Moon} className="nighttoggler__icon" alt="" />
      <div className="nighttoggler">
        <input type="checkbox" className="nighttoggler__checkbox" checked={isChecked ? "checked" : ""} onChange={toggleNightMode} />
        <span className="nighttoggler__lever"></span>
      </div>
    </label>

  );
};

export default NightToggler;
