import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Trash2, Upload, Plus, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContent } from '@/contexts/ContentContext';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'books' | 'videos'>('books');
  const [videoUrl, setVideoUrl] = useState('');
  const [, setLocation] = useLocation();
  const { books, videos, addBook, removeBook, addVideo, removeVideo } = useContent();
  const { adminLogout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    adminLogout();
    toast({
      title: "Logged out",
      description: "You have been logged out of the admin panel."
    });
    setLocation('/');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (file.type === 'text/html' || file.type === 'text/markdown' || file.name.endsWith('.md')) {
        try {
          const content = await file.text();
          const title = file.name.replace(/\.(html|md)$/, '');
          
          addBook({
            id: Date.now() + Math.random(),
            title,
            content,
            level: 'beginner', // Default level
            icon: '📘'
          });

          toast({
            title: "Book uploaded",
            description: `"${title}" has been added to your library.`
          });
        } catch (error) {
          toast({
            title: "Upload failed",
            description: `Failed to upload "${file.name}".`,
            variant: "destructive"
          });
        }
      }
    }
    
    // Reset file input
    event.target.value = '';
  };

  const handleAddVideo = () => {
    if (!videoUrl.trim()) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL.",
        variant: "destructive"
      });
      return;
    }

    // Extract video ID from YouTube URL
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      toast({
        title: "Invalid YouTube URL",
        description: "Please enter a valid YouTube URL.",
        variant: "destructive"
      });
      return;
    }

    addVideo({
      id: Date.now(),
      title: `Video ${videos.length + 1}`,
      url: videoUrl,
      videoId,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      level: 'beginner'
    });

    toast({
      title: "Video added",
      description: "YouTube video has been added to your collection."
    });

    setVideoUrl('');
  };

  const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex mb-8 bg-white rounded-2xl p-2 shadow-sm">
          <button
            onClick={() => setActiveTab('books')}
            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
              activeTab === 'books'
                ? 'bg-purple-800 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📚 Books
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
              activeTab === 'videos'
                ? 'bg-purple-800 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🎥 Videos
          </button>
        </div>

        {/* Books Panel */}
        {activeTab === 'books' && (
          <div className="space-y-6">
            {/* Upload Section */}
            <Card className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Upload Books</h2>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".html,.md"
                  multiple
                  onChange={handleFileUpload}
                  className="flex-1"
                />
                <Upload className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Upload HTML or Markdown files to add to your book library
              </p>
            </Card>

            {/* Books List */}
            <Card className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Uploaded Books ({books.length})</h2>
              {books.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No books uploaded yet</p>
              ) : (
                <div className="space-y-3">
                  {books.map((book) => (
                    <div
                      key={book.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{book.icon}</span>
                        <div>
                          <h3 className="font-medium">{book.title}</h3>
                          <p className="text-sm text-gray-500">Level: {book.level}</p>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeBook(book.id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Videos Panel */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            {/* Add Video Section */}
            <Card className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Add YouTube Video</h2>
              <div className="flex gap-4">
                <Input
                  type="url"
                  placeholder="Enter YouTube URL..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddVideo}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Video
                </Button>
              </div>
            </Card>

            {/* Videos List */}
            <Card className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Video Collection ({videos.length})</h2>
              {videos.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No videos added yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className="bg-gray-50 rounded-xl overflow-hidden"
                    >
                      <div className="aspect-video bg-gray-200">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNDQuNSA5MEwxNjUgMTAzLjU5MVY3Ni40MDlMMTQ0LjUgOTBaIiBmaWxsPSIjOUI5QjlCIi8+Cjwvc3ZnPgo=';
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium mb-2">{video.title}</h3>
                        <p className="text-sm text-gray-500 mb-3">Level: {video.level}</p>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeVideo(video.id)}
                          className="w-full bg-red-500 hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}