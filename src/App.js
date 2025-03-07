import "./App.css";
import ekaMobilityIcon from "./Assets/EKA_Buses_Range-1.jpg";

function App() {
  return (
    <div className="App">
      <h1 className="text-center">Jenkins Test 2</h1>
      <div className="container">
        <p className="text-center">
          This is a React File made with the help of Bootstrap This is modified.
        </p>
        <img src={ekaMobilityIcon} alt="Icon" style={{width: "100%" }} />
      </div>
    </div>
  );
}

export default App;
