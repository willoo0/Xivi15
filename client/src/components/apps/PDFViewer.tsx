
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export function PDFViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setPageNumber(1);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      <Input 
        type="file" 
        accept=".pdf" 
        onChange={onFileChange} 
        className="bg-background"
      />
      {file && (
        <div className="flex-1 overflow-auto flex flex-col items-center">
          <Document
            file={file}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            className="max-w-full"
          >
            <Page 
              pageNumber={pageNumber} 
              className="max-w-full"
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={() => setPageNumber(p => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
            >
              Previous
            </Button>
            <span className="py-2">Page {pageNumber} of {numPages}</span>
            <Button 
              onClick={() => setPageNumber(p => Math.min(numPages || p, p + 1))}
              disabled={pageNumber >= (numPages || 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
