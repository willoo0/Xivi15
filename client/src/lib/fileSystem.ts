
interface FSNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: Record<string, FSNode>;
  createdAt: number;
  updatedAt: number;
}

class FileSystem {
  private storage: Storage;
  private readonly ROOT_KEY = 'fs_root';

  constructor() {
    this.storage = window.localStorage;
    this.initializeFS();
  }

  private initializeFS() {
    if (!this.storage.getItem(this.ROOT_KEY)) {
      const root: Record<string, FSNode> = {
        'Desktop': {
          type: 'folder',
          name: 'Desktop',
          children: {},
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        'Documents': {
          type: 'folder',
          name: 'Documents',
          children: {},
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        'Downloads': {
          type: 'folder',
          name: 'Downloads',
          children: {},
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        'Pictures': {
          type: 'folder',
          name: 'Pictures',
          children: {},
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      };
      this.storage.setItem(this.ROOT_KEY, JSON.stringify(root));
    }
  }

  getFiles(path: string[] = []): Record<string, FSNode> {
    try {
      const root = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
      let current = root;
      
      for (const segment of path) {
        if (current[segment]?.children) {
          current = current[segment].children;
        } else {
          return {};
        }
      }
      
      return current;
    } catch (error) {
      console.error('Error getting files:', error);
      return {};
    }
  }

  createFile(name: string, path: string[] = [], type: 'file' | 'folder' = 'file'): boolean {
    try {
      const root = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
      let current = root;
      
      for (const segment of path) {
        if (current[segment]?.children) {
          current = current[segment].children;
        } else {
          return false;
        }
      }
      
      if (current[name]) return false;
      
      current[name] = {
        type,
        name,
        ...(type === 'folder' ? { children: {} } : { content: '' }),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      this.storage.setItem(this.ROOT_KEY, JSON.stringify(root));
      return true;
    } catch (error) {
      console.error('Error creating file:', error);
      return false;
    }
  }

  getFileContent(path: string[]): string | null {
    if (!path || path.length === 0) return null;
    
    try {
      const root = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
      let current = root;
      
      for (let i = 0; i < path.length - 1; i++) {
        if (current[path[i]]?.children) {
          current = current[path[i]].children;
        } else {
          return null;
        }
      }
      
      const file = current[path[path.length - 1]];
      return file?.type === 'file' ? file.content || '' : null;
    } catch (error) {
      console.error('Error getting file content:', error);
      return null;
    }
  }

  updateFileContent(path: string[], content: string): { success: boolean; error?: string } {
    if (!path || path.length === 0) return { success: false, error: 'Invalid file path' };
    
    try {
      const root = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
      let current = root;
      
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          return { success: false, error: `Directory "${path[i]}" not found` };
        }
        if (!current[path[i]].children) {
          return { success: false, error: `"${path[i]}" is not a directory` };
        }
        current = current[path[i]].children;
      }
      
      const fileName = path[path.length - 1];
      if (!current[fileName]) {
        current[fileName] = {
          type: 'file',
          name: fileName,
          content: '',
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
      }
      
      if (current[fileName].type === 'file') {
        current[fileName].content = content;
        current[fileName].updatedAt = Date.now();
        this.storage.setItem(this.ROOT_KEY, JSON.stringify(root));
        return { success: true };
      }
      
      return { success: false, error: `"${fileName}" is not a file` };
    } catch (error) {
      console.error('Error updating file content:', error);
      return false;
    }
  }

  renameFile(oldPath: string[], newName: string): boolean {
    if (!oldPath || oldPath.length === 0) return false;
    
    try {
      const root = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
      let current = root;
      
      for (let i = 0; i < oldPath.length - 1; i++) {
        if (!current[oldPath[i]] || !current[oldPath[i]].children) {
          return false;
        }
        current = current[oldPath[i]].children;
      }
      
      const oldName = oldPath[oldPath.length - 1];
      if (!current[oldName]) return false;
      
      const item = current[oldName];
      item.name = newName;
      current[newName] = item;
      delete current[oldName];
      
      this.storage.setItem(this.ROOT_KEY, JSON.stringify(root));
      return true;
    } catch (error) {
      console.error('Error renaming file:', error);
      return false;
    }
  }

  deleteFile(path: string[]): boolean {
    if (!path || path.length === 0) return false;
    
    try {
      const root = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
      let current = root;
      
      for (let i = 0; i < path.length - 1; i++) {
        if (current[path[i]]?.children) {
          current = current[path[i]].children;
        } else {
          return false;
        }
      }
      
      const success = delete current[path[path.length - 1]];
      if (success) {
        this.storage.setItem(this.ROOT_KEY, JSON.stringify(root));
      }
      return success;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
}

export const fs = new FileSystem();
