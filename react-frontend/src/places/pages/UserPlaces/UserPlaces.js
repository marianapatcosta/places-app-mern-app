import React, { useEffect, useState, Fragment } from "react";
import { useParams } from "react-router-dom";

import PlaceList from "../../components/PlaceList/PlaceList";
import useHttpClient from "../../../shared/Hooks/http-hook";
import ErrorModal from "../../../shared/UIElements/ErrorModal/ErrorModal";
import LoadingSpinner from "../../../shared/UIElements/LoadingSpinner/LoadingSpinner";

const UserPlaces = () => {
  const [loadedPlaces, setLoadedPlaces] = useState([]);
  const [isLoading, error, sendRequest, clearError] = useHttpClient();

  //useParams returns an object with dynamic segment properties, including userId used in query parameters
  const { userId } = useParams();

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/places/user/${userId}`
        );
        setLoadedPlaces(responseData.places);
      } catch (error) {}
    };
    fetchPlaces();
  }, [sendRequest, userId]);

  const placeDeleteHandler = (deletedPlaceId) => {
    setLoadedPlaces((prevPlaces) =>
      prevPlaces.filter((place) => place.id !== deletedPlaceId)
    );
  };

  return (
    <Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedPlaces && (
        <PlaceList places={loadedPlaces} onDelete={placeDeleteHandler} />
      )}
      ;
    </Fragment>
  );
};

export default UserPlaces;
