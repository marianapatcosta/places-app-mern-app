import React from "react";
import { Link } from "react-router-dom";

import Avatar from "../../../shared/UIElements/Avatar/Avatar";
import Card from "../../../shared/UIElements/Card/Card";
import "./User.css";

const User = ({ userId, name, image, placeCount }) => {
  return (
    <li className="user-item">
        <Card className="user-item__content">
          <Link to={`/${userId}/places`}>
            <div className="user-item__image">
              <Avatar image={`${process.env.REACT_APP_ASSET_URL}/${image}`} alt={name} />
            </div>
            <div className="user-item__info">
              <h2>{name}</h2>
              <h3>
                {placeCount} {placeCount === 1 ? "Place" : "Places"}
              </h3>
            </div>
          </Link>
        </Card>
    </li>
  );
};

export default User;
