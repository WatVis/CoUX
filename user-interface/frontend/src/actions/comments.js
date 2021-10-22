import * as types from "../constants/ActionTypes";

let nextCommentId = 0;

export const addComment = (message, user) => ({
  type: types.ADD_COMMENT,
  message,
  user,
});

export const commentReceived = (message, user) => ({
  type: types.COMMENT_RECEIVED,
  message,
  user,
});
