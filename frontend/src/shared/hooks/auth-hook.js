import {useEffect, useCallback, useState} from 'react'


let logoutTime;
const useAuth = () => {
    const [token, setToken] = useState(false);
  const [userId, setUserId] = useState(false);
  const [tokenExpirationDate, setTokenExpirationDate] = useState();

  const login = useCallback((uid, token,expirationDate) => {
    setToken(token);
    setUserId(uid)
    const tokenExpirationDate = expirationDate || new Date(new Date().getTime()+1000 * 60 *60);
    setTokenExpirationDate(tokenExpirationDate)
    
    localStorage.setItem('userData',JSON.stringify({
      userId:uid,
       token:token,
       expiration: tokenExpirationDate.toISOString()
      }));
    
  }, []);




  const logout = useCallback(() => {
    setTokenExpirationDate(null)
    setToken(false);
    setUserId(null);
    localStorage.removeItem('userData')
  }, []);

  useEffect(()=>{
    if(token && tokenExpirationDate){
      const remainingTime = tokenExpirationDate.getTime() - new Date().getTime() 
      logoutTime= setTimeout(logout,remainingTime )
    }else{
      clearTimeout(logoutTime);
    }

  },[token, logout, tokenExpirationDate])
  useEffect(()=>{
    const storedData = JSON.parse(localStorage.getItem('userData'));
    if(storedData && storedData.token && new Date(storedData.expiration) > new Date()){
      login(storedData.userId, storedData.token, new Date(storedData.expiration))
    }

  },[login])
  return {
    token, login, logout, userId
  }
}

export default useAuth