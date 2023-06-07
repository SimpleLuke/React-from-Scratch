import RFS from "./RFS/react-from-scratch";

/** @jsxRuntime classic */
/** @jsx RFS.createElement */
function App(props) {
  const [countState, setCountState] = RFS.useState(1);
  const [inputState, setInputState] = RFS.useState("Luke");
  const updateValue = (e) => {
    setInputState(e.target.value);
  };

  return (
    <div>
      <h1>Hi {props.name}</h1>
      <input onInput={updateValue} value={inputState} />
      <h2>My name is {inputState}</h2>
      <p>Count:{countState}</p>
      <button onClick={() => setCountState((c) => c + 1)}>Click</button>
      {countState % 2 === 0 && <p>Even</p>}
    </div>
  );
}

const element = <App name="friends" />;
const container = document.getElementById("root");
RFS.render(element, container);
