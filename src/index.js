import RFS from "./RFS/react-from-scratch";

// const element = RFS.createElement(
//   "div",
//   { id: "foo" },
//   RFS.createElement("a", null, "bar"),
//   RFS.createElement("b")
// );

/** @jsxRuntime classic */
/** @jsx RFS.createElement */
function App(props) {
  const updateValue = (e) => {
    rerender(e.target.value);
  };

  return (
    <div>
      <h1>Hi {props.name}</h1>
      <input onInput={updateValue} value={props.value} />
      <h2>My name is {props.value}</h2>
    </div>
  );
}

const rerender = (value) => {
  const element = <App name="friends" value={value} />;
  const container = document.getElementById("root");
  RFS.render(element, container);
};

rerender("Luke");
