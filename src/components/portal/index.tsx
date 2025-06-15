import React, {useState, useEffect, useRef} from 'react';
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
  const isControlled = controlledIsOpen !== undefined;
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(defaultOpen);
  const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen;
  const portalNode = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const div = document.createElement('div');
    div.setAttribute('id', `portal-${Math.random().toString(36).substr(2, 9)}`);
    document.body.appendChild(div);
    portalNode.current = div;

    return () => {
      if (portalNode.current && document.body.contains(portalNode.current)) {
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
  }, [closeOnEsc, isOpen]);

  const openPortal = () => {
    if (!isControlled) {
      setUncontrolledIsOpen(true);
      if (onOpen) onOpen();
    } else if (onOpen && !isOpen) {
      onOpen();
    }
  };

  const closePortal = () => {
    if (!isControlled) {
      setUncontrolledIsOpen(false);
      if (onClose) onClose();
    } else if (onClose && isOpen) {
      onClose();
    }
  };

  const portal = (childrenToPortal: React.ReactNode) => {
    if (!isOpen || !portalNode.current) {
      return null;
    }

    return ReactDOM.createPortal(childrenToPortal, portalNode.current);
  };

  return <>{children({openPortal, closePortal, isOpen, portal})}</>;
};

export {PortalWithState};
