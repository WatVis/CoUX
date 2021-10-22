import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Row, Col, Switch } from "antd";
import { TeamOutlined, UserOutlined } from "@ant-design/icons";
import { useNav } from "../contexts/NavProvider";
import { changeColab } from "../actions/auth";
import User from "./User";
import Logo from "./Logo";
import Search from "./Search";
import "../styles/components/header.scss";

const Header = ({ compact, isVerified }) => {
  const dispatch = useDispatch();
  const studyMode = useSelector((state) => !!state.auth.studyMode);
  const isColabState = useSelector((state) => !!state.auth.isColab);
  const { isNavOpen, setIsNavOpen, isMobile } = useNav();
  const [isColab, setIsColab] = useState(isColabState);
  function onChange() {
    if (!studyMode) {
      setIsColab((prevIsColab) => {
        localStorage.setItem(
          "coux-is-colab",
          JSON.stringify({ isColab: !prevIsColab })
        );

        dispatch(changeColab(!prevIsColab));

        return !prevIsColab;
      });
    }
  }

  useEffect(() => {
    setIsColab(isColabState);
  }, [isColabState]);

  return (
    <div className={`header-wrapper ${compact ? "compact" : ""}`}>
      <Row className="header">
        <Col
          xxl={8}
          xl={8}
          lg={8}
          md={8}
          sm={8}
          xs={8}
          className="header--left"
        >
          <Logo />
        </Col>
        <Col xxl={8} xl={8} lg={8} md={8} sm={8} xs={8} className="header--mid">
          {!isMobile ? (
            isVerified ? (
              compact ? (
                <div className="colab">
                  <UserOutlined
                    className={`colabicon ${isColab ? "" : "active"}`}
                  />
                  <Switch checked={isColab} onChange={onChange} />
                  <TeamOutlined
                    className={`colabicon ${isColab ? "active" : ""}`}
                  />
                </div>
              ) : (
                <Search />
              )
            ) : undefined
          ) : (
            <Logo />
          )}
        </Col>
        <Col
          xxl={8}
          xl={8}
          lg={8}
          md={8}
          sm={8}
          xs={8}
          className="header--right"
        >
          {isMobile ? (
            <div
              id="burgerBtn"
              className={`burgerBtn ${isNavOpen ? "navigation" : ""}`}
              onClick={() => setIsNavOpen((prevState) => !prevState)}
            ></div>
          ) : (
            <User />
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Header;
