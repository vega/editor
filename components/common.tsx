import styled from "styled-components";

const TITLE_HEIGHT = "1.75rem";

export const Panel = styled.div`
  display: flex;
  flex-direction: column;
`;

export const PanelContent = styled.main<{ padded?: boolean }>`
  padding: ${({ padded = false }): string => (padded ? "0.5rem" : "0")};
  height: calc(100% - ${TITLE_HEIGHT});
`;

export const PanelTitle = styled.header.attrs({
  className: "px-2 font-bold text-sm bg-gray-300 text-gray-700",
})`
  width: 100%;
  height: ${TITLE_HEIGHT};
  text-transform: uppercase;
  display: flex;
  align-items: center;
`;

export const EmptyStatus = styled.div.attrs({
  className: "w-full h-full text-gray-500",
})`
  display: flex;
  justify-content: center;
  align-items: center;
`;
