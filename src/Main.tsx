import App from "./App";
import "./App.css";
import Time from "./components/Time";
function Main() {
  const isTimeMode = window.location.href?.includes("time")
  
  return isTimeMode ? <Time /> : <App />;
}

export default Main;
