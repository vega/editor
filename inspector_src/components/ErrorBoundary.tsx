import React from "react";
import styled from "styled-components";

const ErrorMessage = styled.span`
  transform: translate(-50%, -50%);
`;

export type ErrorBoundaryProps = { children?: React.ReactNode };

export type ErrorBoundaryState = { hasError: boolean };

export class ErrorBoundary extends React.Component {
  public state: ErrorBoundaryState = { hasError: false };

  public constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(_error: unknown): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: unknown, errorInfo: unknown): void {
    // You can also log the error to an error reporting service
    console.log("Oops", error, errorInfo);
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <ErrorMessage className="relative top-1/2 left-1/2 p-2 border border-red-500 text-red-600 rounded">
          Oops, something went wrong.
        </ErrorMessage>
      );
    }
    return this.props.children;
  }
}
