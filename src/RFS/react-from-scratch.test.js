import "requestidlecallback-polyfill";
import {
  createElement,
  createTextElement,
  createDom,
  updateDom,
} from "./react-from-scratch";

describe("RFS", () => {
  describe("createElement", () => {
    test("should create a virtual element with the given type, props, and children", () => {
      const element = createElement("div", { id: "myDiv" }, "Hello, world!");

      expect(element.type).toBe("div");
      expect(element.props).toEqual({
        id: "myDiv",
        children: [
          {
            type: "TEXT_ELEMENT",
            props: {
              nodeValue: "Hello, world!",
              children: [],
            },
          },
        ],
      });

      const nestedElement = createElement(
        "div",
        null,
        createElement("h1", null, "Heading"),
        createElement("p", null, "Paragraph")
      );

      expect(nestedElement.type).toBe("div");
      expect(nestedElement.props).toEqual({
        children: [
          {
            type: "h1",
            props: {
              children: [
                {
                  type: "TEXT_ELEMENT",
                  props: {
                    nodeValue: "Heading",
                    children: [],
                  },
                },
              ],
            },
          },
          {
            type: "p",
            props: {
              children: [
                {
                  type: "TEXT_ELEMENT",
                  props: {
                    nodeValue: "Paragraph",
                    children: [],
                  },
                },
              ],
            },
          },
        ],
      });
    });
  });

  describe("createTextElement", () => {
    test("should create a virtual text element with the given text value", () => {
      const textElement = createTextElement("Hello, world!");

      expect(textElement.type).toBe("TEXT_ELEMENT");
      expect(textElement.props).toEqual({
        nodeValue: "Hello, world!",
        children: [],
      });
    });
  });

  describe("createDom", () => {
    test("should create the actual DOM element associated with the given fiber", () => {
      const fiber = {
        type: "div",
        props: {
          className: "container",
          children: [],
        },
      };

      const domElement = createDom(fiber);

      expect(domElement.tagName).toBe("DIV");
      expect(domElement.className).toBe("container");
      expect(domElement.childNodes.length).toBe(0);
    });

    test("should create a text node for a TEXT_ELEMENT fiber", () => {
      const fiber = {
        type: "TEXT_ELEMENT",
        props: {
          nodeValue: "Hello, world!",
          children: [],
        },
      };

      const domElement = createDom(fiber);

      expect(domElement.nodeType).toBe(Node.TEXT_NODE);
      expect(domElement.nodeValue).toBe("Hello, world!");
    });
  });

  describe("updateDom", () => {
    test("should update the DOM element with the new properties and event listeners", () => {
      const domElement = {
        onClick: true,
        onMouseOver: null,
        removeEventListener: jest.fn(function (eventType, handler) {
          if (eventType === "click") {
            this.onClick = null;
          } else if (eventType === "mouseover") {
            this.onMouseOver = null;
          }
        }),
        addEventListener: jest.fn(function (eventType, handler) {
          if (eventType === "click") {
            this.onClick = true;
          } else if (eventType === "mouseover") {
            this.onMouseOver = true;
          }
        }),
      };

      const prevProps = {
        className: "container",
        onClick: true,
      };

      const nextProps = {
        className: "updated-container",
        onClick: true,
        onMouseOver: true,
      };

      updateDom(domElement, prevProps, nextProps);

      expect(domElement.className).toBe("updated-container");
      expect(domElement.onClick).toBe(true);
      expect(domElement.onMouseOver).toBe(true);

      const removedProps = {
        className: "updated-container",
        onClick: jest.fn(),
      };

      updateDom(domElement, nextProps, removedProps);

      expect(domElement.className).toBe("updated-container");
      expect(domElement.onClick).toBe(true);
      expect(domElement.onMouseOver).toBe(null);
    });
  });
});
