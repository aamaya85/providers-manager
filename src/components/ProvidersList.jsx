import React, { useState, useEffect, useRef } from 'react';
import sessionStorageUtil from '../utils/sessionStorageUtil'

// Services
import { ProviderService } from '../services/ProviderService';
import { ZipCodesService } from '../services/ZipCodesService';

// Local components
import PasswordDialog from './PasswordDialog';

// Primereact Components
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';
import { Chip } from 'primereact/chip';
import { Divider } from 'primereact/divider';
import { Password } from 'primereact/password';
import { Checkbox } from 'primereact/checkbox';
import { TabView, TabPanel } from 'primereact/tabview';



const ProvidersList = () => {

    const [userIsAdmin, setUserIsAdmin] = useState(false)
    const [newUserIsProvider, setNewUserIsProvider] = useState(false)

    const emptyProvider = {
        id: null,
        username: "",
        password: "",
        name: "",
        lastname: "",
        therapy_type: null,
        esn: false,
        ess: false,
        current_hs: 0,
        available_hs: 0,
        zip_codes: [],
        urgency: null
    };

    const therapyTypes = [
        { name: "PT", code: "PT" },
        { name: "PTA", code: "PTA" },
        { name: "OT", code: "OT" },
        { name: "OTA", code: "OTA" },
        { name: "ST", code: "ST" },
        { name: "STA", code: "STA" },
        { name: "ITDS", code: "ITDS" }
    ]

    const boolValues = [
        { name: "YES", code: true },
        { name: "NO", code: false }
    ]

    const urgencies = [
        { name: "LOW", code: "LOW" },
        { name: "MEDIUM", code: "MEDIUM" },
        { name: "HIGH", code: "HIGH" }
    ]

    const [providers, setProviders] = useState(null);
    const [users, setUsers] = useState(null);
    const [zipCodes, setZipCodes] = useState(null);
    const [providerDialog, setProviderDialog] = useState(false);
    const [deleteProviderDialog, setDeleteProviderDialog] = useState(false);
    const [ changePasswordDialog, setChangePasswordDialog ] = useState(false)
    const [provider, setProvider] = useState(emptyProvider);
    const [selectedProviders, setSelectedProviders] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);

    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        const buildProvidersData = (providers) => {
            ZipCodesService.getCodes().then((data) => {
                const zip_codes = [...data]
                setZipCodes(data)
                const _providers = providers.map((p) => {
                    p.esn = setOptionByCode(p.esn, boolValues)
                    p.ess = setOptionByCode(p.ess, boolValues)
                    p.therapy_type = setOptionByCode(p.therapy_type, therapyTypes)
                    p.urgency = setOptionByCode(p.urgency, urgencies)
                    p.zip_codes = p.zip_codes.map((z) => setOptionByCode(z, zip_codes))
                    return p
                })
                setProviders(_providers)
            })
        }
        ProviderService.getProviders().then((response) => {
            ProviderService.getUsers().then((responseUsers) => {
                setUsers(responseUsers.data.users)
                buildProvidersData(response.data.provider)
                setUserIsAdmin(sessionStorageUtil.getSessionData('userRole') === 'admin')
            })
        }).catch((error) => {
            window.location.href = "./login"
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setOptionByCode = (code, options) => {
        return options.find(item => item.code === code);
    }

    const openNew = () => {
        setNewUserIsProvider(false)
        setProvider(emptyProvider)
        setSubmitted(false)
        setProviderDialog(true)
    };


    const hideDialog = () => {
        setSubmitted(false);
        setProviderDialog(false);
    };

    const hideDeleteProviderDialog = () => {
        setProvider(emptyProvider)
        setDeleteProviderDialog(false);
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[@#$!*&+\-_<>?%])[a-zA-Z0-9@#$!*&+\-_<>?%]+$/
        return regex.test(password)
    }

    const saveProvider = () => {

        setSubmitted(true);

        if (newUserIsProvider && (!provider.ess || !provider.esn)) {
            return false
        }

        if (!validatePassword(provider.password)) {
            toast.current.show({ severity: 'error', summary: 'Invalid password', detail: "Must include a letter, number and symbol (@#$!*&+-_<>?%)", life: 3000 });
            return false
        }

        if (provider.name.trim()) {
            let _providers = [...providers];
            let _provider = { ...provider };

            let _users = [...users];

            if (provider.user_guid) {
                const index = findIndexById(provider.user_guid);
                ProviderService.updateUserProvider(buildUserDTO(_provider))
                    .then((response) => {
                        _providers[index] = _provider
                        setProviders(_providers);
                        setProviderDialog(false);
                        setProvider(emptyProvider);
                        toast.current.show({ severity: 'success', summary: 'Successful', detail: response.message, life: 3000 });
                    }).catch((error) => {
                        toast.current.show({ severity: 'error', summary: 'Failed', detail: error.error_code, life: 3000 });
                    })
            } else {
                ProviderService.createProvider(buildUserDTO(_provider))
                    .then((response) => {
                        const _p = response.data.user
                        if (_p.role === "provider") {
                            _p.esn = setOptionByCode(_p.esn, boolValues)
                            _p.ess = setOptionByCode(_p.ess, boolValues)
                            _p.therapy_type = setOptionByCode(_p.therapy_type, therapyTypes)
                            _p.urgency = setOptionByCode(_p.urgency, urgencies)
                            _p.zip_codes = _p.zip_codes.map((z) => setOptionByCode(z, zipCodes))
                            _providers.push(_p);
                            setProviders(_providers);
                        }

                        if (_p.role === "admin") {
                            _users.push(_p);
                            setUsers(_users);
                        }
                        
                        setProviderDialog(false);
                        setProvider(emptyProvider);
                        toast.current.show({ severity: 'success', summary: 'Successful', detail: response.message, life: 3000 });
                    }).catch((error) => {
                        console.log(error)
                        toast.current.show({ severity: 'error', summary: 'Failed', detail: error.response.data.error_code, life: 3000 });
                    })
            }
        }
    };

    const buildUserDTO = (user) => {
        const dto = {
            user_guid: user.user_guid,
            username: user.username,
            name: user.name,
            password: user.password,
            lastname: user.lastname,
            role: "admin"
        }
        if (user.role === 'provider') {
            dto.role = "provider"
            dto.provider = {
                esn: provider.esn.code,
                ess: provider.ess.code,
                therapy_type: provider.therapy_type ? provider.therapy_type.code : null,
                urgency: provider.urgency ? provider.urgency.code : null,
                current_hs: provider.current_hs,
                available_hs: provider.available_hs,
                zip_codes: provider.zip_codes.map((z) => z.code)
            }
        }
        return dto
    }

    const editProvider = (provider) => {
        setProvider({ ...provider });
        setProviderDialog(true);
    };


    const deleteProvider = () => {

        ProviderService.deleteProvider(provider.user_guid)
            .then((response) => {
                const updatedProviders = providers.filter((p) => p.user_guid !== provider.user_guid);
                setProviders(updatedProviders);
                setDeleteProviderDialog(false);
                setProvider(emptyProvider);
                toast.current.show({ severity: 'success', summary: 'Successful', detail: response.data.message, life: 3000 });
            }).catch((error) => {
                setDeleteProviderDialog(false);
                setProvider(emptyProvider);
                toast.current.show({ severity: 'error', summary: 'Failed', detail: error.error_code, life: 3000 });
            })

    };

    const findIndexById = (id) => {
        let index = -1;

        for (let i = 0; i < providers.length; i++) {
            if (providers[i].user_guid === id) {
                index = i;
                break;
            }
        }

        return index;
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteProvider = (provider) => {
        setProvider({ ...provider });
        setDeleteProviderDialog(true);
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _provider = { ...provider };
        _provider[`${name}`] = val;
        setProvider(_provider);
    };

    const onZipCodesChange = (selection) => {
        let _provider = { ...provider };
        _provider["zip_codes"] = selection
        setProvider(_provider);

    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />
                {/* <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedProviders || !selectedProviders.length} /> */}
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <div>
                <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
            </div>
        )
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <div className="align-content-center">
                <Button icon="pi pi-pencil" rounded outlined className="mr-1" onClick={() => editProvider(rowData)} />
                <Button icon="pi pi-trash" rounded outlined className="mr-1" severity="danger" onClick={() => confirmDeleteProvider(rowData)} />
                {/* <Button icon="pi pi-key" rounded outlined className="mr-1" severity="success" onClick={setChangePasswordDialog} /> */}
                </div>
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Manage data</h4>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </span>
        </div>
    );
    const providerDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveProvider} />
        </React.Fragment>
    );
    const deleteProviderDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteProviderDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteProvider} />
        </React.Fragment>
    );

    const setZipCodesColumnView = (rowData) => {
        if (rowData) {
            return (rowData.zip_codes).map((zc, idx) => <Chip key={idx} label={zc.name}></Chip>)
        }

    }

    return (
        <div>
            <Toast ref={toast} />
            {userIsAdmin && providers && <div className="card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                <TabView>
                    <TabPanel header="Providers">
                        <DataTable
                            dataKey="user_guid"
                            ref={dt}
                            value={providers}
                            selection={selectedProviders}
                            onSelectionChange={(e) => setSelectedProviders(e.value)}
                            sortField="date_created"
                            sortOrder={-1}
                            // paginator rows={40} rowsPerPageOptions={[5, 10, 25]}
                            // paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            // currentPageReportTemplate="Showing {first} to {last} of {totalRecords} providers"
                            globalFilter={globalFilter}
                            filterDisplay="menu"
                            scrollable
                            scrollHeight='450px'
                            showGridlines
                            header={header}>

                            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                            <Column filter field="name" header="Name" sortable style={{ minWidth: '9rem' }}></Column>
                            <Column filter field="lastname" header="Lastname" sortable style={{ minWidth: '9rem' }}></Column>
                            <Column filter field="username" header="Username" sortable style={{ minWidth: '9rem' }}></Column>
                            <Column filter field="therapy_type.name" header="Therapy type" sortable style={{ minWidth: '7rem' }}></Column>
                            <Column filter field="esn.name" header="ESN" sortable style={{ minWidth: '3rem' }}></Column>
                            <Column filter field="ess.name" header="ESS" sortable style={{ minWidth: '3rem' }}></Column>
                            <Column filter field="current_hs" header="Current hs. p/week" sortable style={{ minWidth: '9rem' }}></Column>
                            <Column filter field="available_hs" header="Available hs. p/week" sortable style={{ minWidth: '9rem' }}></Column>
                            <Column filter
                                field={setZipCodesColumnView}
                                header="ZIP Codes" sortable style={{ minWidth: '11rem' }}>
                            </Column>
                            <Column filter field="urgency.name" header="Urgency" sortable style={{ minWidth: '6rem' }}></Column>
                            <Column filter field="date_created" header="Date Created" sortable style={{ minWidth: '8rem' }}></Column>
                            <Column filter field="last_user_modify" header="Last user modify" sortable style={{ minWidth: '8rem' }}></Column>
                            <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '9rem' }}></Column>
                        </DataTable>
                    </TabPanel>
                    <TabPanel header="Users">
                        <DataTable
                            dataKey="guid"
                            ref={dt}
                            value={users}
                            sortField="date_created"
                            sortOrder={-1}
                            globalFilter={globalFilter}
                            filterDisplay="menu"
                            scrollable
                            scrollHeight='450px'
                            showGridlines
                            header={header}>
                            <Column filter field="name" header="Name" sortable style={{ minWidth: '9rem' }}></Column>
                            <Column filter field="lastname" header="Lastname" sortable style={{ minWidth: '9rem' }}></Column>
                            <Column filter field="username" header="Username" sortable style={{ minWidth: '9rem' }}></Column>
                            <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '9rem' }}></Column>
                        </DataTable>
                    </TabPanel>
                </TabView>

                    </div>}

                    <Dialog visible={providerDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="User Details" modal className="p-fluid" footer={providerDialogFooter} onHide={hideDialog}>
                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="name" className="font-bold">
                                    Name
                                </label>
                                <InputText id="name" value={provider.name} onChange={(e) => onInputChange(e, 'name')} required autoFocus className={classNames({ 'p-invalid': submitted && !provider.name })} />
                                {submitted && !provider.name && <small className="p-error">Name is required.</small>}
                            </div>
                            <div className="field col">
                                <label htmlFor="lastname" className="font-bold">
                                    Lastname
                                </label>
                                <InputText id="lastname" value={provider.lastname} onChange={(e) => onInputChange(e, 'lastname')} required className={classNames({ 'p-invalid': submitted && !provider.lastname })} />
                                {submitted && !provider.lastname && <small className="p-error">Lastname is required.</small>}
                            </div>
                        </div>
                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="username" className="font-bold">
                                    Username
                                </label>
                                <InputText value={provider.username} onChange={(e) => onInputChange(e, 'username')} required className={classNames({ 'p-invalid': submitted && !provider.username })} />
                                {submitted && !provider.username && <small className="p-error">Username is required.</small>}
                            </div>
                            <div className="field col">
                                <label htmlFor="new-password" className="font-bold">
                                    Password
                                </label>
                                <InputText value={provider.password} onChange={(e) => onInputChange(e, 'password')} required className={classNames({ 'p-invalid': submitted && !provider.password })} />
                                {submitted && !provider.password && <small className="p-error">Password is required.</small>}
                            </div>
                        </div>
                        {/* <div className="field col">
                    <label htmlFor="user_role" className="font-bold">
                        User Role
                    </label>
                    <Dropdown id="user_role" value={role} onChange={(e) => setRole(e.target.value)} options={["Admin", "Provider"]} optionLabel="role"
                        placeholder="Select..." className="w-full md:w-14rem" />
                </div> */}

                        <div className="formgrid grid gap-1">
                            <div className="field col">
                                <Checkbox inputId="newUserIsProvider" onChange={e => setNewUserIsProvider(e.checked)} checked={newUserIsProvider}></Checkbox>
                                <label htmlFor="newUserIsProvider" className="ml-2">New Provider</label>
                            </div>
                        </div>
                        {newUserIsProvider && <div><Divider align="left">
                            <div className="inline-flex align-items-center">
                                <b>Provider data</b>
                            </div>
                        </Divider>
                            <div className="formgrid grid">
                                <div className="field col">
                                    <label htmlFor="esn" className="font-bold">
                                        ESN
                                    </label>
                                    <Dropdown id="esn" value={provider.esn} onChange={(e) => onInputChange(e, "esn")} options={boolValues} optionLabel="name"
                                        placeholder="Select..." required={newUserIsProvider} autoFocus className={classNames({ 'p-invalid': submitted && newUserIsProvider && !provider.esn })} />
                                    {submitted && newUserIsProvider && !provider.esn && <small className="p-error">* Required.</small>}
                                </div>
                                <div className="field col">
                                    <label htmlFor="esn" className="font-bold">
                                        ESS
                                    </label>
                                    <Dropdown id="ess" value={provider.ess} onChange={(e) => onInputChange(e, "ess")} options={boolValues} optionLabel="name"
                                        placeholder="Select..." required={newUserIsProvider} className={classNames({ 'p-invalid': submitted && newUserIsProvider && !provider.ess })} />
                                    {submitted && newUserIsProvider && !provider.ess && <small className="p-error">* Required.</small>}
                                </div>
                            </div>
                            <div className="formgrid grid">
                                <div className="field col">
                                    <label htmlFor="therapy_type" className="font-bold">
                                        Therapy type
                                    </label>
                                    <Dropdown id="therapy_type" value={provider.therapy_type} onChange={(e) => onInputChange(e, "therapy_type")} options={therapyTypes} optionLabel="name"
                                        placeholder="Select..." className="w-full md:w-14rem" />
                                </div>
                                <div className="field col">
                                    <label htmlFor="urgency" className="font-bold">
                                        Urgency
                                    </label>
                                    <Dropdown id="urgency" value={provider.urgency} onChange={(e) => onInputChange(e, "urgency")} options={urgencies} optionLabel="name"
                                        placeholder="Select..." className="w-full md:w-14rem" />
                                </div>
                            </div>

                            <div className="formgrid grid">
                                <div className="field col">
                                    <label htmlFor="current_hs" className="font-bold">
                                        Current HS (p/week)
                                    </label>
                                    <InputNumber id="current_hs" min={0} value={provider.current_hs} onValueChange={(e) => onInputChange(e, 'current_hs')} />
                                </div>
                                <div className="field col">
                                    <label htmlFor="available_hs" className="font-bold">
                                        Available HS (p/week)
                                    </label>
                                    <InputNumber id="available_hs" min={0} value={provider.available_hs} onValueChange={(e) => onInputChange(e, 'available_hs')} />
                                </div>
                            </div>

                            <div className="formgrid grid">
                                <div className="field col">
                                    <label htmlFor="zip_codes" className="font-bold">
                                        ZIP Codes
                                    </label>
                                    <MultiSelect id="zip_codes" value={provider.zip_codes} onChange={(e) => onZipCodesChange(e.value)} options={zipCodes} optionLabel="name" placeholder="Select..." maxSelectedLabels={1} className="w-full md:w-20rem" />
                                </div>
                            </div>
                        </div>}
                    </Dialog>

                    <Dialog visible={deleteProviderDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteProviderDialogFooter} onHide={hideDeleteProviderDialog}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {provider && (
                                <span>
                                    Delete provider <b>{provider.name} {provider.lastname}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <PasswordDialog visible={changePasswordDialog}></PasswordDialog>

            </div>
    );
}

export default ProvidersList