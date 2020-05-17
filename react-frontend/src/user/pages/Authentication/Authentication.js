import React, { useState, useContext, Fragment } from "react";

import useForm from "../../../shared/Hooks/form-hook";
import useHttpClient from "../../../shared/Hooks/http-hook";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../../shared/util/validators";
import Button from "../../../shared/FormElement/Button/Button";
import Card from "../../../shared/UIElements/Card/Card";
import ErrorModal from "../../../shared/UIElements/ErrorModal/ErrorModal";
import ImageUpload from "../../../shared/FormElement/ImageUpload/ImageUpload";
import Input from "../../../shared/FormElement/Input/Input";
import LoadingSpinner from "../../../shared/UIElements/LoadingSpinner/LoadingSpinner";
import { AuthContext } from "../../../shared/context/auth-context";
import "./Authentication.css";

const Authentication = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { login } = useContext(AuthContext);
  const [isLoading, error, sendRequest, clearError] = useHttpClient();

  const [formState, inputHandler, setFormData] = useForm(
    {
      email: {
        value: "",
        isValid: false,
      },
      password: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  const switchModeHandler = () => {
    /*setFormData when we are not in login Mode; but this handler runs before we switch the mode,
    so if we are in signup mode this will update to login mode, so we need to drop name field
    because we are coming from signup mode and changing to login*/
    if (!isLoginMode) {
      delete formState.inputs.name;
      delete formState.inputs.image;
      setFormData(
        formState.inputs,
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      //here we are in login changing to signup
      setFormData(
        {
          ...formState.inputs,
          name: {
            value: "",
            isValid: false,
          },
          image: {
            value: null,
            isValid: false,
          },
        },
        false // because form comes from login mode, where this field does not exist
      );
    }

    /* We pass a function inside the state setter because this state depends on the previous state */
    setIsLoginMode((prevMode) => !prevMode);
  };

  const authenticationSubmitHandler = async (event) => {
    event.preventDefault();

    if (isLoginMode) {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/users/login`,
          "POST",
          JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value,
          }),
          {
            "Content-Type": "application/json",
          }
        );
        login(responseData.userId, responseData.token);
      } catch (error) {
        //there is no need to write code here because useHttp will take care of it; this catch will only catch the error
        //thrown in the hook; we could also do not use try/catch and use a then() block after sendRequest instead
      }
    } else {
      try {
        //to send images, we have to use other format than json, we use formData
        const formData = new FormData();
        formData.append("email", formState.inputs.email.value);
        formData.append("name", formState.inputs.name.value);
        formData.append("password", formState.inputs.password.value);
        formData.append("image", formState.inputs.image.value);

        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/users/signup`,
          "POST",
          formData //formData also sets header, we do not need to set them manually
        );
        login(responseData.userId, responseData.token);
      } catch (error) {}
    }
  };

  return (
    <Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Card className="authentication">
        {isLoading && <LoadingSpinner asOverlay={true} />}
        <h2>Login Required</h2>
        <hr />
        <form className="place-form" onSubmit={authenticationSubmitHandler}>
          {!isLoginMode && (
            <Input
              id="name"
              element="input"
              type="text"
              label="Your name"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="Please enter a name."
              onInput={inputHandler}
            />
          )}
          {!isLoginMode && (
            <ImageUpload
              id="image"
              center
              onInput={inputHandler}
              errorText="Please provide an image."
            />
          )}
          <Input
            id="email"
            element="input"
            type="email"
            label="E-mail"
            validators={[VALIDATOR_EMAIL()]}
            errorText="Please enter a valid e-mail address."
            onInput={inputHandler}
          />
          <Input
            id="password"
            element="input"
            type="password"
            label="Password"
            validators={[VALIDATOR_MINLENGTH(6)]}
            errorText="Please enter a valid password. At least 6 characters."
            onInput={inputHandler}
          />
          <Button type="submit" disabled={!formState.isValid}>
            {isLoginMode ? "LOGIN" : "SIGNUP"}
          </Button>
        </form>
        <Button inverse onClick={switchModeHandler}>
          {isLoginMode ? "SWITCH TO SIGNUP" : "SWITCH TO LOGIN"}
        </Button>
      </Card>
    </Fragment>
  );
};

export default Authentication;
