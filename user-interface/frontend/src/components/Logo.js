import React from "react";
import { Link } from "react-router-dom";
import "../styles/components/logo.scss";

export const Logo = ({ centered }) => (
  <Link className={`logo ${centered ? "centered" : ""}`} to="/">
    <strong>CO</strong>UX
  </Link>
);

export default Logo;
