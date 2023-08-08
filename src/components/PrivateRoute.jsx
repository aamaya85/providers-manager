import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ userAuthenticated, component }) => {
    const auth = (userAuthenticated)
    return auth ? component : <Navigate to="/login" />;
}

export default PrivateRoute

