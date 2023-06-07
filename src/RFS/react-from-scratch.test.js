import "requestidlecallback-polyfill";
import RFS from "./react-from-scratch";

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
});
