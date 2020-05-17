import React, { useState, Fragment, useContext } from "react";

import Button from "../../../shared/FormElement/Button/Button";
import Card from "../../../shared/UIElements/Card/Card";
import Map from "../../../shared/UIElements/Map/Map";
import Modal from "../../../shared/UIElements/Modal/Modal";
import { AuthContext } from "../../../shared/context/auth-context";
import useHttpClient from "../../../shared/Hooks/http-hook";
import "./Place.css";
import ErrorModal from "../../../shared/UIElements/ErrorModal/ErrorModal";
import LoadingSpinner from "../../../shared/UIElements/LoadingSpinner/LoadingSpinner";

const Place = ({
  id,
  image,
  title,
  address,
  description,
  coordinates,
  onDelete,
  creatorId,
}) => {
  const [isLoading, error, sendRequest, clearError] = useHttpClient();

  const { userId, token } = useContext(AuthContext);
  const [showMap, setShowMap] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  /* We pass a function inside the state setter because this state depends on the previous state */
  const toggleShowMap = () => setShowMap((prevShowMap) => !prevShowMap);

  const toggleDeleteWarningHandler = () =>
    setShowConfirmModal((prevShowConfirmModal) => !prevShowConfirmModal);

  const confirmDeleteHandler = async () => {
    toggleDeleteWarningHandler();
    try {
      await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/places/${id}`, "DELETE", null, {
        Authorization: `Bearer ${token}`,
      });
      onDelete(id);
    } catch (error) {}
  };

  return (
    <Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Modal
        show={showMap}
        onCancel={toggleShowMap}
        header={address}
        contentClass="place__modal-content"
        footerClass="place__modal-actions"
        footer={<Button onClick={toggleShowMap}>CLOSE</Button>}
      >
        <div className="map-container">
          <Map center={coordinates} zoom={10} />
        </div>
      </Modal>
      <Modal
        show={showConfirmModal}
        onCancel={toggleDeleteWarningHandler}
        header="Are you sure?"
        footerClass="place__modal-actions"
        footer={
          <Fragment>
            <Button inverse onClick={toggleDeleteWarningHandler}>
              CANCEL
            </Button>
            <Button danger onClick={confirmDeleteHandler}>
              DELETE
            </Button>
          </Fragment>
        }
      >
        <p>
          Do you want to proceed and delete this place? Please note than this
          cannot be undone!
        </p>
      </Modal>
      <li className="place">
        <Card className="place__content">
          {isLoading && <LoadingSpinner asOverlay />}
          <div className="place__image">
            <img src={`${process.env.REACT_APP_ASSET_URL}/${image}`} alt={title} />
          </div>
          <div className="place__info">
            <h2>{title}</h2>
            <h3>{address}</h3>
            <p>{description}</p>
          </div>
          <div className="place__actions">
            <Button inverse onClick={toggleShowMap}>
              VIEW ON MAP
            </Button>
            {userId === creatorId && <Button to={`/places/${id}`}>EDIT</Button>}
            {userId === creatorId && (
              <Button danger onClick={toggleDeleteWarningHandler}>
                DELETE
              </Button>
            )}
          </div>
        </Card>
      </li>
    </Fragment>
  );
};

export default Place;
