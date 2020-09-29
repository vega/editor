import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useTransition, animated } from "react-spring";
import tutorialHtml from "../../docs/tutorials.md";
import "./TutorialPopup.pcss";

export type TutorialPopupContentProps = {
  style: React.CSSProperties;
  onClose: () => void;
};

const TutorialPopupContent: React.FC<TutorialPopupContentProps> = ({
  style,
  onClose,
}) => (
  <animated.div
    className="text-content fixed top-1/2 left-1/2 mx-auto bg-white rounded shadow-lg translate-1/2 overflow-auto"
    role="dialog"
    style={style}
  >
    <header className="flex items-center px-4 py-2 text-gray-100 bg-gray-800 font-bold text-lg rounded-t">
      Tutorials
      <button className="ml-auto" onClick={onClose}>
        <FontAwesomeIcon icon="times" fixedWidth />
      </button>
    </header>
    <main
      className="px-4 pt-2 pb-4"
      dangerouslySetInnerHTML={{ __html: tutorialHtml }}
    ></main>
  </animated.div>
);

export type TutorialPopupProps = { show: boolean; onClose: () => void };

const TutorialPopup: React.FC<TutorialPopupProps> = ({ show, onClose }) => {
  const popupTransition = useTransition(show, null, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });
  return (
    <>
      {show ? (
        <div
          className="fixed top-0 right-0 bottom-0 left-0 bg-gray-900 bg-opacity-50"
          onClick={onClose}
        />
      ) : null}
      {popupTransition.map(({ item, key, props }) =>
        item ? (
          <TutorialPopupContent key={key} style={props} onClose={onClose} />
        ) : null
      )}
    </>
  );
};

export default TutorialPopup;
