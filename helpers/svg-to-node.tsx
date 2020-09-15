import React, { SVGProps } from "react";

/**
 * Transform HTML elements to corresponding `ReactElement`s
 * @param el The element to be transformed
 */
export function transform(el: Element): React.ReactElement | null {
  /**
   * A helper function that move attribute from native `Element`s to `ReactElement`s.
   * @param name the attribute name **of ReactElement in camel case**
   * @param target the target React props object
   * @param attrName the attribute name **of native elements in kebab case**
   */
  function set<T>(
    name: keyof SVGProps<T>,
    target: SVGProps<T>,
    attrName: string = name
  ): void {
    const value = el.getAttribute(attrName);
    if (value !== null) {
      // I got TS2590 here, which is an issue of TypeScript.
      // > Expression produces a union type that is too complex to represent.
      // So I have to convert to any, then set the property.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (target as any)[name] = value;
    }
  }

  /**
   * A helper function that transforms children.
   * @param children the children
   */
  function mapTransform(children: HTMLCollection): React.ReactNode[] {
    const result: React.ReactNode[] = [];
    const { length } = children;
    for (let i = 0; i < length; i++) {
      result.push(transform(children.item(i)!));
    }
    return result.filter((x) => !!x);
  }

  if (el instanceof SVGSVGElement) {
    const attrs: SVGProps<SVGSVGElement> = {};
    set("id", attrs);
    set("className", attrs, "class");
    set("viewBox", attrs);
    set("xmlns", attrs);
    set("xmlnsXlink", attrs, "xmlns:link");
    // The reason why I don't use JSX here is that React doesn't support spread children
    // unless you call `createElement` manually. This prevents warning of unique `key` props.
    return React.createElement("svg", attrs, ...mapTransform(el.children));
  }

  if (el instanceof SVGGElement) {
    const attrs: SVGProps<SVGGElement> = {};
    set("id", attrs);
    set("className", attrs, "class");
    set("transform", attrs);
    // The reason why I don't use JSX here is that React doesn't support spread children
    // unless you call `createElement` manually. This prevents warning of unique `key` props.
    return React.createElement("g", attrs, ...mapTransform(el.children));
  }

  if (el instanceof SVGPolygonElement) {
    const attrs: SVGProps<SVGPolygonElement> = {};
    set("id", attrs);
    set("className", attrs, "class");
    set("fill", attrs);
    set("stroke", attrs);
    set("points", attrs);
    return <polygon {...attrs} />;
  }

  if (el instanceof SVGPathElement) {
    const attrs: SVGProps<SVGPathElement> = {};
    set("id", attrs);
    set("className", attrs, "class");
    set("fill", attrs);
    set("stroke", attrs);
    set("d", attrs);
    return <path {...attrs} />;
  }

  if (el instanceof SVGEllipseElement) {
    const attrs: SVGProps<SVGEllipseElement> = {};
    set("id", attrs);
    set("className", attrs, "class");
    set("fill", attrs);
    set("stroke", attrs);
    set("cx", attrs);
    set("cy", attrs);
    set("rx", attrs);
    set("ry", attrs);
    return <ellipse {...attrs} />;
  }

  if (el instanceof SVGTextElement) {
    const attrs: SVGProps<SVGTextElement> = {};
    set("id", attrs);
    set("className", attrs, "class");
    set("textAnchor", attrs, "text-anchor");
    set("x", attrs);
    set("y", attrs);
    set("fontFamily", attrs, "font-family");
    set("fontSize", attrs, "font-size");
    set("fill", attrs);
    return <text {...attrs}>{el.textContent}</text>;
  }

  if (el instanceof SVGTitleElement) {
    return <title>{el.textContent}</title>;
  }

  // We do conversion on limited types of nodes.
  return null;
}

/**
 * Parse an SVG source string into a `ReactNode`
 * @param source the SVG source string
 */
export function parse(source: string): React.ReactElement | null {
  const parser = new DOMParser();
  const el = parser.parseFromString(source, "image/svg+xml");
  const root = el.firstElementChild;
  if (root instanceof SVGElement) {
    return transform(root);
  }
  console.log(root);
  throw new Error("parsing result is not an instance of SVGElement");
}
