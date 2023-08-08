import React, { useState, useRef } from 'react';
import sessionStorageUtil from '../utils/sessionStorageUtil'
import { AuthService } from '../services/AuthService';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import { Toast } from 'primereact/toast';

import '../styles/LoginScreen.css';

const Login = () => {

    const toast = useRef(null);

    // Form
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleLogin = () => {
        setSubmitted(true);
        if (username && password){        
            AuthService.loginUser({ username, password })
                .then(response => {
                    if (response.success){
                        console.log(response)
                        sessionStorageUtil.saveSessionData("userID", response.data.user_id);
                        sessionStorageUtil.saveSessionData("userRole", response.data.user_role);
                        //window.location.href = "/providers"
                    } else {
                        showError(response.message)
                    }
                }).catch((error) =>{
                    showError(error.error_code)
                })
        }
    };

    const showError = (message) => {
        toast.current.show({severity:'error', summary: 'Error', detail: message, life: 3000});
    }

    return (
        
        <div className="login-screen">
            <Toast ref={toast} />
                <h2>Login</h2>
                <div className="formgrid grid">
                    <div className="field">
                        <label htmlFor="name" className="font-bold">
                            Username
                        </label>
                        <InputText id="username" value={username} onChange={(e) => setUsername(e.target.value)} required className={classNames({ 'p-invalid': submitted && !username })} />
                        {submitted && !username && <small className="p-error">Username is required.</small>}
                    </div>
                    <div className="field">
                        <label htmlFor="password" classpassword="font-bold">
                            Password
                        </label>
                        <InputText id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={classNames({ 'p-invalid': submitted && !password })} />
                        {submitted && !password && <small className="p-error">Password is required.</small>}
                    </div>
                    <Button label="Login" onClick={handleLogin} />
                </div>
        </div>
    );
};

export default Login;
