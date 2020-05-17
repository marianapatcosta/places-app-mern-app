import React from "react";

import Modal from "../Modal/Modal";
import Button from "../../FormElement/Button/Button";

const ErrorModal = ({ onClear, error }) => {
  return (
    <Modal
      onCancel={onClear}
      header="An Error Occurred!"
      show={!!error}
      footer={<Button onClick={onClear}>OK</Button>}
    >
      <p>{error}</p>
    </Modal>
  );
};

export default ErrorModal;
