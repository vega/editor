import styled from "styled-components";

const FloatingButton = styled.button.attrs({
  className:
    "absolute right-4 bottom-4 px-2 py-1 bg-blue-700 text-white rounded shadow hover:bg-blue-600",
})`
  transition: background 0.2s ease-in-out;
`;

export default FloatingButton;
