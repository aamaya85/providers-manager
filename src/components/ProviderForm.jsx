import React, { useState, useEffect, useRef } from 'react';
import sessionStorageUtil from '../utils/sessionStorageUtil'

// Primereact Components
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { ScrollPanel } from 'primereact/scrollpanel';
import { InputNumber } from 'primereact/inputnumber';
import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';
import { Chips } from 'primereact/chips';
import { Divider } from 'primereact/divider';

// Services
import { ProviderService } from '../services/ProviderService';
import { ZipCodesService } from '../services/ZipCodesService';

const ProviderForm = ({ userID }) => {

    const toast = useRef(null);
    const [ userIsProvider, setUserIsProvider ] = useState(false)

    const emptyProvider = {
        id: null,
        username: "",
        name: "",
        lastname: "",
        therapy_type: null,
        esn: false,
        ess: false,
        current_hs: 0,
        available_hs: 0,
        zip_codes: [],
        urgency: {}
    };

    const [providerData, setProviderData] = useState(emptyProvider);
    const [zipCodes, setZipCodes] = useState(null);
    const [zipCodesSelected, setZipCodesSelected] = useState([]);
    
    const urgencies = [
        { name: "LOW", code: "LOW" },
        { name: "MEDIUM", code: "MEDIUM" },
        { name: "HIGH", code: "HIGH" }
    ]

    const buildProviderData = (providerData) => {
        ZipCodesService.getCodes().then((data) => {
            const zip_codes = [...data]
            let _zipCodesSelected = []
            setZipCodes(zip_codes)
            const _providerData = { ...providerData }
            _providerData.urgency = setOptionByCode(providerData.urgency, urgencies)
            _providerData.zip_codes = providerData.zip_codes.map((z) => {
                let zipCodeObject = setOptionByCode(z, zip_codes)
                _zipCodesSelected.push(zipCodeObject.name)
                return zipCodeObject
            })
            setZipCodesSelected(_zipCodesSelected);
            setProviderData(_providerData)
        })
    }

    
    useEffect(() => {
        ProviderService.getProvider(userID).then((response) => {
            buildProviderData(response.data.provider)
            setUserIsProvider(sessionStorageUtil.getSessionData('userRole') === 'provider')
        }).catch((error) => {
            window.location.href = "./login"
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    const setOptionByCode = (code, options) => {
        return options.find(item => item.code === code);
    }

    const onInputChange = (e, name) => {
        const val = e.value || 0;
        let _providerData = { ...providerData };
        _providerData[`${name}`] = val;
        setProviderData(_providerData);
    };

    const onZipCodesChange = (selection) => {
        let _providerData = { ...providerData };
        _providerData["zip_codes"] = selection
        setProviderData(_providerData);
        let _zipCodesSelected = selection.map(zc => zc.name)
        setZipCodesSelected(_zipCodesSelected);
    };

    const updateProviderData = () => {
        let _providerData = {...providerData}
        _providerData.urgency = _providerData.urgency ? _providerData.urgency.code : null
        _providerData.zip_codes = _providerData.zip_codes.map((z) => z.code)
        ProviderService.updateProvider(_providerData)
            .then((response) => {
                toast.current.show({ severity: 'success', summary: 'Successful', detail: "Saved!", life: 3000 });
            }).catch((error) => {
                console.log("ERROR: ", error)
                // toast.current.show({ severity: 'error', summary: 'Failed', detail: error.error_code, life: 3000 });
            })
    }

    return (

        <div>
            <Toast ref={toast} />
            {userIsProvider &&providerData && (
                <div className="card p-fluid">
                    <h1>{providerData.name} {providerData.lastname}</h1>
                    <Divider></Divider>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                        <div className="col">
                            <label htmlFor="current_hs" className="font-bold block mb-2">Current HS.<small>(p/week)</small></label>
                            <InputNumber inputId="current_hs" value={providerData.current_hs} onChange={(e) => onInputChange(e, 'current_hs')} />
                        </div>
                        <div className="col">
                            <label htmlFor="available_hs" className="font-bold block mb-2">Available HS.<small>(p/week)</small></label>
                            <InputNumber inputId="available_hs" value={providerData.available_hs} onChange={(e) => onInputChange(e, 'available_hs')} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <div className="col">
                            <label htmlFor="urgency" className="font-bold block mb-2">Urgency</label>
                            <Dropdown id="urgency" value={providerData.urgency} options={urgencies} optionLabel="name" placeholder="Select..." className="w-full md:w-14rem" onChange={(e) => onInputChange(e, 'urgency')} />
                        </div>
                    </div>

                    <div className="">
                        <Divider align="left">
                            <div className="inline-flex align-items-center">
                                <b>ZIP Codes</b>
                            </div>
                        </Divider>
                        <div className="col">
                            <MultiSelect id="zip_codes" value={providerData.zip_codes} onChange={(e) => onZipCodesChange(e.value)} options={zipCodes} optionLabel="name" placeholder="Select..." maxSelectedLabels={1} />
                        </div>
                        <ScrollPanel style={{ width: '100%', height: '150px' }}>
                            <div className="col">
                                <Chips value={zipCodesSelected} removable={false}/>
                            </div>
                        </ScrollPanel>
                    </div>
                    <Button label="Save" icon="pi pi-save" severity="success" onClick={updateProviderData} className="mt-4" />
                </div>
            )}

            {/* <Dialog visible={deleteProviderDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteProviderDialogFooter} onHide={hideDeleteProviderDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {provider && (
                        <span>
                            Delete provider <b>{provider.name} {provider.lastname}</b>?
                        </span>
                    )}
                </div>
            </Dialog> */}
        </div>

    )
}

export default ProviderForm