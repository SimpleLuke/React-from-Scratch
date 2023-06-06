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
    <div>
      <ul>
        <li>1</li>
        <li>2</li>
        <li>3</li>
      </ul>
    </div>
  </div>
);

const container = document.getElementById("root");
RFS.render(element, container);
