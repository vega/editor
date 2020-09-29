import styled from "styled-components";

const TITLE_HEIGHT = "1.75rem";

export const Panel = styled.div`
  display: flex;
  flex-direction: column;
`;

export type PanelContentProps = { fullscreen?: boolean; padded?: boolean };

export const PanelContent = styled.main.attrs<PanelContentProps>(
  ({ fullscreen }) => ({
    className: fullscreen
      ? ("fixed top-0 right-0 bottom-0 left-0" as string)
      : ("" as string),
  })
)<PanelContentProps>`
  padding: ${({ padded = false }): string => (padded ? "0.5rem" : "0")};
  height: ${({ fullscreen }) =>
    fullscreen ? "100%" : `calc(100% - ${TITLE_HEIGHT})`};
  overflow: auto;
`;

export const PanelHeader = styled.header.attrs({
  className: "px-2 font-bold bg-gray-300 text-gray-700" as string,
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
  ({ toggled, disabled }) => ({
    className:
      "px-1 border rounded text-xs uppercase" +
      (disabled
        ? " border-gray-500 text-gray-600 cursor-default"
        : " border-gray-800" +
          (toggled
            ? " bg-gray-700 text-white hover:bg-gray-600 hover:border-gray-700"
            : " hover:bg-gray-100")),
  })
)<PanelHeaderButtonProps>`
  transition: background 0.2s ease-in-out;
`;
