import axios from "axios";
import { host } from "./consts/host";
import { message } from "antd";
import { changeFetchInProg } from "./fetchInProgress";

export const addVideos = (videos) => ({
  type: "ADD_VIDEOS",
  videos,
});

export const startAddVideos = () => {
  return async (dispatch, getState) => {
    const header = {
      headers: {
        Authorization: `Bearer ${getState().auth.uid}`,
      },
    };
    dispatch(changeFetchInProg(true));
    try {
      const { data } = await axios.get(`${host}/videos`, header);
      dispatch(addVideos(data));
    } catch (e) {
      message.warning(e.response.data.error);
    }
    dispatch(changeFetchInProg(false));
  };
};
