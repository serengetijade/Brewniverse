const STORAGE_KEY = 'brewniverse-data';
const STORAGE_VERSION = '1.0';

class StorageService {
  constructor() {
    this.storageType = this.detectStorageType();
  }

  detectStorageType() {
    if (typeof window !== 'undefined' && window.localStorage) {
      return 'localStorage';
    }
    // if (typeof Capacitor !== 'undefined') return 'capacitor';
    
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
        case 'localStorage':
          localStorage.setItem(STORAGE_KEY, serialized);
          break;
        // case 'capacitor':
        //   await Filesystem.writeFile({
        //     path: 'brewniverse-data.json',
        //     data: serialized,
        //     directory: Directory.Data,
        //   });
        //   break;
        
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
        case 'localStorage':
          serialized = localStorage.getItem(STORAGE_KEY);
          break;

        // case 'capacitor':
        //   try {
        //     const result = await Filesystem.readFile({
        //       path: 'brewniverse-data.json',
        //       directory: Directory.Data,
        //     });
        //     serialized = result.data;
        //   } catch (fileError) {
        //     // File doesn't exist yet
        //     return null;
        //   }
        //   break;
        
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

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `brewniverse-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
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
        case 'localStorage':
          localStorage.removeItem(STORAGE_KEY);
          break;
        
        // case 'capacitor':
        //   await Filesystem.deleteFile({
        //     path: 'brewniverse-data.json',
        //     directory: Directory.Data,
        //   });
        //   break;
        
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