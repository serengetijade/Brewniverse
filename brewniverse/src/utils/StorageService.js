import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const STORAGE_KEY = 'brewniverse-data';
const STORAGE_FILE = 'brewniverse-data.json';
const STORAGE_VERSION = '1.0';

class StorageService {
    constructor() {
        this.storageType = this.detectStorageType();
    }

    detectStorageType() {
        const isNative = Capacitor.isNativePlatform();
        const platform = Capacitor.getPlatform();
        console.log('🔍 Storage Detection:', {
            isNativePlatform: isNative,
            platform: platform,
            hasLocalStorage: typeof window !== 'undefined' && window.localStorage
        });
        
        if (isNative) {
            console.log('✅ Using Capacitor Filesystem storage');
            return 'capacitor';
        }
        if (typeof window !== 'undefined' && window.localStorage) {
            console.log('⚠️ Using localStorage (fallback)');
            return 'localStorage';
        }
        console.log('❌ Using memory storage (not persistent)');
        return 'memory';
    }

    async saveData(data) {
        try {
            const dataToSave = {
                version: STORAGE_VERSION,
                timestamp: new Date().toISOString(),
                data: data,
            };

            const serialized = JSON.stringify(dataToSave);

            switch (this.storageType) {
                case 'capacitor':
                    await Filesystem.writeFile({
                        path: STORAGE_FILE,
                        data: serialized,
                        directory: Directory.Data,
                        encoding: 'utf8'
                    });
                    break;

                case 'localStorage':
                    localStorage.setItem(STORAGE_KEY, serialized);
                    break;

                case 'memory':
                    this.memoryStorage = serialized;
                    break;

                default:
                    throw new Error('No storage mechanism available');
            }

            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    async loadData() {
        try {
            let serialized = null;

            switch (this.storageType) {
                case 'capacitor':
                    try {
                        const result = await Filesystem.readFile({
                            path: STORAGE_FILE,
                            directory: Directory.Data,
                            encoding: 'utf8'
                        });
                        serialized = result.data;
                    } catch (fileError) {
                        // File doesn't exist yet - normal on first run
                        return null;
                    }
                    break;

                case 'localStorage':
                    serialized = localStorage.getItem(STORAGE_KEY);
                    break;

                case 'memory':
                    serialized = this.memoryStorage || null;
                    break;

                default:
                    throw new Error('No storage mechanism available');
            }

            if (!serialized) {
                return null;
            }

            const parsed = JSON.parse(serialized);

            if (parsed.version !== STORAGE_VERSION) {
                console.warn('Storage version mismatch, may need migration');
            }

            return parsed.data;
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    }

    async exportToFile(data) {
        try {
            const exportData = {
                version: STORAGE_VERSION,
                exportDate: new Date().toISOString(),
                data: data,
            };

            const jsonContent = JSON.stringify(exportData, null, 2);
            const fileName = `brewniverse-backup-${new Date().toISOString().slice(0, 10)}.json`;

            // Use Capacitor Filesystem for mobile, blob download for web
            if (Capacitor.isNativePlatform()) {
                await Filesystem.writeFile({
                    path: fileName,
                    data: jsonContent,
                    directory: Directory.Cache,
                    encoding: 'utf8'
                });

                // Get the file URI
                const fileUri = await Filesystem.getUri({
                    path: fileName,
                    directory: Directory.Cache
                });

                // Use Share API - let user choose where to save
                try {
                    await Share.share({
                        title: 'Brewniverse Backup',
                        text: `Backup created on ${new Date().toLocaleDateString()}`,
                        url: fileUri.uri,
                        dialogTitle: 'Save your Brewniverse backup'
                    });

                    return {
                        success: true,
                        message: 'Export initiated! Your data has been saved.'
                    };
                } catch (shareError) {
                    console.log('Share failed, saving to Documents instead:', shareError);
                    
                    await Filesystem.writeFile({
                        path: fileName,
                        data: jsonContent,
                        directory: Directory.Documents,
                        encoding: 'utf8'
                    });

                    return {
                        success: true,
                        message: `File saved to Documents folder:\n${fileName}\n\nYou can find it using a file manager app.`
                    };
                }
            } else {
                // Web browser - use blob download
                const blob = new Blob([jsonContent], {
                    type: 'application/json',
                });

                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                return {
                    success: true,
                    message: 'File downloaded successfully!'
                };
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            throw error;
        }
    }

    async importFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const imported = JSON.parse(event.target.result);

                    if (!imported.data) {
                        throw new Error('Invalid data format');
                    }

                    resolve(imported.data);
                } catch (error) {
                    reject(new Error('Error parsing imported file: ' + error.message));
                }
            };

            reader.onerror = () => {
                reject(new Error('Error reading file'));
            };

            reader.readAsText(file);
        });
    }

    async clearData() {
        try {
            switch (this.storageType) {
                case 'capacitor':
                    try {
                        await Filesystem.deleteFile({
                            path: STORAGE_FILE,
                            directory: Directory.Data,
                        });
                    } catch (deleteError) {
                        console.log('No file to delete or already deleted');
                    }
                    break;

                case 'localStorage':
                    localStorage.removeItem(STORAGE_KEY);
                    break;

                case 'memory':
                    this.memoryStorage = null;
                    break;
            }

            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }

    getStorageInfo() {
        return {
            type: this.storageType,
            version: STORAGE_VERSION,
            available: this.storageType !== 'memory',
        };
    }

    mergeData(existingData, importedData) {
        const mergeArrays = (existing = [], imported = []) => {
            const existingIds = new Set(existing.map(item => item.id));
            const uniqueImported = imported.filter(item => !existingIds.has(item.id));
            return [...existing, ...uniqueImported];
        };

        return {
            brewLogs: mergeArrays(existingData.brewLogs, importedData.brewLogs),
            recipes: mergeArrays(existingData.recipes, importedData.recipes),
            alerts: mergeArrays(existingData.alerts, importedData.alerts),
            alertGroups: mergeArrays(existingData.alertGroups || [], importedData.alertGroups || []),
            instructions: mergeArrays(existingData.instructions || [], importedData.instructions || []),
            recipeProgress: {
                ...existingData.recipeProgress,
                ...importedData.recipeProgress
            },
            settings: {
                ...existingData.settings,
                ...importedData.settings
            },
        };
    }
}

export default new StorageService();