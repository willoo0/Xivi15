
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
        'Documents': {
          type: 'folder',
          name: 'Documents',
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
  }

  createFile(name: string, path: string[] = []): boolean {
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
      type: 'file',
      name,
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    this.storage.setItem(this.ROOT_KEY, JSON.stringify(root));
    return true;
  }

  getFileContent(path: string[]): string | null {
    const root = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
    let current = root;
    
    for (let i = 0; i < path.length - 1; i++) {
      if (current[path[i]]?.children) {
        current = current[path[i]].children;
      } else {
        return null;
      }
    }
    
    return current[path[path.length - 1]]?.content || null;
  }

  updateFileContent(path: string[], content: string): boolean {
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
  }
}

export const fs = new FileSystem();
