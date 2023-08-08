const saveData = (key, value) => {
    if (sessionStorage) {
        sessionStorage.setItem(key, value);
    } else {
        throw Error("cannot save session data");
    }
};

const getData = (key) => {
    if (sessionStorage) {
        return sessionStorage.getItem(key);
    } else {
        throw Error("cannot read session data");
    }
};

const clearData = () => {
    if (sessionStorage) {
        sessionStorage.clear();
    } else {
        throw Error("cannot read session data");
    }
};

const sessionStorageUtil = {
    saveSessionData: saveData,
    getSessionData: getData,
    clearSessionData: clearData,
};

export default sessionStorageUtil;
