/**
 * LocalStorage System State and Process Control Hook Data Module
 */
const StorageController = {
    STORAGE_KEY: 'zenspace_tasks_manifest',

    /** Retrieves structural state objects from browser environment storage matrices */
    loadTasks() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("System storage access failure structural error:", e);
            return [];
        }
    },

    /** Saves system objects back into active application JSON layers */
    saveTasks(tasksArray) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasksArray));
        } catch (e) {
            console.error("Failed writing process block array arrays directly down:", e);
        }
    }
};