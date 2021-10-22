import axios from "axios";
import { history } from "../routers/AppRouter";
import { host } from "./consts/host";
import { message } from "antd";
import { changeFetchInProg } from "./fetchInProgress";
import { startAddVideos } from "./projects";

export const login = (user) => ({
  type: "LOGIN",
  user,
});

export const changeColab = (isColab) => ({
  type: "CHANGE_COLAB",
  isColab,
});

export const logout = () => ({
  type: "LOGOUT",
});

export const startLogin = (user = "", pass = "", token) => {
  return async (dispatch) => {
    const json = {
      email: user,
      password: pass,
    };
    dispatch(changeFetchInProg(true));
    try {
      const header = {};
      let key;
      // check token existance for impersonate and if null for oAuth
      if (token) {
        header.headers = {
          Authorization: `Bearer ${token}`,
        };
        key = token;
      } else {
        const { data } = await axios.post(`${host}/users/login`, json);
        header.headers = {
          Authorization: `Bearer ${data.token}`,
        };
        key = data.token;
      }

      const { data } = await axios.get(`${host}/users/me`, header);
      localStorage.setItem("coux-user", JSON.stringify({ token: key }));
      dispatch(login({ ...data, uid: key }));

      if (data.studyMode) {
        localStorage.setItem(
          "coux-is-colab",
          JSON.stringify({ isColab: data.isColabMode })
        );
        dispatch(changeColab(data.isColabMode));
      } else {
        const localStorageColab = JSON.parse(
          localStorage.getItem("coux-is-colab")
        );
        if (localStorageColab) {
          const { isColab } = localStorageColab;
          dispatch(changeColab(isColab));
        } else {
          localStorage.setItem(
            "coux-is-colab",
            JSON.stringify({ isColab: false })
          );
          dispatch(changeColab(false));
        }
      }

      dispatch(startAddVideos());
    } catch (e) {
      message.warning("User not found!");
    }
    dispatch(changeFetchInProg(false));
  };
};

export const startRegister = (user = "", pass = "") => {
  return async (dispatch) => {
    dispatch(changeFetchInProg(true));
    const json = {
      email: user,
      password: pass,
    };
    try {
      await axios.post(`${host}/users`, json);
      dispatch(startLogin(user, pass));
    } catch (e) {
      message.warning("Something went wrong!");
    }
    dispatch(changeFetchInProg(false));
  };
};

export const startLogout = () => {
  return async (dispatch, getState) => {
    dispatch(changeFetchInProg(true));
    const header = {
      headers: {
        Authorization: `Bearer ${getState().auth.uid}`,
      },
    };
    await axios.post(`${host}/users/logout`, undefined, header);
    dispatch(logout());
    localStorage.removeItem("user");
    dispatch(changeFetchInProg(false));
    history.push("/login");
  };
};
