import React, { useEffect, useState, Fragment } from "react";

import UsersList from "../components/UsersList/UsersList";
import ErrorModal from "../../shared/UIElements/ErrorModal/ErrorModal";
import LoadingSpinner from "../../shared/UIElements/LoadingSpinner/LoadingSpinner";
import useHttpClient from "../../shared/Hooks/http-hook";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, error, sendRequest, clearError] = useHttpClient();

  // it is not good practice to pass an async function ns useEffect because useEffect do not wants a function returning
  //a promise; to go around this issue, we create a inner function in the function passes as useEffect arg
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/users`
        );
        setUsers(responseData.users);
      } catch (error) {}
    };
    fetchUsers();
  }, [sendRequest]); //only runs once, when component is rendered and not when it re-renders

  return (
    <Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && users && <UsersList users={users} />}
    </Fragment>
  );
};

export default Users;
