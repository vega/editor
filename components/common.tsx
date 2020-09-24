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

export const PanelHeader = styled.header.attrs({
  className: "px-2 font-bold bg-gray-300 text-gray-700",
})`
  width: 100%;
  height: ${TITLE_HEIGHT};
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

export type PanelHeaderButtonProps = { toggled?: boolean };

export const PanelHeaderButton = styled.button.attrs<PanelHeaderButtonProps>(
  ({ toggled }) => ({
    className:
      "ml-auto px-1 border border-gray-800 rounded text-xs uppercase" +
      (toggled
        ? " bg-gray-700 text-white hover:bg-gray-600 hover:border-gray-700"
        : " hover:bg-gray-100"),
  })
)<PanelHeaderButtonProps>`
  transition: background 0.2s ease-in-out;
`;
