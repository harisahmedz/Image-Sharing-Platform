import React, { useEffect, useState } from 'react';

import UsersList from '../components/UsersList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';

const Users = () => {
  const [loadedUser, setLoadedUser] = useState();
  const {isLoading, error, sendRequest, clearError} = useHttpClient();
  useEffect(()=>{
      console.log(process.env.REACT_APP_BACKEND_URL)
      const fetchUsers= async()=>{
        try{
          const responseData = await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/api/users/`);
          setLoadedUser(responseData.users);
        }catch(err){}
    };

    fetchUsers();
  },[sendRequest]);

  return (
    <>
      <ErrorModal error={error} onClear={clearError}/>
      {
        isLoading && (
          <div className='center'>
            <LoadingSpinner asOverlay/>
          </div>
        )
      }
      {!isLoading && loadedUser && <UsersList items={loadedUser} />}
    </>
  );
};

export default Users;
