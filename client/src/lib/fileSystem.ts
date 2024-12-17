
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

  updateFileContent(path: string[], content: string): boolean {
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
      
      if (current[path[path.length - 1]]?.type === 'file') {
        current[path[path.length - 1]].content = content;
        current[path[path.length - 1]].updatedAt = Date.now();
        this.storage.setItem(this.ROOT_KEY, JSON.stringify(root));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating file content:', error);
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
