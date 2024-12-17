interface FSNode {
  type: 'file' | 'folder';
  name: string;
  content?: string;
  children?: { [key: string]: FSNode };
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
      const root: { [key: string]: FSNode } = {
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
        }
      };
      this.storage.setItem(this.ROOT_KEY, JSON.stringify(root));
    }
  }

  private getNodeAtPath(path: string[]): { 
    node: FSNode | null; 
    parent: { [key: string]: FSNode } | null;
    parentPath: string[];
  } {
    try {
      const root = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
      let current: { [key: string]: FSNode } = root;
      let parent: { [key: string]: FSNode } | null = null;
      let parentPath: string[] = [];

      if (!path || path.length === 0) {
        return { node: null, parent: root, parentPath: [] };
      }

      // Navigate through the path except the last element
      for (let i = 0; i < path.length - 1; i++) {
        const segment = path[i];
        if (!current[segment] || current[segment].type !== 'folder') {
          return { node: null, parent: null, parentPath: [] };
        }
        parent = current;
        parentPath = path.slice(0, i);
        current = current[segment].children!;
      }

      const lastSegment = path[path.length - 1];
      return {
        node: current[lastSegment] || null,
        parent: parent || root,
        parentPath: parentPath,
      };
    } catch {
      return { node: null, parent: null, parentPath: [] };
    }
  }

  getFiles(path: string[] = []): { [key: string]: FSNode } {
    try {
      if (path.length === 0) {
        return JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
      }

      let current = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
      for (const segment of path) {
        if (!current[segment] || current[segment].type !== 'folder') {
          return {};
        }
        current = current[segment].children!;
      }
      return current;
    } catch {
      return {};
    }
  }

  createFile(name: string, path: string[] = [], type: 'file' | 'folder' = 'file'): boolean {
    try {
      const root = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
      let current = root;

      // Navigate to the target directory
      for (const segment of path) {
        if (!current[segment] || current[segment].type !== 'folder') {
          return false;
        }
        current = current[segment].children!;
      }

      // Check if file/folder already exists
      if (current[name]) {
        return false;
      }

      // Create new node
      current[name] = {
        type,
        name,
        ...(type === 'folder' ? { children: {} } : { content: '' }),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      this.storage.setItem(this.ROOT_KEY, JSON.stringify(root));
      return true;
    } catch {
      return false;
    }
  }

  deleteFile(path: string[]): boolean {
    if (!path?.length) return false;

    try {
      const root = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
      let current = root;
      
      // Navigate to parent directory
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]] || current[path[i]].type !== 'folder') {
          return false;
        }
        current = current[path[i]].children!;
      }

      const fileName = path[path.length - 1];
      if (!current[fileName]) {
        return false;
      }

      delete current[fileName];
      this.storage.setItem(this.ROOT_KEY, JSON.stringify(root));
      return true;
    } catch {
      return false;
    }
  }

  renameFile(oldPath: string[], newName: string): boolean {
    if (!oldPath?.length || !newName) return false;

    try {
      const root = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
      let current = root;

      // Navigate to parent directory
      for (let i = 0; i < oldPath.length - 1; i++) {
        if (!current[oldPath[i]] || current[oldPath[i]].type !== 'folder') {
          return false;
        }
        current = current[oldPath[i]].children!;
      }

      const oldName = oldPath[oldPath.length - 1];
      if (!current[oldName] || current[newName]) {
        return false;
      }

      // Create new entry with updated name
      current[newName] = {
        ...current[oldName],
        name: newName,
        updatedAt: Date.now()
      };

      // Delete old entry
      delete current[oldName];

      this.storage.setItem(this.ROOT_KEY, JSON.stringify(root));
      return true;
    } catch {
      return false;
    }
  }

  getFileContent(path: string[]): string | null {
    if (!path?.length) return null;

    try {
      let current = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
      
      // Navigate to file
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]] || current[path[i]].type !== 'folder') {
          return null;
        }
        current = current[path[i]].children!;
      }

      const fileName = path[path.length - 1];
      if (!current[fileName] || current[fileName].type !== 'file') {
        return null;
      }

      return current[fileName].content || '';
    } catch {
      return null;
    }
  }

  updateFileContent(path: string[], content: string): boolean {
    if (!path?.length) return false;

    try {
      const root = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
      let current = root;

      // Navigate to parent directory
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]] || current[path[i]].type !== 'folder') {
          return false;
        }
        current = current[path[i]].children!;
      }

      const fileName = path[path.length - 1];
      if (!current[fileName] || current[fileName].type !== 'file') {
        return false;
      }

      current[fileName].content = content;
      current[fileName].updatedAt = Date.now();

      this.storage.setItem(this.ROOT_KEY, JSON.stringify(root));
      return true;
    } catch {
      return false;
    }
  }
}

export const fs = new FileSystem();
