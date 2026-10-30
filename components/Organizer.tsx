
import React, { useState, useEffect } from 'react';
import { Upload, FileText, Folder, Loader2, ArrowLeft, Eye, X, HardDrive, Smartphone, AlertTriangle, Monitor } from 'lucide-react';
import { detectSubjectFromFilename } from '../services/geminiService';

// Types for File System Access API
interface FileSystemHandle {
  kind: 'file' | 'directory';
  name: string;
}

export const Organizer: React.FC = () => {
  // Check if browser supports File System Access API
  const supportsFileSystem = 'showDirectoryPicker' in window;

  // Root Directory Handle (The main "Study" folder selected by user)
  const [rootHandle, setRootHandle] = useState<any>(null);

  // Mobile/Fallback State: Stores files in memory for the session since we can't persistent mount
  const [virtualFiles, setVirtualFiles] = useState<any[]>([]);

  // Navigation State
  const [currentDirHandle, setCurrentDirHandle] = useState<any>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [items, setItems] = useState<FileSystemHandle[]>([]);

  // Processing State
  const [processing, setProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Viewer State
  const [viewingFileUrl, setViewingFileUrl] = useState<string | null>(null);
  const [viewingFileName, setViewingFileName] = useState('');


  // 1. Select the Root Folder (Desktop)
  const selectRootFolder = async () => {
    try {
      // @ts-ignore - native browser API
      const handle = await window.showDirectoryPicker({
        id: 'study-root',
        mode: 'readwrite'
      });
      setRootHandle(handle);
      setCurrentDirHandle(handle);
      setCurrentPath([]);
      await listDirectory(handle);
    } catch (err) {
      console.error("Access denied or cancelled", err);
    }
  };

  // 1b. Mobile Fallback Setup
  const initializeMobileMode = () => {
    // We create a fake root handle structure for virtual mode
    setRootHandle({ kind: 'virtual-root', name: 'Mobile Storage' });
    setCurrentDirHandle({ kind: 'virtual-root', name: 'Mobile Storage' });
  };

  // 2. List contents
  const listDirectory = async (dirHandle: any) => {
    const newItems: FileSystemHandle[] = [];

    if (supportsFileSystem && dirHandle.kind !== 'virtual-root') {
      try {
        for await (const entry of dirHandle.values()) {
          newItems.push(entry);
        }
      } catch (e) {
        console.error("Error reading directory", e);
      }
    } else {
      // Virtual Mode (Mobile)
      // Filter virtualFiles based on currentPath logic (simplified for flat structure + subject folders)
      // In this virtual mode, we only have 1 level of depth: Subject Folders -> Files

      if (currentPath.length === 0) {
        // List unique Subjects (folders)
        const subjects = new Set(virtualFiles.map(f => f.subject));
        subjects.forEach(sub => {
          newItems.push({ kind: 'directory', name: sub } as FileSystemHandle);
        });
      } else {
        // We are in a subject folder, list files
        const subject = currentPath[0];
        const filesInSubject = virtualFiles.filter(f => f.subject === subject);
        filesInSubject.forEach(f => {
          newItems.push({ kind: 'file', name: f.file.name } as FileSystemHandle);
        });
      }
    }

    // Sort: Folders first, then files
    newItems.sort((a, b) => {
      if (a.kind === b.kind) return a.name.localeCompare(b.name);
      return a.kind === 'directory' ? -1 : 1;
    });
    setItems(newItems);
  };

  // 3. Enter a folder
  const openFolder = async (folderHandle: any) => {
    setCurrentDirHandle(folderHandle);
    setCurrentPath(prev => [...prev, folderHandle.name]);

    if (supportsFileSystem && folderHandle.kind !== 'virtual-root' && folderHandle.values) {
      await listDirectory(folderHandle);
    } else {
      // For virtual mode, listDirectory logic handles the path state update
      // We need to trigger a re-render/re-calc
      // We defer to the useEffect or direct call, let's call direct:
      // Hack: we need to pass the "new" path logically, but listDirectory reads state.
      // Let's rely on the state update in useEffect.
    }
  };

  // Effect to refresh list when path changes in Virtual Mode
  useEffect(() => {
    if (rootHandle && (!supportsFileSystem || rootHandle.kind === 'virtual-root')) {
      listDirectory(currentDirHandle);
    }
  }, [currentPath, virtualFiles]);

  // 4. Go back up
  const navigateUp = async () => {
    if (currentPath.length === 0 || !rootHandle) return;

    const newPath = [...currentPath];
    newPath.pop();

    if (supportsFileSystem && rootHandle.kind !== 'virtual-root') {
      let target = rootHandle;
      for (const folderName of newPath) {
        target = await target.getDirectoryHandle(folderName);
      }
      setCurrentDirHandle(target);
      await listDirectory(target);
    }

    setCurrentPath(newPath);
    // Virtual mode useEffect handles the rest
  };

  // 5. Open PDF File
  const openFile = async (fileHandle: any) => {
    try {
      let file;
      if (supportsFileSystem && fileHandle.getFile) {
        file = await fileHandle.getFile();
      } else {
        // Virtual Mode
        const subject = currentPath[0];
        const vFile = virtualFiles.find(vf => vf.subject === subject && vf.file.name === fileHandle.name);
        if (vFile) file = vFile.file;
      }

      if (file) {
        const url = URL.createObjectURL(file);
        setViewingFileUrl(url);
        setViewingFileName(file.name);
      }
    } catch (e) {
      alert("Could not open file.");
    }
  };

  const closeViewer = () => {
    if (viewingFileUrl) URL.revokeObjectURL(viewingFileUrl);
    setViewingFileUrl(null);
    setViewingFileName('');
  };

  // 6. Handle File Upload & Organization
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!rootHandle) {
      alert("Please select a Root Study Folder first!");
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type !== 'application/pdf') {
        alert("Only PDF files are supported currently.");
        return;
      }
      await organizeFile(file);
    }
  };

  const organizeFile = async (file: File) => {
    setProcessing(true);
    setStatusMsg(`Analyzing: ${file.name}...`);

    try {
      // A. AI Detection
      const subject = await detectSubjectFromFilename(file.name);
      setStatusMsg(`Detected Subject: ${subject}`);

      if (supportsFileSystem && rootHandle.kind !== 'virtual-root') {
        // Desktop: Write to disk
        const subjectDirHandle = await rootHandle.getDirectoryHandle(subject, { create: true });
        const newFileHandle = await subjectDirHandle.getFileHandle(file.name, { create: true });
        const writable = await newFileHandle.createWritable();
        await writable.write(file);
        await writable.close();
        await listDirectory(currentDirHandle);
      } else {
        // Mobile/Virtual: Store in memory
        setVirtualFiles(prev => [...prev, { file, subject }]);
      }

      setStatusMsg(`Saved to /${subject}/${file.name}`);

      setTimeout(() => {
        setProcessing(false);
        setStatusMsg('');
      }, 1500);

    } catch (error) {
      console.error(error);
      setStatusMsg("Error saving file.");
      setProcessing(false);
    }
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(file => {
        if (file.type === 'application/pdf') organizeFile(file);
      });
    }
  };

  // --- RENDER ---

  if (!rootHandle) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6 text-center p-4 md:p-8 animate-fade-in">
        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
          {supportsFileSystem ? <HardDrive size={48} className="text-primary-500" /> : <Smartphone size={48} className="text-primary-500" />}
        </div>
        <h2 className="text-3xl font-bold text-white">Setup Local Library</h2>

        {supportsFileSystem ? (
          <>
            <p className="text-slate-400 max-w-md">
              To enable offline access and automatic organization, please select a folder on your computer.
            </p>
            <button
              onClick={selectRootFolder}
              className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-primary-500/20 transition-all flex items-center gap-3"
            >
              <Folder size={24} /> Select Study Folder
            </button>
          </>
        ) : (
          <>
            <p className="text-slate-400 max-w-md">
              On mobile, files are organized in your current session. Upload PDFs to auto-sort them by subject using AI.
            </p>
            <button
              onClick={initializeMobileMode}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-3"
            >
              <Upload size={24} /> Start Uploading
            </button>
          </>
        )}

        <p className="text-xs text-slate-500 mt-8">
          Note: Your files stay on your device. We don't store your data.
        </p>

        {/* Universal Development Notice */}
        <div className="mt-6 max-w-md w-full bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-yellow-400 animate-pulse" />
            <p className="text-yellow-400 font-medium text-sm">Android & iOS Support</p>
          </div>
          <p className="text-slate-400 text-xs">This feature is still in development for mobile devices. Check back soon for updates!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6 relative">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <HardDrive className="text-emerald-500" /> Local Library
          </h2>
          <div className="flex items-center gap-2 text-sm text-slate-400 mt-1 font-mono overflow-x-auto">
            <span className="opacity-50">root</span>
            {currentPath.map((p, i) => (
              <React.Fragment key={i}>
                <span>/</span>
                <span className="text-primary-400 whitespace-nowrap">{p}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
        {currentPath.length > 0 && (
          <button
            onClick={navigateUp}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">

        {/* Left: Upload Zone */}
        <div
          className="lg:col-span-1 border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-2xl flex flex-col items-center justify-center p-6 text-center hover:border-primary-500/50 transition-colors relative"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {processing ? (
            <div className="animate-fade-in flex flex-col items-center">
              <Loader2 className="animate-spin text-primary-500 mb-4" size={40} />
              <p className="text-white font-medium">{statusMsg}</p>
            </div>
          ) : (
            <>
              <div className="p-4 bg-slate-800 rounded-full mb-4">
                <Upload className="text-primary-500" size={32} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {supportsFileSystem ? "Drop PDF to Organize" : "Upload PDFs"}
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                AI will detect the subject and save it to the correct folder automatically.
              </p>
              <label className="w-full md:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer text-sm font-bold transition-colors flex items-center justify-center gap-2">
                <Upload size={16} /> Select Files
                <input type="file" className="hidden" accept=".pdf" multiple onChange={handleManualUpload} />
              </label>
            </>
          )}
        </div>

        {/* Right: File Explorer */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-y-auto custom-scrollbar min-h-[300px]">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
              <Folder size={48} className="mb-2" />
              <p>Empty Folder</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => item.kind === 'directory' ? openFolder(item) : openFile(item)}
                  className="flex items-center p-3 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors group border border-transparent hover:border-slate-700"
                >
                  <div className="mr-4">
                    {item.kind === 'directory' ? (
                      <Folder className="text-yellow-500" size={24} />
                    ) : (
                      <FileText className="text-blue-400" size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 font-medium truncate group-hover:text-white transition-colors">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500 uppercase">{item.kind}</p>
                  </div>
                  {item.kind === 'file' && (
                    <div className="opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 bg-slate-700 rounded-full text-slate-300 hover:text-white">
                        <Eye size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Internal PDF Viewer Modal */}
      {viewingFileUrl && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 w-full max-w-6xl h-[90vh] rounded-2xl flex flex-col border border-slate-700 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="text-primary-500 shrink-0" size={20} />
                <span className="text-white font-medium truncate">{viewingFileName}</span>
              </div>
              <button
                onClick={closeViewer}
                className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-slate-400 transition-colors shrink-0"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 bg-slate-800 relative">
              <iframe
                src={viewingFileUrl}
                className="w-full h-full"
                title="PDF Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
