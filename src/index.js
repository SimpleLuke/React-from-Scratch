import RFS from "./RFS/react-from-scratch";

/** @jsxRuntime classic */
/** @jsx RFS.createElement */
function App(props) {
  const [state, setState] = RFS.useState(1);
  const updateValue = (e) => {
    rerender(e.target.value);
  };

  return (
    <div>
      <h1>Hi {props.name}</h1>
      <input onInput={updateValue} value={props.value} />
      <h2>My name is {props.value}</h2>
      <p>Count:{state}</p>
      <button onClick={() => setState((c) => c + 1)}>Click</button>
      {state % 2 === 0 && <p>Even</p>}
    </div>
  );
}

const rerender = (value) => {
  const element = <App name="friends" value={value} />;
  const container = document.getElementById("root");
  RFS.render(element, container);
};

rerender("Luke");
