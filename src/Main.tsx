import App from "./App";
import "./App.css";
import Active from "./components/Active";
import NLP from "./components/Nlp";
import Time from "./components/Time";
function Main() {
  const isTimeMode = window.location.href?.includes("time");
  const isNlpMode = window.location.href?.includes("nlp");
  const isActive = window.location.href?.includes("active");
  
  if (isTimeMode) {
    return <Time />;
  }

  if (isNlpMode) {
    return <NLP />;
  }

  if (isActive) {
    return <Active />;
  }

  return <App />;
}

export default Main;
