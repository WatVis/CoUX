import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import auth from "../reducers/auth";
import comments from "../reducers/comments";
import projects from "../reducers/projects";
import fetchInProgress from "../reducers/fetchInProgress";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const appReducer = combineReducers({
  auth,
  projects,
  fetchInProgress,
  comments,
});

const rootReducer = (state, action) => {
  if (action.type === "LOGOUT") {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk))
);
