export default (state = {}, action) => {
  switch (action.type) {
    case "LOGIN":
      return { ...action.user };
    case "CHANGE_COLAB":
      return { ...state, isColab: action.isColab };
    case "LOGOUT":
      return {};
    default:
      return state;
  }
};
