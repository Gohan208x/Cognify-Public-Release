import React, { useState, useMemo, useEffect } from 'react';
import { resourceApi, SubjectDto, VideoLink } from '../src/api/resourceApi';
import {
  Library,
  Search,
  ArrowLeft,
  BookOpen,
  Flame,
  Youtube,
  FileText,
  PlayCircle,
  FolderOpen,
  Eye,
  X,
  Filter,
  Tag,
  Loader2
} from 'lucide-react';

// --- Component ---

export const ResourceHub: React.FC = () => {
  // Data State
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Navigation State
  const [selectedSubject, setSelectedSubject] = useState<SubjectDto | null>(null);
  const [activeCategory, setActiveCategory] = useState<'NOTES' | 'PYQ' | 'VIDEOS' | null>(null);

  // Filter & Search State
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Viewer State
  const [viewingResource, setViewingResource] = useState<{ url: string, title: string } | null>(null);

  // Fetch resources on mount
  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await resourceApi.getAllResources();
      setSubjects(response.subjects);
      setAvailableCourses(response.availableCourses);
    } catch (err) {
      console.error('Failed to load resources:', err);
      setError('Failed to load resources. Make sure the backend is running.');
    }
    setIsLoading(false);
  };

  // Filter subjects based on search and course filter
  const filteredSubjects = useMemo(() => {
    return subjects.filter(subject => {
      const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCourse = selectedCourse === 'ALL' ||
        subject.tags.some(tag => tag.toLowerCase() === selectedCourse.toLowerCase());
      return matchesSearch && matchesCourse;
    });
  }, [subjects, searchTerm, selectedCourse]);

  // --- Handlers ---

  const handleBack = () => {
    if (activeCategory) {
      setActiveCategory(null);
    } else if (selectedSubject) {
      setSelectedSubject(null);
    }
  };

  const openResource = (subject: string, folder: string, filename: string) => {
    const url = resourceApi.getFileUrl(subject, folder, filename);
    setViewingResource({ url, title: filename });
  };

  const closeViewer = () => {
    setViewingResource(null);
  };

  // --- Render Views ---

  // Loading State
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400">
        <Loader2 size={48} className="animate-spin mb-4" />
        <p>Loading resources...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400">
        <FolderOpen size={64} className="mb-6 opacity-30" />
        <h3 className="text-xl font-bold text-white mb-2">Failed to Load</h3>
        <p className="text-center max-w-md mb-4">{error}</p>
        <button
          onClick={loadResources}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500"
        >
          Retry
        </button>
      </div>
    );
  }

  // 1. Subject List View (Root)
  const renderSubjectList = () => (
    <div className="flex flex-col gap-6 h-full">
      {/* Filter Section */}
      <div className="space-y-4">
        {/* Course Filter Pills */}
        {availableCourses.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2 text-slate-400 mr-2">
              <Filter size={16} />
              <span className="text-sm font-medium">Filter:</span>
            </div>
            <button
              onClick={() => setSelectedCourse('ALL')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCourse === 'ALL'
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
            >
              All
            </button>
            {availableCourses.map(course => (
              <button
                key={course}
                onClick={() => setSelectedCourse(course)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCourse === course
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
              >
                {course}
              </button>
            ))}
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-slate-500" size={20} />
          </div>
          <input
            type="text"
            placeholder="Search for a subject (e.g., Java, Python)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary-500 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Subject Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-4 custom-scrollbar flex-1 content-start">
        {subjects.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500">
            <FolderOpen size={64} className="mb-6 opacity-30" />
            <h3 className="text-2xl font-bold text-white mb-2">No Subjects Found</h3>
            <p className="max-w-md text-center mb-4 leading-relaxed">
              Add subject folders to the <code className="bg-slate-800 px-2 py-1 rounded">resources/</code> directory.
            </p>
            <p className="text-sm text-slate-600">
              Each folder should contain: Notes/, PYQ/, youtube.txt, tags.txt
            </p>
          </div>
        ) : filteredSubjects.length > 0 ? (
          filteredSubjects.map((subject, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedSubject(subject)}
              className="group bg-slate-900 border border-slate-800 hover:border-primary-500/50 p-6 rounded-2xl cursor-pointer transition-all hover:bg-slate-800 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <FolderOpen size={64} />
              </div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-slate-800 group-hover:bg-primary-500/20 flex items-center justify-center text-primary-500 transition-colors shrink-0">
                  <Library size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors line-clamp-2 leading-tight">
                    {subject.name}
                  </h3>
                  {/* Tags */}
                  {subject.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {subject.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded-full"
                        >
                          <Tag size={10} />
                          {tag}
                        </span>
                      ))}
                      {subject.tags.length > 3 && (
                        <span className="text-xs text-slate-500">+{subject.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3 flex items-center gap-1 group-hover:text-primary-400/70 transition-colors">
                View Resources <ArrowLeft size={12} className="rotate-180" />
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-slate-500">
            <Search size={48} className="mx-auto mb-4 opacity-50" />
            <p>No subjects found matching your search or filter.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCourse('ALL'); }}
              className="mt-4 text-primary-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // 2. Subject Dashboard View (Selected Subject)
  const renderSubjectDashboard = () => {
    if (!selectedSubject) return null;

    const hasNotes = selectedSubject.noteFiles.length > 0;
    const hasPyq = selectedSubject.pyqFiles.length > 0;
    const hasVideos = selectedSubject.youtubeLinks.length > 0;

    return (
      <div className="flex flex-col h-full animate-fade-in">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">{selectedSubject.name}</h2>
            <p className="text-slate-400 text-sm">Select a resource category</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Notes Card */}
          <button
            onClick={() => setActiveCategory('NOTES')}
            disabled={!hasNotes}
            className={`h-48 rounded-2xl bg-gradient-to-br from-blue-600/10 to-blue-900/10 border border-blue-500/20 transition-all flex flex-col items-center justify-center gap-4 group ${hasNotes
                ? 'hover:border-blue-500 hover:from-blue-600/20 hover:to-blue-900/20 cursor-pointer'
                : 'opacity-50 cursor-not-allowed'
              }`}
          >
            <div className="p-4 rounded-full bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
              <BookOpen size={32} />
            </div>
            <span className="text-xl font-bold text-blue-100">Notes</span>
            <span className="text-xs text-blue-400/70">{selectedSubject.noteFiles.length} files</span>
          </button>

          {/* PYQ Card */}
          <button
            onClick={() => setActiveCategory('PYQ')}
            disabled={!hasPyq}
            className={`h-48 rounded-2xl bg-gradient-to-br from-orange-600/10 to-orange-900/10 border border-orange-500/20 transition-all flex flex-col items-center justify-center gap-4 group ${hasPyq
                ? 'hover:border-orange-500 hover:from-orange-600/20 hover:to-orange-900/20 cursor-pointer'
                : 'opacity-50 cursor-not-allowed'
              }`}
          >
            <div className="p-4 rounded-full bg-orange-500/20 text-orange-400 group-hover:scale-110 transition-transform">
              <Flame size={32} />
            </div>
            <span className="text-xl font-bold text-orange-100">PYQs</span>
            <span className="text-xs text-orange-400/70">{selectedSubject.pyqFiles.length} files</span>
          </button>

          {/* Videos Card */}
          <button
            onClick={() => setActiveCategory('VIDEOS')}
            disabled={!hasVideos}
            className={`h-48 rounded-2xl bg-gradient-to-br from-red-600/10 to-red-900/10 border border-red-500/20 transition-all flex flex-col items-center justify-center gap-4 group ${hasVideos
                ? 'hover:border-red-500 hover:from-red-600/20 hover:to-red-900/20 cursor-pointer'
                : 'opacity-50 cursor-not-allowed'
              }`}
          >
            <div className="p-4 rounded-full bg-red-500/20 text-red-400 group-hover:scale-110 transition-transform">
              <Youtube size={32} />
            </div>
            <span className="text-xl font-bold text-red-100">Lectures</span>
            <span className="text-xs text-red-400/70">{selectedSubject.youtubeLinks.length} videos</span>
          </button>
        </div>

        {/* Tags Section */}
        {selectedSubject.tags.length > 0 && (
          <div className="mt-8 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
              <Tag size={14} /> Relevant Courses
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedSubject.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-800 text-slate-300 text-sm rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 3. Content List View (Files or Videos)
  const renderContentList = () => {
    if (!selectedSubject || !activeCategory) return null;

    const categoryConfig = {
      NOTES: { title: 'Notes', files: selectedSubject.noteFiles, folder: 'Notes', icon: BookOpen, color: 'text-blue-400' },
      PYQ: { title: 'Previous Year Questions', files: selectedSubject.pyqFiles, folder: 'PYQ', icon: Flame, color: 'text-orange-400' },
      VIDEOS: { title: 'Video Lectures', files: [], folder: '', icon: Youtube, color: 'text-red-500' }
    };

    const config = categoryConfig[activeCategory];
    const Icon = config.icon;

    return (
      <div className="flex flex-col h-full animate-fade-in">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-slate-800 ${config.color}`}>
              <Icon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{config.title}</h2>
              <p className="text-slate-400 text-xs uppercase tracking-wider">{selectedSubject.name}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeCategory === 'VIDEOS' ? (
            // Video Links
            <div className="grid grid-cols-1 gap-3">
              {selectedSubject.youtubeLinks.map((video, idx) => (
                <a
                  key={idx}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-red-500/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-lg bg-slate-950 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                    <PlayCircle size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-slate-200 font-medium truncate group-hover:text-white">{video.title}</h4>
                    <p className="text-xs text-slate-500 truncate">{video.url}</p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            // PDF Files
            <div className="grid grid-cols-1 gap-3">
              {config.files.map((filename, idx) => (
                <div
                  key={idx}
                  onClick={() => openResource(selectedSubject.name, config.folder, filename)}
                  className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-600 hover:bg-slate-800 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <FileText className="text-slate-400 group-hover:text-primary-400" size={24} />
                    <span className="text-slate-200 font-medium truncate group-hover:text-white transition-colors">{filename}</span>
                  </div>
                  <button
                    className="p-2 text-slate-500 hover:text-primary-500 transition-colors"
                    title="View Resource"
                  >
                    <Eye size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Main Content Switcher */}
      {!selectedSubject && renderSubjectList()}
      {selectedSubject && !activeCategory && renderSubjectDashboard()}
      {selectedSubject && activeCategory && renderContentList()}

      {/* Internal PDF Viewer Modal */}
      {viewingResource && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 w-full max-w-6xl h-[90vh] rounded-2xl flex flex-col border border-slate-700 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950">
              <div className="flex items-center gap-3">
                <FileText className="text-primary-500" size={20} />
                <span className="text-white font-medium truncate max-w-md">{viewingResource.title}</span>
              </div>
              <button
                onClick={closeViewer}
                className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-slate-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 bg-slate-800 relative">
              <iframe
                src={viewingResource.url}
                className="w-full h-full"
                title="Resource Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};