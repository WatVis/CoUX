const FetchInProgressDefaultState = false;

export default (state = FetchInProgressDefaultState, action) => {
  switch (action.type) {
    case "CHNAGE_PROGRESS":
      return action.fetchInProgress;
    default:
      return state;
  }
};
