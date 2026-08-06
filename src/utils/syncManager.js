import { io } from 'socket.io-client';

class SyncManager {
  constructor() {
    this.socket = null;
    this.broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('akkermann_dashboard_sync') : null;
    this.callbacks = {};
    this.isConnected = false;
    this.clientCount = 1;
  }

  init(callbacks = {}) {
    this.callbacks = callbacks;

    // Determine backend socket server URL dynamically
    const hostname = window.location.hostname || 'localhost';
    const protocol = window.location.protocol || 'http:';
    
    // Connect directly to port 3001 in local Vite dev mode, or window.location.origin in production (Render)
    const isViteDev = window.location.port === '5173' || window.location.port === '5174';
    const serverUrl = isViteDev 
      ? `${protocol}//${hostname}:3001` 
      : window.location.origin;

    console.log('[SyncManager] Connecting to sync server:', serverUrl);

    try {
      this.socket = io(serverUrl, {
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      this.socket.on('connect', () => {
        console.log('[SyncManager] Connected to multi-device sync server at', serverUrl);
        this.isConnected = true;
        if (this.callbacks.onConnectionChange) this.callbacks.onConnectionChange(true);
      });

      this.socket.on('disconnect', () => {
        console.warn('[SyncManager] Disconnected from sync server');
        this.isConnected = false;
        if (this.callbacks.onConnectionChange) this.callbacks.onConnectionChange(false);
      });

      this.socket.on('CLIENT_COUNT', (count) => {
        this.clientCount = count;
        if (this.callbacks.onClientCount) this.callbacks.onClientCount(count);
      });

      this.socket.on('INIT_STATE', (state) => {
        console.log('[SyncManager] Received initial state from server:', state);
        if (this.callbacks.onInitState) {
          this.callbacks.onInitState({
            buffer: state.excelBuffer,
            fileName: state.fileName,
            activeSheet: state.activeSheet,
            currentSlide: state.currentSlide,
            isPlaying: state.isPlaying
          });
        }
      });

      this.socket.on('EXCEL_UPDATED', (data) => {
        console.log('[SyncManager] Received EXCEL_UPDATED event from server:', data);
        if (this.callbacks.onExcelUpdated) {
          this.callbacks.onExcelUpdated(data);
        }
      });

      this.socket.on('INCIDENTS_UPDATED', (data) => {
        console.log('[SyncManager] Received INCIDENTS_UPDATED event from server:', data);
        if (this.callbacks.onIncidentsUpdated) {
          this.callbacks.onIncidentsUpdated(data);
        }
      });

      this.socket.on('NEWS_UPDATED', (data) => {
        console.log('[SyncManager] Received NEWS_UPDATED event from server:', data);
        if (this.callbacks.onNewsUpdated) {
          this.callbacks.onNewsUpdated(data);
        }
      });

      this.socket.on('EXCEL_SYNC', (data) => {
        console.log('[SyncManager] Received EXCEL_SYNC from another device:', data.fileName);
        if (data.buffer && this.callbacks.onExcelSync) {
          this.callbacks.onExcelSync({ buffer: data.buffer, fileName: data.fileName });
        }
      });

    } catch (err) {
      console.error('[SyncManager] Failed to initialize socket:', err);
    }

    // Local BroadcastChannel fallback / companion for same browser tabs
    if (this.broadcastChannel) {
      this.broadcastChannel.onmessage = (event) => {
        if (!event.data) return;
        if (event.data.type === 'EXCEL_SYNC' && this.callbacks.onExcelSync) {
          this.callbacks.onExcelSync({ buffer: event.data.buffer, fileName: event.data.fileName });
        }
      };
    }
  }

  // Upload Excel file via REST API to backend server
  async uploadExcel(arrayBuffer, fileName) {
    const hostname = window.location.hostname || 'localhost';
    const protocol = window.location.protocol || 'http:';
    const isViteDev = window.location.port === '5173' || window.location.port === '5174';
    
    const uploadUrl = isViteDev
      ? `${protocol}//${hostname}:3001/api/upload`
      : `${window.location.origin}/api/upload`;

    try {
      console.log('[SyncManager] Uploading Excel file to server via REST:', uploadUrl);
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-File-Name': encodeURIComponent(fileName)
        },
        body: arrayBuffer
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const resData = await response.json();
      console.log('[SyncManager] Upload successful:', resData);
      return resData;
    } catch (err) {
      console.warn('[SyncManager] REST upload failed, falling back to Socket emission:', err);
      if (this.socket && this.socket.connected) {
        this.socket.emit('EXCEL_UPLOAD', { buffer: arrayBuffer, fileName });
      }
    }
  }

  // Broadcast sheet change
  broadcastSheetChange(activeSheet) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('SHEET_CHANGE', { activeSheet });
    }
  }

  // Broadcast slide change
  broadcastSlideChange(currentSlide) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('SLIDE_CHANGE', { currentSlide });
    }
  }

  // Broadcast play/pause toggle
  broadcastPlayToggle(isPlaying) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('PLAY_TOGGLE', { isPlaying });
    }
  }
}

export const syncManager = new SyncManager();
