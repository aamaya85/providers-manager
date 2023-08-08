import React, { useState, useEffect, useRef } from 'react';
import sessionStorageUtil from './../utils/sessionStorageUtil'
import { AuthService } from '../services/AuthService';

// Services
import ProvidersList from './ProvidersList';
import ProviderForm from './ProviderForm';

// Primereact components
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

const Dashboard = () => {
    
    const toast = useRef(null);
    const [mainView, setMainView] = useState(null);

    useEffect(() => {
        const userRole = sessionStorageUtil.getSessionData('userRole');
        const userId = sessionStorageUtil.getSessionData('userID');        
        if (!userId || (userRole !== 'admin' && userRole !== 'provider')) {
            window.location.href = "/login"
        }
        if (userRole === 'admin') setMainView(<ProvidersList />)
        if (userRole === 'provider') setMainView(<ProviderForm userID={userId} />)
    }, []);

    const logout = () => {
        AuthService.logoutUser().then(response => {
            console.log(response)
            sessionStorageUtil.clearSessionData()
            window.location.href = "./login"
        }).catch((error) => {
            showError("Logout error")
        })
    }
    
    const showError = (message) => {
        toast.current.show({severity:'error', summary: 'Error', detail: message, life: 3000});
    }

    return (
        <div>
            <Toast ref={toast} />
            <Button label="Logout" icon="pi pi-upload" className="p-button-help" onClick={logout} />
            { mainView }
            
        </div>
    );
};

export default Dashboard;
