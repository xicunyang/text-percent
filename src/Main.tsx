import App from "./App";
import "./App.css";
import Time from "./components/Time";
function Main() {
  console.log('location.href:::', window.location.href);
  const isTimeMode = window.location.href?.includes("time")
  
  return isTimeMode ? <Time /> : <App />;
}

export default Main;
