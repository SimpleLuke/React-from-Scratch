import RFS from "./RFS/react-from-scratch";

// const element = RFS.createElement(
//   "div",
//   { id: "foo" },
//   RFS.createElement("a", null, "bar"),
//   RFS.createElement("b")
// );

/** @jsxRuntime classic */
/** @jsx RFS.createElement */
const element = (
  <div id="foo">
    <a href=".">bar</a>
    <br />
  </div>
);

const container = document.getElementById("root");
RFS.render(element, container);
