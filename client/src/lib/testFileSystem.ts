import { fs } from './fileSystem';

// Test function to verify file system operations
function testFileSystem() {
  console.log('Starting file system tests...');

  // Test creating a file
  const testPath = ['Documents', 'test.txt'];
  console.log('Creating file at path:', testPath);
  const createResult = fs.createFile('test.txt', ['Documents']);
  console.log('Create result:', createResult);

  // Test writing content
  console.log('Writing content to file...');
  const writeResult = fs.updateFileContent(testPath, 'Test content');
  console.log('Write result:', writeResult);

  // Test reading content
  console.log('Reading file content...');
  const content = fs.getFileContent(testPath);
  console.log('Read content:', content);

  // Test getting files in directory
  console.log('Getting files in Documents...');
  const files = fs.getFiles(['Documents']);
  console.log('Files:', files);

  // Test invalid paths
  console.log('Testing invalid paths...');
  console.log('Empty path:', fs.getFileContent([]));
  console.log('Null path:', fs.getFileContent(null as any));
  console.log('Invalid path segments:', fs.getFileContent(['', 'test.txt']));

  console.log('File system tests completed.');
}

export { testFileSystem };
