import { createContext } from "react";

//context is initialized with the object passed as argument
export const AuthContext = createContext({
  isLoggedIn: false,
  userId: null,
  token: null,
  login: () => {},
  logout: () => {},
});
