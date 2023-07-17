import React, {useEffect, useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {checkToken} from '../slices/authSlice'

const RequireAuth = (props) => {

    const dispatch = useDispatch()

    useEffect(() => {
      
        dispatch(checkToken())
      
    }, [dispatch])    

    useEffect(() => {
        const token = localStorage.getItem('token');
      
        if (!token && window.location.pathname !== '/login' && window.location.pathname !== '/registration') {
          console.log('no token');
          window.location.href = '/login';
        }
      }, []);
      
    
  
    return props.children

}

export default RequireAuth