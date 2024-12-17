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

  private validatePath(path: string[]): boolean {
    return Array.isArray(path) && path.every(segment => 
      typeof segment === 'string' && segment.length > 0
    );
  }

  private getNodeAtPath(path: string[]): { 
    node: FSNode | null; 
    parent: { [key: string]: FSNode } | null;
    parentPath: string[];
  } {
    if (!this.validatePath(path)) {
      console.error('Invalid path format:', path);
      return { node: null, parent: null, parentPath: [] };
    }

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
          console.error(`Invalid path segment at index ${i}:`, segment);
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
    } catch (error) {
      console.error('Error parsing filesystem:', error);
      return { node: null, parent: null, parentPath: [] };
    }
  }

  getFiles(path: string[] = []): { [key: string]: FSNode } {
    if (!this.validatePath(path)) {
      console.error('Invalid path format in getFiles:', path);
      return {};
    }

    try {
      if (path.length === 0) {
        return JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
      }

      let current = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
      for (const segment of path) {
        if (!current[segment] || current[segment].type !== 'folder') {
          console.error('Invalid folder in path:', segment);
          return {};
        }
        current = current[segment].children!;
      }
      return current;
    } catch (error) {
      console.error('Error in getFiles:', error);
      return {};
    }
  }

  updateFileContent(path: string[], content: string): boolean {
    console.log('Updating file content:', { path, content });
    
    if (!this.validatePath(path)) {
      console.error('Invalid path format in updateFileContent:', path);
      return false;
    }

    try {
      const root = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
      let current = root;

      // Navigate to parent directory
      for (let i = 0; i < path.length - 1; i++) {
        const segment = path[i];
        if (!current[segment] || current[segment].type !== 'folder') {
          console.error(`Invalid folder at index ${i}:`, segment);
          return false;
        }
        current = current[segment].children!;
      }

      const fileName = path[path.length - 1];
      
      // Create file if it doesn't exist
      if (!current[fileName]) {
        current[fileName] = {
          type: 'file',
          name: fileName,
          content: '',
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
      }

      if (current[fileName].type !== 'file') {
        console.error('Path points to a non-file:', fileName);
        return false;
      }

      // Update the file content
      current[fileName].content = content;
      current[fileName].updatedAt = Date.now();

      // Save to localStorage
      this.storage.setItem(this.ROOT_KEY, JSON.stringify(root));
      console.log('File saved successfully:', path.join('/'));
      return true;
    } catch (error) {
      console.error('Error saving file:', error);
      return false;
    }
  }

  getFileContent(path: string[]): string | null {
    console.log('Getting file content for path:', path);
    
    if (!this.validatePath(path)) {
      console.error('Invalid path format in getFileContent:', path);
      return null;
    }

    try {
      const { node } = this.getNodeAtPath(path);
      if (!node || node.type !== 'file') {
        console.error('Invalid file path or node type:', path);
        return null;
      }
      return node.content || '';
    } catch (error) {
      console.error('Error getting file content:', error);
      return null;
    }
  }

  createFile(name: string, path: string[] = [], type: 'file' | 'folder' = 'file'): boolean {
    console.log('Creating file:', { name, path, type });
    
    if (!this.validatePath(path)) {
      console.error('Invalid path format in createFile:', path);
      return false;
    }

    try {
      const root = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
      let current = root;

      // Navigate to the target directory
      for (const segment of path) {
        if (!current[segment] || current[segment].type !== 'folder') {
          console.error('Invalid folder in path:', segment);
          return false;
        }
        current = current[segment].children!;
      }

      // Check if file/folder already exists
      if (current[name]) {
        console.error('File/folder already exists:', name);
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
    } catch (error) {
      console.error('Error creating file:', error);
      return false;
    }
  }

  renameFile(oldPath: string[], newName: string): boolean {
    console.log('Renaming file:', { oldPath, newName });
    
    if (!this.validatePath(oldPath)) {
      console.error('Invalid path format in renameFile:', oldPath);
      return false;
    }

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
    } catch (error) {
      console.error('Error renaming file:', error);
      return false;
    }
  }

  deleteFile(path: string[]): boolean {
    console.log('Deleting file:', path);
    
    if (!this.validatePath(path)) {
      console.error('Invalid path format in deleteFile:', path);
      return false;
    }

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
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
}

// Create a singleton instance
const fs = new FileSystem();

export { fs };
