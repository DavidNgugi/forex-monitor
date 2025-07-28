import React, { useState, useRef, useEffect } from 'react';
import { Play, Plus, X, Youtube, Maximize2, Minimize2, Move, Volume2, VolumeX } from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';

interface YouTubeStream {
  id: string;
  title: string;
  channelId: string;
  videoId: string;
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface ActivePlayer {
  streamId: string;
  isFullscreen: boolean;
  position: Position;
  size: Size;
}

const YouTubePanel: React.FC = () => {  
  const { colors } = useTheme();
  const [streams, setStreams] = useState<YouTubeStream[]>([
    {
      id: '1',
      title: 'Bloomberg Markets Live',
      channelId: 'bloomberg',
      videoId: 'iEpJwprxDdk'
    },
    {
      id: '2',
      title: 'CNBC Live',
      channelId: 'cnbc',
      videoId: '9WiV_8fC5iY'
    }
  ]);
  
  // Track multiple active players
  const [activePlayers, setActivePlayers] = useState<ActivePlayer[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStreamUrl, setNewStreamUrl] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  
  // Drag and resize state for floating windows
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [resizeOffset, setResizeOffset] = useState<Position>({ x: 0, y: 0 });
  const [draggingPlayerId, setDraggingPlayerId] = useState<string | null>(null);
  const [resizingPlayerId, setResizingPlayerId] = useState<string | null>(null);
  
  const videoRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const iframeRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const createYouTubeIframe = (videoId: string): HTMLElement => {
    try {
      console.log('Creating iframe for video:', videoId);
      const iframe = document.createElement('iframe');
      iframe.width = '100%';
      iframe.height = '100%';
      iframe.src = `https://www.youtube.com/embed/${videoId}?controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=0&disablekb=1&cc_load_policy=0&color=white`;
      iframe.title = 'YouTube video player';
      iframe.frameBorder = '0';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;
      iframe.className = 'rounded-t-lg';
      
      console.log('Iframe created with src:', iframe.src);
      
      // Add error handling for Trusted Types
      iframe.onerror = () => {
        console.warn('YouTube iframe failed to load, this might be due to Trusted Types restrictions');
      };
      
      return iframe;
    } catch (error) {
      console.error('Failed to create YouTube iframe:', error);
      // Create a fallback div with a message
      const fallbackDiv = document.createElement('div');
      fallbackDiv.className = 'flex items-center justify-center h-full bg-gray-800 text-white text-center p-4';
      fallbackDiv.innerHTML = `
        <div>
          <p class="text-sm mb-2">YouTube video cannot be loaded</p>
          <p class="text-xs text-gray-400">This might be due to browser security restrictions</p>
          <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" class="text-blue-400 hover:text-blue-300 text-xs mt-2 inline-block">
            Open in YouTube
          </a>
        </div>
      `;
      return fallbackDiv;
    }
  };

  const handleAddStream = () => {
    const videoId = extractVideoId(newStreamUrl);
    if (videoId) {
      const newStream: YouTubeStream = {
        id: Date.now().toString(),
        title: 'Custom Stream',
        channelId: 'custom',
        videoId: videoId
      };
      setStreams([...streams, newStream]);
      setNewStreamUrl('');
      setShowAddForm(false);
    }
  };

  const handleRemoveStream = (streamId: string) => {
    setStreams(streams.filter(s => s.id !== streamId));
    // Remove from active players
    setActivePlayers(activePlayers.filter(p => p.streamId !== streamId));
    // Clean up iframe ref
    delete iframeRefs.current[streamId];
  };

  const startPlayer = (streamId: string, inFullscreen: boolean = false) => {
    const stream = streams.find(s => s.id === streamId);
    if (!stream) return;

    // If player already exists, just toggle fullscreen
    const existingPlayer = activePlayers.find(p => p.streamId === streamId);
    if (existingPlayer) {
      if (inFullscreen && !existingPlayer.isFullscreen) {
        // Move to fullscreen
        setActivePlayers(activePlayers.map(p => 
          p.streamId === streamId 
            ? { ...p, isFullscreen: true, position: { x: 100, y: 100 }, size: { width: 640, height: 480 } }
            : p
        ));
      } else if (!inFullscreen && existingPlayer.isFullscreen) {
        // Move back to panel
        setActivePlayers(activePlayers.map(p => 
          p.streamId === streamId 
            ? { ...p, isFullscreen: false }
            : p
        ));
      }
      return;
    }

    // Create new player
    const newPlayer: ActivePlayer = {
      streamId,
      isFullscreen: inFullscreen,
      position: inFullscreen ? { x: 100, y: 100 } : { x: 0, y: 0 },
      size: { width: 640, height: 480 }
    };

    setActivePlayers([...activePlayers, newPlayer]);
  };

  const stopPlayer = (streamId: string) => {
    setActivePlayers(activePlayers.filter(p => p.streamId !== streamId));
    // Clean up iframe ref
    delete iframeRefs.current[streamId];
  };

  const toggleFullscreen = (streamId: string) => {
    const player = activePlayers.find(p => p.streamId === streamId);
    if (!player) return;

    if (player.isFullscreen) {
      // Move back to panel
      setActivePlayers(activePlayers.map(p => 
        p.streamId === streamId 
          ? { ...p, isFullscreen: false }
          : p
      ));
    } else {
      // Move to fullscreen
      setActivePlayers(activePlayers.map(p => 
        p.streamId === streamId 
          ? { ...p, isFullscreen: true, position: { x: 100, y: 100 }, size: { width: 640, height: 480 } }
          : p
      ));
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleMouseDown = (e: React.MouseEvent, playerId: string) => {
    const player = activePlayers.find(p => p.streamId === playerId);
    if (!player || !player.isFullscreen) return;
    
    // Prevent iframe from capturing the event
    e.preventDefault();
    e.stopPropagation();
    
    const videoRef = videoRefs.current[playerId];
    const rect = videoRef?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
      setDraggingPlayerId(playerId);
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent, playerId: string, corner: 'se' | 'sw' | 'ne' | 'nw') => {
    const player = activePlayers.find(p => p.streamId === playerId);
    if (!player || !player.isFullscreen) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Calculate offset based on which corner is being dragged
    let offsetX = 0;
    let offsetY = 0;
    
    if (corner === 'se') {
      offsetX = e.clientX - (player.position.x + player.size.width);
      offsetY = e.clientY - (player.position.y + player.size.height);
    } else if (corner === 'sw') {
      offsetX = e.clientX - player.position.x;
      offsetY = e.clientY - (player.position.y + player.size.height);
    } else if (corner === 'ne') {
      offsetX = e.clientX - (player.position.x + player.size.width);
      offsetY = e.clientY - player.position.y;
    } else if (corner === 'nw') {
      offsetX = e.clientX - player.position.x;
      offsetY = e.clientY - player.position.y;
    }
    
    setResizeOffset({ x: offsetX, y: offsetY });
    setIsResizing(true);
    setResizingPlayerId(playerId);
  };

  const handleMouseMove = (e: MouseEvent) => {
    // Prevent default to avoid iframe interference
    e.preventDefault();
    
    if (isDragging && draggingPlayerId) {
      const player = activePlayers.find(p => p.streamId === draggingPlayerId);
      if (!player) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - player.size.width;
      const maxY = window.innerHeight - player.size.height;
      
      setActivePlayers(activePlayers.map(p => 
        p.streamId === draggingPlayerId
          ? { ...p, position: {
              x: Math.max(0, Math.min(newX, maxX)),
              y: Math.max(0, Math.min(newY, maxY))
            }}
          : p
      ));
    }
    
    if (isResizing && resizingPlayerId) {
      const player = activePlayers.find(p => p.streamId === resizingPlayerId);
      if (!player) return;

      // Calculate new dimensions based on mouse position and offset
      const newWidth = e.clientX - player.position.x - resizeOffset.x;
      const newHeight = e.clientY - player.position.y - resizeOffset.y;
      
      // Minimum size constraints
      const minWidth = 400;
      const minHeight = 300;
      
      // Maximum size constraints (keep within viewport)
      const maxWidth = window.innerWidth - player.position.x;
      const maxHeight = window.innerHeight - player.position.y;
      
      // For now, we'll implement the southeast corner (original behavior)
      // This can be expanded to handle all corners based on stored corner info
      const newSize = {
        width: Math.max(minWidth, Math.min(newWidth, maxWidth)),
        height: Math.max(minHeight, Math.min(newHeight, maxHeight))
      };
      
      setActivePlayers(activePlayers.map(p => 
        p.streamId === resizingPlayerId
          ? { ...p, size: newSize }
          : p
      ));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setDraggingPlayerId(null);
    setResizingPlayerId(null);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, resizeOffset, activePlayers]);

  // Create iframes for active players - only when players are added/removed
  useEffect(() => {
    activePlayers.forEach(player => {
      const stream = streams.find(s => s.id === player.streamId);
      if (!stream) return;

      const videoRef = videoRefs.current[player.streamId];
      if (!videoRef) return;

      // Only create iframe if it doesn't already exist
      if (!iframeRefs.current[player.streamId]) {
        const container = videoRef;
        let videoContainer = container.querySelector('.video-container');
        
        if (!videoContainer) {
          videoContainer = container;
        }
        
        if (videoContainer) {
          videoContainer.innerHTML = '';
          const iframe = createYouTubeIframe(stream.videoId);
          videoContainer.appendChild(iframe);
          iframeRefs.current[player.streamId] = iframe;
        }
      }
    });
  }, [activePlayers.map(p => p.streamId), streams]); // Only depend on stream IDs, not full player objects

  // Get players in panel vs fullscreen
  const panelPlayers = activePlayers.filter(p => !p.isFullscreen);
  const fullscreenPlayers = activePlayers.filter(p => p.isFullscreen);

  return (
    <>
      {/* Floating Windows */}
      {fullscreenPlayers.map(player => {
        const stream = streams.find(s => s.id === player.streamId);
        if (!stream) return null;

        return (
          <div
            key={player.streamId}
                         ref={(el) => { videoRefs.current[player.streamId] = el; }}
            className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200"
            style={{
              left: `${player.position.x}px`,
              top: `${player.position.y}px`,
              width: `${player.size.width}px`,
              height: `${player.size.height}px`,
              cursor: isDragging && draggingPlayerId === player.streamId ? 'grabbing' : 'grab',
            }}
            onMouseDown={(e) => handleMouseDown(e, player.streamId)}
          >
            {/* Window Header */}
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-t-lg border-b">
              <div className="flex items-center space-x-2">
                <Youtube className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium truncate">{stream.title}</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => toggleFullscreen(player.streamId)}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                  title="Minimize"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => stopPlayer(player.streamId)}
                  className="text-gray-600 hover:text-red-600 transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Video Container */}
            <div className="relative flex-1 h-full video-container" style={{ minHeight: '300px' }}>
              {/* Iframe will be inserted here by useEffect */}
            </div>
            
            {/* Resize Handles */}
            {/* Southeast corner */}
            <div 
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-10"
              onMouseDown={(e) => handleResizeMouseDown(e, player.streamId, 'se')}
            >
              <div className="w-0 h-0 border-l-8 border-l-transparent border-t-8 border-t-gray-400"></div>
            </div>
            
            {/* Southwest corner */}
            <div 
              className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-10"
              onMouseDown={(e) => handleResizeMouseDown(e, player.streamId, 'sw')}
            >
              <div className="w-0 h-0 border-r-8 border-r-transparent border-t-8 border-t-gray-400"></div>
            </div>
            
            {/* Northeast corner */}
            <div 
              className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-10"
              onMouseDown={(e) => handleResizeMouseDown(e, player.streamId, 'ne')}
            >
              <div className="w-0 h-0 border-l-8 border-l-transparent border-b-8 border-b-gray-400"></div>
            </div>
            
            {/* Northwest corner */}
            <div 
              className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-10"
              onMouseDown={(e) => handleResizeMouseDown(e, player.streamId, 'nw')}
            >
              <div className="w-0 h-0 border-r-8 border-r-transparent border-b-8 border-b-gray-400"></div>
            </div>
          </div>
        );
      })}

      {/* Main Panel */}
      <div ref={panelRef} className="h-full flex flex-col">
        <div className={`p-4 ${colors.border.primary} border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Youtube className={`w-5 h-5 ${colors.status.error}`} />
              <h3 className={`font-semibold ${colors.text.primary}`}>Live Streams</h3>
              {activePlayers.length > 0 && (
                <span className={`text-xs ${colors.status.info}/100 ${colors.status.info}/800 px-2 py-1 rounded-full`}>
                  {activePlayers.length} active
                </span>
              )}
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`${colors.text.muted} hover:${colors.status.info} transition-colors`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {showAddForm && (
            <div className="mt-3 space-y-2">
              <input
                type="text"
                placeholder="YouTube URL"
                value={newStreamUrl}
                onChange={(e) => setNewStreamUrl(e.target.value)}
                className={`w-full text-sm p-2 ${colors.border.secondary} border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${colors.background.secondary} ${colors.text.primary}`}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleAddStream}
                  className={`flex-1 text-sm ${colors.button.primary} px-3 py-1 rounded transition-colors`}
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className={`flex-1 text-sm ${colors.button.secondary} px-3 py-1 rounded transition-colors`}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Active Players in Panel */}
          {panelPlayers.length > 0 && (
            <div className={`p-4 ${colors.border.primary} border-b ${colors.background.tertiary}`}>
              <h4 className={`text-sm font-medium ${colors.text.secondary} mb-3`}>Active Players</h4>
              <div className="space-y-3">
                {panelPlayers.map(player => {
                  const stream = streams.find(s => s.id === player.streamId);
                  if (!stream) return null;

                  return (
                    <div key={player.streamId} className={`${colors.background.card} rounded-lg ${colors.border.primary} border`}>
                      <div 
                        ref={(el) => { videoRefs.current[player.streamId] = el; }}
                        className="aspect-video bg-black video-container"
                      >
                        {/* Iframe will be inserted here by useEffect */}
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        <span className={`text-sm font-medium truncate ${colors.text.primary}`}>{stream.title}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleFullscreen(player.streamId)}
                            className={`${colors.text.secondary} hover:${colors.text.primary} transition-colors`}
                            title="Fullscreen"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => stopPlayer(player.streamId)}
                            className={`${colors.text.secondary} hover:${colors.status.error} transition-colors`}
                            title="Stop"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stream List */}
          <div className="p-4 space-y-2">
            {streams.map((stream) => {
              const isActive = activePlayers.some(p => p.streamId === stream.id);
              
              return (
                <div
                  key={stream.id}
                  className={`flex items-center justify-between p-3 ${colors.background.tertiary} rounded-lg hover:${colors.background.secondary} transition-colors`}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <Play className={`w-4 h-4 ${isActive ? colors.status.success : colors.status.error} flex-shrink-0`} />
                    <span className={`text-sm font-medium truncate ${colors.text.primary}`}>{stream.title}</span>
                    {isActive && (
                      <span className={`text-xs ${colors.status.success}/100 ${colors.status.success}/800 px-2 py-1 rounded-full`}>
                        Playing
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {!isActive ? (
                      <>
                        <button
                          onClick={() => startPlayer(stream.id, false)}
                          className={`text-xs ${colors.status.error} text-white px-2 py-1 rounded hover:${colors.status.error} transition-colors`}
                        >
                          Play in Panel
                        </button>
                        <button
                          onClick={() => startPlayer(stream.id, true)}
                          className={`text-xs ${colors.status.info} text-white px-2 py-1 rounded hover:${colors.status.info} transition-colors`}
                        >
                          Open Window
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => stopPlayer(stream.id)}
                        className={`text-xs ${colors.text.muted} text-white px-2 py-1 rounded hover:${colors.text.secondary} transition-colors`}
                      >
                        Stop
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveStream(stream.id)}
                      className={`${colors.text.muted} hover:${colors.status.error} transition-colors`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}

            {streams.length === 0 && (
              <div className={`text-center ${colors.text.tertiary} py-8`}>
                <Youtube className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No streams added</p>
                <p className="text-xs">Add YouTube live streams to watch</p>
              </div>
            )}
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className={`${colors.border.primary} border-t ${colors.background.tertiary} p-3`}>
          <div className={`text-xs ${colors.status.info} font-medium mb-1`}>🚀 Coming Soon:</div>
          <div className={`text-xs ${colors.text.accent} space-y-1`}>
            <div>• AI-powered rate predictions</div>
            <div>• Advanced technical analysis</div>
            <div>• Social sentiment tracking</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default YouTubePanel;
