import RFS from "./react-from-scratch";
import { createTextElement } from "./react-from-scratch";

describe("RFS", () => {
  describe("createElement", () => {
    it("returns an element", () => {
      const element = RFS.createElement(
        "div",
        { id: "foo" },
        RFS.createElement("a", null, "bar")
      );
      expect(element).toEqual({
        type: "div",
        props: {
          id: "foo",
          children: [
            {
              type: "a",
              props: {
                children: [
                  {
                    type: "TEXT_ELEMENT",
                    props: { children: [], nodeValue: "bar" },
                  },
                ],
              },
            },
          ],
        },
      });
    });
  });

  describe("render", () => {
    const container = document.createElement("div");

    afterEach(() => {
      container.innerHTML = "";
    });

    it("renders a text element", () => {
      const textElement = createTextElement("Hello, Jest!");
      RFS.render(textElement, container);

      expect(container.textContent).toBe("Hello, Jest!");
    });

    it("renders a regular DOM element with props and children", () => {
      const element = {
        type: "div",
        props: {
          className: "my-class",
          children: [
            createTextElement("Hello"),
            {
              type: "span",
              props: {
                id: "my-span",
                children: [createTextElement("Jest!")],
              },
            },
          ],
        },
      };

      RFS.render(element, container);

      expect(container.innerHTML).toBe(
        '<div class="my-class">Hello<span id="my-span">Jest!</span></div>'
      );
    });
  });
});

describe("createTextElement", () => {
  it("returns a text element object", () => {
    expect(createTextElement("hello")).toEqual({
      type: "TEXT_ELEMENT",
      props: {
        nodeValue: "hello",
        children: [],
      },
    });
  });
});
