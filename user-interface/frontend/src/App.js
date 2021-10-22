import React, { Component } from "react";
import { Provider } from "react-redux";
import { store } from "./store/configureStore";
import AppRouter from "./routers/AppRouter";
import Loading from "./components/Loading";
import { startLogin } from "./actions/auth";
import "./styles/App.scss";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
    };
  }
  async componentDidMount() {
    const user = JSON.parse(localStorage.getItem("coux-user"));
    if (user) {
      await store.dispatch(startLogin(undefined, undefined, user.token));
    }
    this.setState(() => ({
      loading: false,
    }));
  }
  render() {
    return (
      <Provider store={store}>
        {this.state.loading ? <Loading /> : <AppRouter />}
      </Provider>
    );
  }
}

export default App;
