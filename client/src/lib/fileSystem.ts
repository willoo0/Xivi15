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
    console.log('Validating path:', path);
    if (!Array.isArray(path)) {
      console.error('Path is not an array:', path);
      return false;
    }
    
    if (path.length === 0) {
      console.error('Path is empty');
      return false;
    }

    const validSegment = (segment: string) => 
      typeof segment === 'string' && 
      segment.length > 0 && 
      !segment.includes('/') && 
      !segment.includes('\\');

    const isValid = path.every(validSegment);
    if (!isValid) {
      console.error('Invalid path segments found:', path);
    }
    return isValid;
  }

  private getParentPath(path: string[]): { parent: { [key: string]: FSNode }; lastSegment: string } | null {
    console.log('Getting parent path for:', path);
    if (!this.validatePath(path)) {
      return null;
    }

    try {
      const root = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
      let current = root;
      
      // Navigate to parent directory
      for (let i = 0; i < path.length - 1; i++) {
        const segment = path[i];
        if (!current[segment] || current[segment].type !== 'folder') {
          console.error('Invalid folder in path:', segment);
          return null;
        }
        current = current[segment].children!;
      }

      return {
        parent: current,
        lastSegment: path[path.length - 1]
      };
    } catch (error) {
      console.error('Error in getParentPath:', error);
      return null;
    }
  }

  getFiles(path: string[] = []): { [key: string]: FSNode } {
    console.log('Getting files for path:', path);
    if (path.length === 0) {
      try {
        return JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
      } catch (error) {
        console.error('Error reading root directory:', error);
        return {};
      }
    }

    if (!this.validatePath(path)) {
      return {};
    }

    try {
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
    console.log('Updating file content for path:', path);
    if (!this.validatePath(path)) {
      return false;
    }

    try {
      const pathInfo = this.getParentPath(path);
      if (!pathInfo) {
        console.error('Could not get parent path');
        return false;
      }

      const { parent, lastSegment } = pathInfo;
      const root = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');

      // Create or update file
      if (!parent[lastSegment]) {
        parent[lastSegment] = {
          type: 'file',
          name: lastSegment,
          content: '',
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
      }

      if (parent[lastSegment].type !== 'file') {
        console.error('Path points to a non-file:', lastSegment);
        return false;
      }

      // Update content and timestamp
      parent[lastSegment].content = content;
      parent[lastSegment].updatedAt = Date.now();

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
      return null;
    }

    try {
      const pathInfo = this.getParentPath(path);
      if (!pathInfo) {
        return null;
      }

      const { parent, lastSegment } = pathInfo;
      if (!parent[lastSegment] || parent[lastSegment].type !== 'file') {
        console.error('Invalid file path or node type:', path);
        return null;
      }

      return parent[lastSegment].content || '';
    } catch (error) {
      console.error('Error getting file content:', error);
      return null;
    }
  }

  renameFile(path: string[], newName: string): boolean {
    console.log('Renaming file:', { path, newName });
    if (!this.validatePath(path)) {
      return false;
    }

    try {
      const pathInfo = this.getParentPath(path);
      if (!pathInfo) {
        return false;
      }

      const { parent, lastSegment } = pathInfo;
      if (!parent[lastSegment] || parent[newName]) {
        return false;
      }

      // Create new entry with updated name
      parent[newName] = {
        ...parent[lastSegment],
        name: newName,
        updatedAt: Date.now()
      };

      // Delete old entry
      delete parent[lastSegment];

      // Save changes
      const root = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
      this.storage.setItem(this.ROOT_KEY, JSON.stringify(root));
      return true;
    } catch (error) {
      console.error('Error renaming file:', error);
      return false;
    }
  }

  createFile(name: string, path: string[] = [], type: 'file' | 'folder' = 'file'): boolean {
    console.log('Creating file:', { name, path, type });
    if (path.length > 0 && !this.validatePath(path)) {
      return false;
    }

    try {
      const root = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
      let current = root;

      // Navigate to target directory
      for (const segment of path) {
        if (!current[segment] || current[segment].type !== 'folder') {
          console.error('Invalid folder in path:', segment);
          return false;
        }
        current = current[segment].children!;
      }

      if (current[name]) {
        console.error('File/folder already exists:', name);
        return false;
      }

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

  deleteFile(path: string[]): boolean {
    console.log('Deleting file:', path);
    if (!this.validatePath(path)) {
      return false;
    }

    try {
      const pathInfo = this.getParentPath(path);
      if (!pathInfo) {
        return false;
      }

      const { parent, lastSegment } = pathInfo;
      if (!parent[lastSegment]) {
        return false;
      }

      delete parent[lastSegment];
      
      const root = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
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
