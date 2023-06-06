import RFS from "./RFS/react-from-scratch";

// const element = RFS.createElement(
//   "div",
//   { id: "foo" },
//   RFS.createElement("a", null, "bar"),
//   RFS.createElement("b")
// );

/** @jsxRuntime classic */
/** @jsx RFS.createElement */
const container = document.getElementById("root");

const updateValue = (e) => {
  rerender(e.target.value);
};

const rerender = (value) => {
  const element = (
    <div>
      <input onInput={updateValue} value={value} />
      <h2>My name is {value}</h2>
    </div>
  );
  RFS.render(element, container);
};

rerender("Luke");
