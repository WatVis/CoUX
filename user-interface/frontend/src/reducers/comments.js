const initState = [];

const comments = (state = initState, action) => {
  switch (action.type) {
    case "ADD_COMMENT":
    case "COMMENT_RECEIVED":
      return state.concat([
        {
          message: action.message,
          user: action.user,
        },
      ]);
    default:
      return state;
  }
};

export default comments;
