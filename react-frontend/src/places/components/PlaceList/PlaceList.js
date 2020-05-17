import React from "react";

import Button from "../../../shared/FormElement/Button/Button";
import Card from "../../../shared/UIElements/Card/Card";
import Place from "../Place/Place";
import "./PlaceList.css";

const PlaceList = ({ places, onDelete }) => {
  if (places.length === 0) {
    return (
      <div className="place-list center">
        <Card>
          <h2>No places found. Do you want to create one?</h2>
          <Button to="/places/new">Share Place</Button>
        </Card>
      </div>
    );
  }

  return (
    <ul className="place-list">
      {places.map((place) => (
        <Place
          key={place.id}
          id={place.id}
          image={place.image}
          title={place.title}
          description={place.description}
          address={place.address}
          creatorId={place.creator}
          coordinates={place.location}
          onDelete= {onDelete}
        />
      ))}
    </ul>
  );
};

export default PlaceList;
