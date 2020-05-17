import React, { useEffect, useReducer } from "react";

import { validate } from "../../util/validators";
import "./Input.css";

const inputReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE":
      return {
        ...state,
        value: action.value,
        isValid: validate(action.value, action.validators),
      };
    case "TOUCH":
      return {
        ...state,
        isTouched: true,
      };
    default:
      return state;
  }
};

const Input = ({
  id,
  element,
  label,
  type,
  initialValue,
  initialIsValid,
  placeholder,
  rows,
  errorText,
  validators,
  onInput
}) => {
  /* const [input, setInput] = useState('');
  let isValid = input.length > 0 */

  /* useReducer takes as argument a function that can dispatch an action and the current state; useReducer takes the new 
state and re-renders everything; returns an array with 2 elements the current state and dispatch function*/
  const [inputState, dispatch] = useReducer(inputReducer, {
    value: initialValue || "",
    isValid: initialIsValid || false,
    isTouched: false
  });

  const {value, isValid} = inputState;

  useEffect(() => {
    onInput(id, value, isValid)
  }, [id, onInput, value, isValid]);

  const changeHandler = (event) => {
    //setInput(event.target.value )
    //dispatch takes an action as argument
    dispatch({
      type: "CHANGE",
      value: event.target.value,
      validators: validators,
    });
  };

  const touchHandler = () => {
    dispatch({
      type: "TOUCH",
    });
  };

  const formElement =
    element === "input" ? (
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={inputState.value}
        onChange={changeHandler}
        onBlur={touchHandler}
      />
    ) : (
      <textarea
        id={id}
        rows={rows || 3}
        value={inputState.value}
        onChange={changeHandler}
        onBlur={touchHandler}
      ></textarea>
    );

  return (
    <div
      className={`form-control ${
        !inputState.isValid && inputState.isTouched && "form-control--invalid"
      }`}
    >
      <label htmlFor={id}>{label}</label>
      {formElement}     
      {!inputState.isValid && inputState.isTouched && <p>{errorText}</p>}
    </div>
  );
};

export default Input;
