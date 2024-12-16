import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Folder, File, ChevronRight } from 'lucide-react'

const demoFiles = [
  { name: 'Documents', type: 'folder' },
  { name: 'Downloads', type: 'folder' },
  { name: 'Pictures', type: 'folder' },
  { name: 'readme.txt', type: 'file' },
  { name: 'notes.md', type: 'file' },
]

export function FileExplorer() {
  return (
    <div className="flex h-full">
      <div className="w-48 border-r p-2">
        <div className="space-y-1">
          {['Home', 'Desktop', 'Downloads'].map((item) => (
            <Button
              key={item}
              variant="ghost"
              className="w-full justify-start"
            >
              <ChevronRight className="h-4 w-4 mr-2" />
              {item}
            </Button>
          ))}
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="grid grid-cols-4 gap-4">
          {demoFiles.map((file) => (
            <Button
              key={file.name}
              variant="ghost"
              className="h-24 flex flex-col items-center justify-center space-y-2"
            >
              {file.type === 'folder' ? (
                <Folder className="h-8 w-8" />
              ) : (
                <File className="h-8 w-8" />
              )}
              <span className="text-sm">{file.name}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
