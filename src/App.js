import "./App.css";
import ekaMobilityIcon from "./Assets/EKA_Buses_Range-1.jpg";

function App() {
  return (
    <div className="App">
      <h1 className="text-center">Genkins Test</h1>
      <div className="container">
        <p className="text-center">
          This is a React File made with the help of Bootstrap.
        </p>
        <img src={ekaMobilityIcon} alt="Icon" />
      </div>
    </div>
  );
}

export default App;
