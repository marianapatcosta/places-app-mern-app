import React, { useEffect, useState, Fragment, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";

import "./UpdatePlace.css";
import Input from "../../../shared/FormElement/Input/Input";
import Button from "../../../shared/FormElement/Button/Button";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "../../../shared/util/validators";
import useForm from "../../../shared/Hooks/form-hook";
import useHttpClient from "../../../shared/Hooks/http-hook";
import Card from "../../../shared/UIElements/Card/Card";
import LoadingSpinner from "../../../shared/UIElements/LoadingSpinner/LoadingSpinner";
import ErrorModal from "../../../shared/UIElements/ErrorModal/ErrorModal";
import { AuthContext } from "../../../shared/context/auth-context";

const UpdatePlace = () => {
  const { userId, token } = useContext(AuthContext);
  const [isLoading, error, sendRequest, clearError] = useHttpClient();
  //const placeId = useParams().placeId;
  const { placeId } = useParams();
  const history = useHistory();
  const [loadedPlace, setLoadedPlace] = useState();

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
    },
    true
  );

  useEffect(() => {
    const fetchPlace = async () => {
      const responseData = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`
      );
      setLoadedPlace(responseData.place);

      setFormData(
        {
          title: {
            value: responseData.place.title,
            isValid: true,
          },
          description: {
            value: responseData.place.description,
            isValid: true,
          },
        },
        true
      );
    };
    fetchPlace();
  }, [sendRequest, placeId, setFormData]);

  const placeUpdateSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`,
        "PATCH",
        JSON.stringify({
          title: formState.inputs.title.value,
          description: formState.inputs.description.value,
        }),
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );

      history.push(`/${userId}/places`);
    } catch (error) {}
  };

  /* To work around the fact that, when initializing, initialValue takes "" as value, so the input fields will appear empty
  in this way, only when formState.inputs.title.value is not an "" (after useEffect runs), the form will be rendered*/
  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!loadedPlace && !error) {
    return (
      <div className="center">
        <Card>
          <h2>Could not find place!</h2>
        </Card>
      </div>
    );
  }

  return (
    <Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && loadedPlace && (
        <form className="place-form" onSubmit={placeUpdateSubmitHandler}>
          <Input
            id="title"
            element="input"
            type="text"
            label="Title"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a title."
            onInput={inputHandler}
            initialValue={loadedPlace.title}
            initialIsValid={true}
          />
          <Input
            id="description"
            element="textarea"
            type="text"
            label="Description"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="Please enter a valid description. At least 5 characters."
            onInput={inputHandler}
            initialValue={loadedPlace.description}
            initialIsValid={true}
          />
          <Button type="submit" disabled={!formState.isValid}>
            UPDATE PLACE
          </Button>
        </form>
      )}
    </Fragment>
  );
};

export default UpdatePlace;
