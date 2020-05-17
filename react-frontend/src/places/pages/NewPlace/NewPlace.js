import React, { useContext, Fragment } from "react";
import { useHistory } from "react-router-dom";

import Button from "../../../shared/FormElement/Button/Button";
import Input from "../../../shared/FormElement/Input/Input";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "../../../shared/util/validators";
import { AuthContext } from "../../../shared/context/auth-context";
import ErrorModal from "../../../shared/UIElements/ErrorModal/ErrorModal";
import LoadingSpinner from "../../../shared/UIElements/LoadingSpinner/LoadingSpinner";
import useForm from "../../../shared/Hooks/form-hook";
import useHttpClient from "../../../shared/Hooks/http-hook";

import "./NewPlace.css";
import ImageUpload from "../../../shared/FormElement/ImageUpload/ImageUpload";

const NewPlace = () => {
  const { token } = useContext(AuthContext);
  const [isLoading, error, sendRequest, clearError] = useHttpClient();
  const [formState, inputHandler] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
      address: {
        value: "",
        isValid: false,
      },
      image: {
        value: null,
        isValid: false,
      },
    },
    false
  );

  //returns a history object
  const history = useHistory();

  const placeSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", formState.inputs.title.value);
      formData.append("description", formState.inputs.description.value);
      formData.append("address", formState.inputs.address.value);
      formData.append("image", formState.inputs.image.value);

      await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/places`, "POST", formData, {
        Authorization: `Bearer ${token}`,
      });

      //push() add the page to the stack, allowing to go back; replace just replaces current page by a new one
      history.push("/");
    } catch (error) {}
  };

  return (
    <Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <form className="place-form" onSubmit={placeSubmitHandler}>
        {isLoading && <LoadingSpinner asOverlay />}
        <Input
          id="title"
          element="input"
          type="text"
          label="Title"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a title."
          onInput={inputHandler}
        />
        <Input
          id="description"
          element="textarea"
          type="text"
          label="Description"
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText="Please enter a valid description. At least 5 characters."
          onInput={inputHandler}
        />
        <Input
          id="address"
          element="input"
          type="text"
          label="Address"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid address."
          onInput={inputHandler}
        />
        <ImageUpload
          id="image"
          onInput={inputHandler}
          errorText="Please provide an image."
        />
        <Button type="submit" disabled={!formState.isValid}>
          ADD PLACE
        </Button>
      </form>
    </Fragment>
  );
};

export default NewPlace;
