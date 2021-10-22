import React from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import "../styles/components/not-found.scss";

export const NotFound = () => (
  <>
    <div className="not-found-header">
      <Logo />
      <Link to="/" className="button-transparent">
        Home
      </Link>
    </div>
    <div className="text">
      <p>404</p>
    </div>
    <div className="container">
      <div className="caveman">
        <div className="leg">
          <div className="foot">
            <div className="fingers"></div>
          </div>
        </div>
        <div className="leg">
          <div className="foot">
            <div className="fingers"></div>
          </div>
        </div>
        <div className="shape">
          <div className="circle"></div>
          <div className="circle"></div>
        </div>
        <div className="head">
          <div className="eye">
            <div className="nose"></div>
          </div>
          <div className="mouth"></div>
        </div>
        <div className="arm-right">
          <div className="club"></div>
        </div>
      </div>
      <div className="caveman">
        <div className="leg">
          <div className="foot">
            <div className="fingers"></div>
          </div>
        </div>
        <div className="leg">
          <div className="foot">
            <div className="fingers"></div>
          </div>
        </div>
        <div className="shape">
          <div className="circle"></div>
          <div className="circle"></div>
        </div>
        <div className="head">
          <div className="eye">
            <div className="nose"></div>
          </div>
          <div className="mouth"></div>
        </div>
        <div className="arm-right">
          <div className="club"></div>
        </div>
      </div>
    </div>
  </>
);

export default NotFound;
