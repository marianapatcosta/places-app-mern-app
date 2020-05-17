import { useState, useEffect, useCallback } from "react";
let logoutTimer;

const useAuth = () => {
  const [token, setToken] = useState(false);
  const [tokenExpirationDate, setTokenExpirationDate] = useState();
  const [userId, setUserId] = useState(null);

  //wrap with useCallback to avoid recreation and infinite loops
  const login = useCallback((userId, token, expirationDate) => {
    setToken(token);
    setUserId(userId);
    //generates a data based on current date + 1h
    const tokenExpiresIn =
      expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
    setTokenExpirationDate(tokenExpiresIn);
    localStorage.setItem(
      "userData",
      JSON.stringify({
        userId,
        token,
        expiration: tokenExpiresIn.toISOString(),
      })
    );
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTokenExpirationDate(null);
    setUserId(null);
    localStorage.removeItem("userData");
  }, []);

  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainingTime =
        tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      // we we have no token/expireIn user logged out and token was set to null, so there is no need to logout() later
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate]);
  //if token changes, if user login or logout, we want to work with timer; logout is a dependency too but as it is
  //wrapped in useCallback is is never recreated

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("userData"));
    if (
      storedData &&
      storedData.token &&
      new Date(storedData.expiration) > new Date()
    ) {
      login(
        storedData.userId,
        storedData.token,
        new Date(storedData.expiration)
      );
    }
  }, [login]); //only runs once, when component mounts

  return [token, login, logout, userId];
};

export default useAuth;
