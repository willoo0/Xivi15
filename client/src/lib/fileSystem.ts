
interface FSNode {
  type: 'file' | 'folder';
  name: string;
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
        }
      };
      this.storage.setItem(this.ROOT_KEY, JSON.stringify(root));
    }
  }

  private getNodeAtPath(path: string[]): { node: FSNode | null; parent: Record<string, FSNode> | null } {
    const root = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
    let current = root;
    let parent = null;

    if (!Array.isArray(path) || path.length === 0) return { node: null, parent: root };
    
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]] || current[path[i]].type !== 'folder') {
        return { node: null, parent: null };
      }
      parent = current;
      current = current[path[i]].children!;
    }

    const lastSegment = path[path.length - 1];
    return { 
      node: current[lastSegment] || null,
      parent: parent || root
    };
  }

  getFiles(path: string[] = []): Record<string, FSNode> {
    const { node } = this.getNodeAtPath(path);
    if (!path.length) {
      return JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
    }
    return node?.type === 'folder' ? node.children || {} : {};
  }

  getFileContent(path: string[]): string | null {
    const { node } = this.getNodeAtPath(path);
    return node?.type === 'file' ? node.content || '' : null;
  }

  updateFileContent(path: string[], content: string): { success: boolean; error?: string } {
    if (!path.length) return { success: false, error: 'Invalid path' };
    
    try {
      const root = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
      const { node, parent } = this.getNodeAtPath(path);
      const fileName = path[path.length - 1];

      if (!node && parent) {
        parent[fileName] = {
          type: 'file',
          name: fileName,
          content: content,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        this.storage.setItem(this.ROOT_KEY, JSON.stringify(root));
        return { success: true };
      }

      if (node?.type === 'file') {
        node.content = content;
        node.updatedAt = Date.now();
        this.storage.setItem(this.ROOT_KEY, JSON.stringify(root));
        return { success: true };
      }

      return { success: false, error: 'Invalid file' };
    } catch (error) {
      return { success: false, error: 'Failed to update file' };
    }
  }

  createFile(name: string, path: string[] = [], type: 'file' | 'folder'): boolean {
    try {
      const root = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
      const { node: parentNode } = this.getNodeAtPath(path);
      const targetDir = parentNode?.children || root;

      if (targetDir[name]) return false;

      targetDir[name] = {
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
    if (!path.length) return false;
    
    try {
      const root = JSON.parse(this.storage.getItem(this.ROOT_KEY) || '{}');
      const { parent } = this.getNodeAtPath(path);
      
      if (!parent) return false;
      
      const fileName = path[path.length - 1];
      const success = delete parent[fileName];
      
      if (success) {
        this.storage.setItem(this.ROOT_KEY, JSON.stringify(root));
      }
      return success;
    } catch {
      return false;
    }
  }
}

export const fs = new FileSystem();
