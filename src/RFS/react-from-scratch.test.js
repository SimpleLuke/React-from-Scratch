import "requestidlecallback-polyfill";
import RFS from "./react-from-scratch";
import { createTextElement, createDom } from "./react-from-scratch";

describe("RFS", () => {
  describe("createElement", () => {
    test("should create a virtual element with the given type, props, and children", () => {
      // Create a sample element
      const element = RFS.createElement(
        "div",
        { id: "myDiv" },
        "Hello, world!"
      );

      // Verify the properties of the created element
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

      // Create another sample element with nested children
      const nestedElement = RFS.createElement(
        "div",
        null,
        RFS.createElement("h1", null, "Heading"),
        RFS.createElement("p", null, "Paragraph")
      );

      // Verify the properties of the nested element
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
      const text = "Hello, world!";
      const textElement = createTextElement(text);

      expect(textElement.type).toBe("TEXT_ELEMENT");
      expect(textElement.props).toEqual({
        nodeValue: text,
        children: [],
      });
    });
  });

  describe("createDom", () => {
    test("should create the actual DOM element associated with the given fiber", () => {
      const fiber = {
        type: "div",
        props: {
          id: "myDiv",
          children: [],
        },
      };

      const domElement = createDom(fiber);

      expect(domElement.tagName).toBe("DIV");
      expect(domElement.id).toBe("myDiv");
      expect(domElement.childNodes.length).toBe(0);
    });

    test("should create a text node for TEXT_ELEMENT fiber type", () => {
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
});
