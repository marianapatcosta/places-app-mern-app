import { useCallback, useReducer } from "react";

const formReducer = (state, action) => {
  switch (action.type) {
    case "INPUT_CHANGE":
      let formIsValid = true;
      // this for loop iterates through the inputs object keys ad evaluates if any of the input is invalid, to have the
      //valid value for all the form
      for (const inputId in state.inputs) {
        if (!state.inputs[inputId]) {
          continue;
        }
        if (inputId === action.inputId) {
          formIsValid = formIsValid && action.isValid;
        } else {
          formIsValid = formIsValid && state.inputs[inputId].isValid;
        }
      }
      return {
        ...state,
        inputs: {
          ...state.inputs,
          [action.inputId]: { value: action.value, isValid: action.isValid },
        },
        isValid: formIsValid,
      };
    case "SET_DATA":
      return {
        inputs: action.inputs,
        isValid: action.formIsValid,
      };
    default:
      return state;
  }
};

const useForm = (initialInputs, initialFormValidity) => {
  //useReducer will handle the global state of the form
  const [formState, dispatch] = useReducer(formReducer, {
    inputs: initialInputs,
    isValid: initialFormValidity,
  });

  /* If in inputHandler we change the state of the component, all the component will be recreated/re-rendered, is a
    new object even if it has the same logic; as in Input component we declared a dependency on this function in useEffect,
     the effect will run again, trigger inputHandler, and so on leading to an infinite loop.
     useCallback is useful: it takes a function and a dependency array as arguments and if the component re-renders, this 
     function will be stored by React and will be reused, no new inputHandler is created, the stored one is reused
     and there is no loop */
  const inputHandler = useCallback((id, value, isValid) => {
    dispatch({
      type: "INPUT_CHANGE",
      value,
      isValid,
      inputId: id,
    });
  }, []); //dispatch is a dependency of useCallback but react ensures that dispatch never changes, so this dependency can be omitted

  const setFormData = useCallback((inputData, formValidity) => {
    dispatch({
      type: "SET_DATA",
      inputs: inputData,
      formIsValid: formValidity,
    });
  }, []);

  return [formState, inputHandler, setFormData];
};

export default useForm;
