import React from "react";
import { connect } from "react-redux";
import { Route, Redirect } from "react-router-dom";
import { useNav } from "../contexts/NavProvider";
import Header from "../components/Header";
import VerifyEmail from "../components/VerifyEmail";
import Nav from "../components/Nav";

export const PrivateRoute = ({
  isAuthenticated,
  component: Component,
  nav,
  fetchInProgress,
  isVerified,
  headerIsCompact,
  ...rest
}) => {
  const { isNavOpen } = useNav();

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          isVerified ? (
            <>
              <div className={`wrapper ${isNavOpen ? "navigation" : ""}`}>
                <div
                  className={`wrapper-scale ${isNavOpen ? "navigation" : ""}`}
                >
                  <Header compact={headerIsCompact} isVerified={isVerified} />
                  <Component {...props} />
                </div>
              </div>
              <Nav isNavOpen={isNavOpen} />
            </>
          ) : (
            <>
              <div className={`wrapper ${isNavOpen ? "navigation" : ""}`}>
                <div
                  className={`wrapper-scale ${isNavOpen ? "navigation" : ""}`}
                >
                  <Header isVerified={isVerified} compact={true} />
                  <VerifyEmail {...props} />
                </div>
              </div>
              <Nav isNavOpen={isNavOpen} />
            </>
          )
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

const mapStateToProps = (state) => ({
  isAuthenticated: !!state.auth.uid,
  fetchInProgress: state.fetchInProgress,
  isVerified: !!state.auth.isVerified,
});

PrivateRoute.defaultProps = {
  headerIsCompact: false,
};

export default connect(mapStateToProps)(PrivateRoute);
