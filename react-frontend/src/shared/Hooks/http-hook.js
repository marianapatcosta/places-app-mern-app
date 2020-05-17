import { useState, useCallback, useRef, useEffect } from "react";

const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  //here useRef will be a piece of data that will not be initialized when the function runs again
  //thus we are storing data across re-render cycles
  const activeHttpRequests = useRef([]);

  //useCallback stores function, so it is not re-render every time the component using this hook is rerendered
  const sendRequest = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      setIsLoading(true);

      //we are pushing a controller to our current (useRef prop) reference
      const httAbortController = new AbortController();
      activeHttpRequests.current.push(httAbortController);

      try {
        const response = await fetch(url, {
          method,
          body,
          headers,
          signal: httAbortController.signal, //links abortcontroller to this req, so it can be used to cancel the req
        });

        const responseData = await response.json();

        activeHttpRequests.current = activeHttpRequests.current.filter(
          (reqCtrl) => reqCtrl !== httAbortController
        );
        // fetch api does not treat 400's and 500's status as error, so we check is response.ok exists,
        //which let us know that is a 200's
        if (!response.ok) {
          //if an error is thrown catch block runs
          throw new Error(responseData.message);
        }

        return responseData;
      } catch (error) {
        setError(error.message || "Something went wrong. Please try again.");
        //throw the error so the component using this hook knows something went wrong
        throw error;
      } finally {
        setIsLoading(false);
      }
    }, []
  );

  const clearError = () => setError(null);

  useEffect(() => {
    //clean up function that runs before useEffect runs again, or before the component that calls
    //useEffect unmounts; in this case, it ensures that we'll not continue with a req that is on his way
    //out if we then switch from the component triggering the req to another component
    return () => {
      activeHttpRequests.current.forEach((abortController) =>
        abortController.abort()
      );
    };
  }, []);

  return [isLoading, error, sendRequest, clearError];
};

export default useHttpClient;
