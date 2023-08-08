import React, { useState, useEffect, useRef } from 'react';

// Services
import { Password } from 'primereact/password';

// Primereact Components
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';

const PasswordDialog = () => {

    const [visible, setVisible] = useState(false);
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword1: '',
        newPassword2: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [matchPass, setMatchPass] = useState(true);

    const submitPassword = () => {
        setSubmitted(true);

        if (passwords.newPassword1 !== passwords.newPassword2) {
            setMatchPass(false);
        } else {
            // Aquí puedes realizar la lógica de actualización de contraseña
            // utilizando la contraseña antigua (passwords.oldPassword) y la nueva contraseña (passwords.newPassword1)
            // ...

            // Después de la actualización, puedes cerrar el diálogo
            setVisible(false);
        }
    };

    const onSetPasswords = (e, name) => {
        setSubmitted(false);
        const val = e.target.value || '';
        setPasswords((prevPasswords) => ({ ...prevPasswords, [name]: val }));
    };

    return (
        <Dialog header="Change password" visible={visible} style={{ width: '25vw' }} onHide={() => setVisible(false)}>
            <Divider align="left"></Divider>
            <div className="card p-0">
                <form autoComplete="off">
                    <div className="flex flex-column card-container green-container">
                        <div className="flex align-items-center justify-content-center h-3rem border-round m-1">
                            <label className="font-bold">Current Password</label>
                            <Password toggleMask={true} placeholder="Current Password" value={passwords.oldPassword} onChange={(e) => onSetPasswords(e, 'oldPassword')} feedback={false} />
                        </div>
                        <div className="flex align-items-center justify-content-center h-3rem border-round m-1">
                            <label className="font-bold">New Password</label>
                            <Password toggleMask={true} placeholder="New password" value={passwords.newPassword1} onChange={(e) => onSetPasswords(e, 'newPassword1')} feedback={false}
                                className={classNames({ 'p-invalid': submitted && !matchPass })} />
                            {submitted && !matchPass && <small className="p-error">Password doesn't match.</small>}
                        </div>
                        <div className="flex align-items-center justify-content-center h-3rem border-round m-1">
                            <label className="font-bold">New Password</label>
                            
                            <Password toggleMask={true} placeholder="Repeat password" value={passwords.newPassword2} onChange={(e) => onSetPasswords(e, 'newPassword2')} feedback={false}
                                className={classNames({ 'p-invalid': submitted && !matchPass })} />
                            {submitted && !matchPass && <small className="p-error">Password doesn't match.</small>}
                        </div>
                        <div className="flex align-items-center justify-content-center h-3rem border-round mt-5">
                            <Button type="button" label="Change" severity="danger" rounded onClick={() => submitPassword()} />
                        </div>
                    </div>
                </form>
            </div>
        </Dialog>
    )
}

export default PasswordDialog

