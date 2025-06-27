import React, {useState, useEffect, useRef, useCallback} from 'react';
import ReactDOM from 'react-dom';

interface PortalWithStateProps {
  children: (props: {
    openPortal: () => void;
    closePortal: () => void;
    isOpen: boolean;
    portal: (children: React.ReactNode) => React.ReactNode;
  }) => React.ReactNode[];
  closeOnEsc?: boolean;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

const PortalWithState: React.FC<PortalWithStateProps> = ({
  children,
  closeOnEsc = false,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onOpen,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const portalNode = useRef<HTMLDivElement | null>(null);

  const openPortal = useCallback(() => {
    setIsOpen(true);
    onOpen?.();
  }, [onOpen]);

  const closePortal = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setIsOpen(controlledIsOpen);
    }
  }, [controlledIsOpen]);

  useEffect(() => {
    const div = document.createElement('div');
    div.setAttribute('id', `portal-${Math.random().toString(36).substr(2, 9)}`);
    document.body.appendChild(div);
    portalNode.current = div;

    return () => {
      if (portalNode.current) {
        document.body.removeChild(portalNode.current);
      }
    };
  }, []);

  useEffect(() => {
    if (closeOnEsc && isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closePortal();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [closeOnEsc, isOpen, closePortal]);

  const portal = (childrenToPortal: React.ReactNode) => {
    if (!isOpen || !portalNode.current) {
      return null;
    }

    return ReactDOM.createPortal(childrenToPortal, portalNode.current);
  };

  return <>{children({openPortal, closePortal, isOpen, portal})}</>;
};

export {PortalWithState};
