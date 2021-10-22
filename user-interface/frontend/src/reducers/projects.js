const ProjectReducerDefaultState = [];

export default (state = ProjectReducerDefaultState, action) => {
  switch (action.type) {
    case "ADD_VIDEOS":
      return action.videos;
    default:
      return state;
  }
};
