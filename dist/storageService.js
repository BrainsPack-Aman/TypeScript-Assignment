class StorageService {
    static setItem(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
        }
        catch (error) {
            console.error("Error saving data:", error);
        }
    }
    static getItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item !== null ? JSON.parse(item) : null;
        }
        catch (error) {
            console.error("Error retrieving data:", error);
            return null;
        }
    }
    static removeItem(key) {
        localStorage.removeItem(key);
    }
    static clear() {
        localStorage.clear();
    }
}
export default StorageService;
