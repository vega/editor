/**
 * Adds markdownDescription props to a schema. See https://github.com/Microsoft/monaco-editor/issues/885
 */
export default function addMarkdownProps(value) {
  if (typeof value === 'object' && value !== null) {
    if (value.description) {
      value.markdownDescription = value.description;
    }

    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        value[key] = addMarkdownProps(value[key]);
      }
    }
  }
  return value;
}
