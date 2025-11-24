import AsyncStorage from '@react-native-async-storage/async-storage';

const storeData = async (keyVal, value) => {
    try {
        await AsyncStorage.setItem(keyVal, value);
    } catch (e) { 
        console.log(e);
    }
};

export const logAllAsyncStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const stores = await AsyncStorage.multiGet(keys);

    console.log('=== AsyncStorage ===');
    stores.forEach(([key, value]) => {
      console.log(`${key} : ${value}`);
    });
    console.log('====================');
  } catch (error) {
    console.error('Error al leer AsyncStorage:', error);
  }
};

const getData = async (keyVal, setVal, anyload = false) => {
    try {
        const value = await AsyncStorage.getItem(keyVal);
        if (value !== null) {
            if(setVal != null){
                setVal(value);
            }else{
                return value;
            }
        }
    } catch (e) { 
        console.log(e);
    }
};

const clearAll = async () => {
  try {
    await AsyncStorage.clear();
    console.log("AsyncStorage limpiado completamente");
  } catch (e) {
    console.log("Error al limpiar AsyncStorage:", e);
  }
};

const removeToken = async (keyVal) => {
    try {
        await AsyncStorage.removeItem(keyVal);
    } catch (e) {
        console.error('Error eliminando', e);
    }
};



export async function storeDataIS(key, value) {
    try { await AsyncStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { console.warn('storeData error', e); }
}

export async function getDataIS(key, fallback = null) {
    try {
        const v = await AsyncStorage.getItem(key);
        return v != null ? JSON.parse(v) : fallback;
    } catch (e) { console.warn('getData error', e); return fallback; }
}

export {
    getData, removeToken, storeData
};
