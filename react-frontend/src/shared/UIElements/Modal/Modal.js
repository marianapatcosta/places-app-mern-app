import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import { CSSTransition } from "react-transition-group";

import "./Modal.css";
import Backdrop from "../Backdrop/Backdrop";

const ModalOverlay = ({
  className,
  contentClass,
  footerClass,
  style,
  header,
  headerClass,
  onSubmit,
  footer,
  children,
}) => {
  const content = (
    <div className={`modal ${className}`} style={style}>
      <header className={`modal__header ${headerClass}`}>
        <h2>{header}</h2>
      </header>
      <form onSubmit={onSubmit ? onSubmit : event => event.preventDefault()}>
        <div className={`modal__content ${contentClass}`}>{children}</div>
        <footer className={`modal__footer ${footerClass}`}>{footer}</footer>
      </form>
    </div>
  );
  return ReactDOM.createPortal(content, document.getElementById("modal-hook"));
};

const Modal = ({ show, onCancel, ...modalProps }) => {
  return (
    <Fragment>
      { show && <Backdrop onClick={onCancel}></Backdrop> }
      <CSSTransition
        in={show}
        mountOnEnter
        unmountOnExit
        timeout={200}
        classNames="modal"
      >
    <ModalOverlay {...modalProps} />
      </CSSTransition>
    </Fragment>
  );
};

export default Modal;
