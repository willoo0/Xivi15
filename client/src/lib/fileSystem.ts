interface FSNode {
  type: 'file' | 'folder';
  name: string;
  content?: string;
  children?: { [key: string]: FSNode };
}

class FileSystem {
  private mockFiles: { [key: string]: FSNode } = {
    'Documents': {
      type: 'folder',
      name: 'Documents',
      children: {
        'welcome.txt': {
          type: 'file',
          name: 'welcome.txt',
          content: 'Welcome to Xivi OS!\nThis is a demo text file.'
        },
        'notes': {
          type: 'folder',
          name: 'notes',
          children: {
            'todo.txt': {
              type: 'file',
              name: 'todo.txt',
              content: '- Learn TypeScript\n- Build awesome apps'
            }
          }
        }
      }
    },
    'Desktop': {
      type: 'folder',
      name: 'Desktop',
      children: {
        'readme.txt': {
          type: 'file',
          name: 'readme.txt',
          content: 'This is your desktop folder.'
        }
      }
    }
  };

  getFiles(path: string[] = []): { [key: string]: FSNode } {
    if (path.length === 0) {
      return this.mockFiles;
    }

    let current = this.mockFiles;
    for (const segment of path) {
      if (!current[segment] || current[segment].type !== 'folder') {
        return {};
      }
      current = current[segment].children || {};
    }
    return current;
  }

  getFileContent(_path: string[]): string {
    return 'This is a demo file. File system functionality is currently disabled.';
  }

  updateFileContent(_path: string[], _content: string): boolean {
    return true; // Always return success but don't actually save
  }

  createFile(name: string, _path: string[] = [], _type: 'file' | 'folder' = 'file'): boolean {
    return true; // Pretend to succeed but don't actually create
  }

  deleteFile(_path: string[]): boolean {
    return true; // Pretend to succeed but don't actually delete
  }

  renameFile(_path: string[], _newName: string): boolean {
    return true; // Pretend to succeed but don't actually rename
  }
}

const fs = new FileSystem();
export { fs };