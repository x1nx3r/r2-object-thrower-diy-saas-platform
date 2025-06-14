"use client";

import { useState, useEffect } from "react";

export default function DebugConsole() {
  const [logs, setLogs] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [filter, setFilter] = useState("all"); // all, info, warn, error

  // Add log entry
  const addLog = (level, message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp,
      level,
      message,
      data,
    };

    setLogs((prev) => [logEntry, ...prev].slice(0, 100)); // Keep last 100 logs
  };

  // Expose addLog globally for use in other components
  useEffect(() => {
    window.debugLog = addLog;

    // Clean up on unmount
    return () => {
      delete window.debugLog;
    };
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogIcon = (level) => {
    switch (level) {
      case "error":
        return "🔴";
      case "warn":
        return "🟡";
      case "info":
        return "🔵";
      case "success":
        return "🟢";
      default:
        return "⚪";
    }
  };

  const getLogColor = (level) => {
    switch (level) {
      case "error":
        return "text-red-600";
      case "warn":
        return "text-yellow-600";
      case "info":
        return "text-blue-600";
      case "success":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const filteredLogs = logs.filter(
    (log) => filter === "all" || log.level === filter,
  );

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition z-50"
        title="Show Debug Console"
      >
        🐛
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-80 bg-gray-900 text-white rounded-lg shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🐛</span>
          <span className="font-semibold">Debug Console</span>
          <span className="text-xs bg-gray-700 px-2 py-1 rounded">
            {filteredLogs.length} logs
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-700 text-white text-xs px-2 py-1 rounded border-none"
          >
            <option value="all">All</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
          </select>
          <button
            onClick={clearLogs}
            className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition"
          >
            Clear
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-2xl mb-2">📋</div>
            <p className="text-sm">No logs yet</p>
            <p className="text-xs">Upload a file to see debug information</p>
          </div>
        ) : (
          filteredLogs.map((log) => <LogEntry key={log.id} log={log} />)
        )}
      </div>
    </div>
  );
}

function LogEntry({ log }) {
  const [expanded, setExpanded] = useState(false);

  const getLogColor = (level) => {
    switch (level) {
      case "error":
        return "text-red-400";
      case "warn":
        return "text-yellow-400";
      case "info":
        return "text-blue-400";
      case "success":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const getLogIcon = (level) => {
    switch (level) {
      case "error":
        return "🔴";
      case "warn":
        return "🟡";
      case "info":
        return "🔵";
      case "success":
        return "🟢";
      default:
        return "⚪";
    }
  };

  return (
    <div className="bg-gray-800 rounded p-2 text-xs">
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start space-x-2 flex-1 min-w-0">
          <span>{getLogIcon(log.level)}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">{log.timestamp}</span>
              <span className={`font-medium ${getLogColor(log.level)}`}>
                {log.level.toUpperCase()}
              </span>
            </div>
            <div className="text-white mt-1 break-words">{log.message}</div>
          </div>
        </div>
        {log.data && (
          <span className="text-gray-500 ml-2">{expanded ? "▼" : "▶"}</span>
        )}
      </div>

      {expanded && log.data && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <pre className="text-gray-300 overflow-x-auto whitespace-pre-wrap">
            {typeof log.data === "string"
              ? log.data
              : JSON.stringify(log.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
