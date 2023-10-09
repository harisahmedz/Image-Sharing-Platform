import {useCallback, useRef, useState, useEffect} from 'react';

export const useHttpClient = ()=>{
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();

    const activeHttpRequest = useRef([]);

    const sendRequest=useCallback( async (url, method="GET", body=null, headers={})=>{
        setIsLoading(true);
        const httpAbortCtrll = new AbortController();
        activeHttpRequest.current.push(httpAbortCtrll);

        try{
            const response = await fetch(url,{
                method,
                body,
                headers,
                signal:httpAbortCtrll.signal
            })
            const responseData = await response.json();
            activeHttpRequest.current =activeHttpRequest.current.filter(reqCtrl => reqCtrl !==httpAbortCtrll)
            if(!response.ok){
              throw new Error(responseData.message || 'Wrong');
            }
            setIsLoading(false);
            return responseData;

        }catch(err){
            setError(err.message || 'Something Went wrong');
            setIsLoading(false);
            throw err;
        }
   

    },[])
    const clearError = ()=>{
        setError(null);
    }
    useEffect(()=>{
        return ()=>{
            activeHttpRequest.current.forEach(abortCtrl => abortCtrl.abort());

        }
    },[])
    
    return {
        isLoading,
        error,
        sendRequest,
        clearError,
    }
}