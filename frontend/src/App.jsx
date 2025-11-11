import { useState, useEffect } from 'react';
import { 
  HardDrive, 
  Play, 
  Save, 
  Trash2, 
  Settings, 
  Terminal,
  FileText,
  Search,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  Brain,
  FileDown,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Moon,
  Sun,
  Filter,
  Clock,
  TrendingUp,
  Zap,
  Target,
  Database,
  Network,
  Cpu,
  BarChart3,
  PieChart,
  Activity,
  Bookmark,
  Star,
  Download,
  Share2,
  Copy,
  Shield,
  RefreshCw,
  Maximize2,
  Minimize2,
  Grid,
  List,
  Calendar,
  Table,
  Code,
  ChevronDown,
  ChevronRight,
  Hash,
  Bot,
  Settings as Cog,
  FileText as FileReport,
  BarChart2,
  TrendingUp as Timeline,
  Layers3 as Layers,
  GitBranch as Workflow,
  Clock4,
  User,
  Folder,
  FileIcon,
  Globe,
  Grid as TableIcon
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [availablePlugins, setAvailablePlugins] = useState([]);
  const [selectedPlugins, setSelectedPlugins] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState({});
  const [scanProgress, setScanProgress] = useState({ completed: 0, total: 0, currentPlugin: '' });
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [activeTab, setActiveTab] = useState('scan');
  const [aiReport, setAiReport] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [viewMode, setViewMode] = useState('raw'); // 'raw' or 'report'
  const [quickSummary, setQuickSummary] = useState('');
  const [expandedItems, setExpandedItems] = useState({}); // Track expanded items in structured view
  const [paginationSettings, setPaginationSettings] = useState({
    'windows.pslist': 1,
    'windows.filescan': 1,
    'windows.netscan': 1,
    'windows.handles': 1,
    'windows.modscan': 1,
    'default': 1
  }); // Items per page for each plugin - 1 item per page for detailed view
  const [currentPages, setCurrentPages] = useState({}); // Current page for each plugin
  
  // Automatic Report Mode
  const [analysisMode, setAnalysisMode] = useState(null); // null, 'automatic', 'plugin'
  const [isGeneratingAutoReport, setIsGeneratingAutoReport] = useState(false);
  const [autoReportProgress, setAutoReportProgress] = useState({ phase: '', progress: 0, message: '' });
  const [autoReport, setAutoReport] = useState(null);
  const [showModeSelection, setShowModeSelection] = useState(false);

  // Table View Component
  const TableDataViewer = ({ data, plugin }) => {
    const openTableInNewTab = () => {
      let parsedData;
      try {
        parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      } catch {
        return;
      }

      if (!Array.isArray(parsedData) || parsedData.length === 0) return;

      // Get all unique keys from all items
      const allKeys = [...new Set(parsedData.flatMap(item => Object.keys(item)))];
      
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>MemHawk - ${plugin} Table View</title>
              <style>
                body { 
                  font-family: 'Monaco', 'Consolas', monospace; 
                  background: #0f172a; 
                  color: #e2e8f0; 
                  margin: 0; 
                  padding: 20px; 
                }
                .container { max-width: 100%; margin: 0 auto; }
                .header { 
                  background: linear-gradient(135deg, #1e293b, #334155); 
                  padding: 20px; 
                  border-radius: 10px; 
                  margin-bottom: 20px; 
                  border: 1px solid #475569;
                  position: sticky;
                  top: 0;
                  z-index: 100;
                }
                .table-container {
                  background: #1e293b; 
                  border-radius: 10px; 
                  border: 1px solid #475569;
                  overflow-x: auto;
                }
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  min-width: 800px;
                }
                th { 
                  background: #334155; 
                  color: #fbbf24; 
                  padding: 12px 8px; 
                  text-align: left; 
                  border-bottom: 2px solid #475569;
                  position: sticky;
                  top: 0;
                  font-weight: bold;
                  white-space: nowrap;
                }
                td { 
                  padding: 8px; 
                  border-bottom: 1px solid #374151; 
                  vertical-align: top;
                  max-width: 200px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }
                tr:hover { background: #374151; }
                .null { color: #9ca3af; font-style: italic; }
                .string { color: #34d399; }
                .number { color: #f472b6; }
                .boolean { color: #a78bfa; }
                .expand-btn {
                  background: #3b82f6;
                  color: white;
                  border: none;
                  padding: 2px 6px;
                  border-radius: 3px;
                  cursor: pointer;
                  font-size: 10px;
                  margin-left: 5px;
                }
                .expand-btn:hover { background: #2563eb; }
                .timeline-section {
                  margin: 20px 0;
                  padding: 20px;
                  background: #1e293b;
                  border-radius: 10px;
                  border: 1px solid #475569;
                }
                .timeline-stats {
                  display: flex;
                  gap: 20px;
                  margin-bottom: 20px;
                }
                .stat-box {
                  background: #374151;
                  padding: 10px 15px;
                  border-radius: 8px;
                  border: 1px solid #4b5563;
                  color: #e5e7eb;
                  font-size: 14px;
                }
                .timeline-graph {
                  display: flex;
                  align-items: end;
                  gap: 2px;
                  padding: 20px 0;
                  margin: 20px 0;
                  background: #0f172a;
                  border-radius: 8px;
                  border: 1px solid #374151;
                  overflow-x: auto;
                  min-height: 80px;
                }
                .timeline-bar {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  min-width: 30px;
                  position: relative;
                  cursor: pointer;
                  margin: 0 1px;
                }
                .timeline-bar:hover {
                  opacity: 0.8;
                }
                .bar-fill {
                  width: 20px;
                  border-radius: 2px 2px 0 0;
                  margin-bottom: 5px;
                }
                .bar-label {
                  font-size: 10px;
                  color: #9ca3af;
                  writing-mode: vertical-rl;
                  text-orientation: mixed;
                }
                .timeline-list {
                  margin-top: 20px;
                }
                .timeline-list h3 {
                  color: #f59e0b;
                  margin-bottom: 15px;
                  font-size: 16px;
                }
                .timeline-item {
                  display: flex;
                  align-items: center;
                  margin: 8px 0;
                  padding: 10px;
                  background: #374151;
                  border-radius: 5px;
                  border-left: 4px solid #3b82f6;
                  transition: background 0.2s;
                }
                .timeline-item:hover {
                  background: #4b5563;
                }
                .timeline-time {
                  color: #60a5fa;
                  font-weight: bold;
                  min-width: 200px;
                  font-size: 12px;
                }
                .timeline-process {
                  color: #34d399;
                  margin-left: 20px;
                  font-size: 13px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>MemHawk Table View - ${plugin}</h1>
                  <p>Total Items: <strong>${parsedData.length}</strong></p>
                </div>
                
                ${parsedData.some(item => item.CreateTime) ? `
                <div class="timeline-section">
                  <h2>📊 Timeline Analysis</h2>
                  <div class="timeline-stats">
                    <div class="stat-box">
                      <strong>${parsedData.filter(item => item.CreateTime).length}</strong> Timestamped Events
                    </div>
                    <div class="stat-box">
                      <strong>${new Set(parsedData.filter(item => item.CreateTime).map(item => new Date(item.CreateTime).toDateString())).size}</strong> Days Covered
                    </div>
                  </div>
                  <div class="timeline-graph">
                    ${(() => {
                      const timeData = parsedData
                        .filter(item => item.CreateTime && item.CreateTime !== null)
                        .map(item => ({ ...item, date: new Date(item.CreateTime) }))
                        .sort((a, b) => a.date - b.date);
                      
                      if (timeData.length === 0) return '';
                      
                      const hourBuckets = {};
                      timeData.forEach(item => {
                        const hourKey = item.date.toISOString().substring(0, 13) + ':00:00.000Z';
                        if (!hourBuckets[hourKey]) hourBuckets[hourKey] = [];
                        hourBuckets[hourKey].push(item);
                      });
                      
                      const maxCount = Math.max(...Object.values(hourBuckets).map(bucket => bucket.length));
                      
                      return Object.entries(hourBuckets)
                        .sort(([a], [b]) => new Date(a) - new Date(b))
                        .map(([hour, items]) => {
                          const height = Math.max(5, (items.length / maxCount) * 60);
                          const time = new Date(hour);
                          return `
                            <div class="timeline-bar" style="height: ${height}px" title="${items.length} events at ${time.toLocaleString()}">
                              <div class="bar-fill" style="height: 100%; background: linear-gradient(to top, #3b82f6, #60a5fa)"></div>
                              <div class="bar-label">${time.getHours()}:00</div>
                            </div>
                          `;
                        }).join('');
                    })()}
                  </div>
                  <div class="timeline-list">
                    <h3>Event Timeline</h3>
                    ${parsedData
                      .filter(item => item.CreateTime && item.CreateTime !== null)
                      .sort((a, b) => new Date(a.CreateTime) - new Date(b.CreateTime))
                      .slice(0, 20)
                      .map(item => `
                        <div class="timeline-item">
                          <div class="timeline-time">${new Date(item.CreateTime).toLocaleString()}</div>
                          <div class="timeline-process">PID ${item.PID || 'N/A'}: ${item.ImageFileName || item.ProcessName || 'Unknown Process'}</div>
                        </div>
                      `).join('')}
                    ${parsedData.filter(item => item.CreateTime).length > 20 ? `
                      <div class="timeline-item" style="opacity: 0.6; font-style: italic;">
                        <div class="timeline-process">... and ${parsedData.filter(item => item.CreateTime).length - 20} more events</div>
                      </div>
                    ` : ''}
                  </div>
                </div>
                ` : ''}
                
                <div class="table-container">
                  <table>
                    <thead>
                      <tr>
                        ${allKeys.map(key => `<th title="${key}">${key}</th>`).join('')}
                      </tr>
                    </thead>
                    <tbody>
                      ${parsedData.map((item) => `
                        <tr>
                          ${allKeys.map(key => {
                            const value = item[key];
                            let displayValue;
                            let className = '';
                            
                            if (value === null || value === undefined) {
                              displayValue = 'null';
                              className = 'null';
                            } else if (typeof value === 'boolean') {
                              displayValue = value.toString();
                              className = 'boolean';
                            } else if (typeof value === 'number') {
                              displayValue = value.toString();
                              className = 'number';
                            } else if (Array.isArray(value)) {
                              displayValue = value.length === 0 ? '[]' : `[${value.length} items]`;
                              className = 'string';
                            } else if (typeof value === 'object') {
                              displayValue = '{object}';
                              className = 'string';
                            } else {
                              displayValue = value.toString();
                              className = 'string';
                            }
                            
                            return `<td class="${className}" title="${displayValue}">${displayValue}</td>`;
                          }).join('')}
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    };

    let parsedData;
    try {
      parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      return (
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
          <p className="text-red-400 font-medium mb-2">Failed to parse data</p>
        </div>
      );
    }

    if (!Array.isArray(parsedData)) {
      return (
        <div className="bg-amber-900/20 border border-amber-600 rounded-lg p-4">
          <p className="text-amber-400 font-medium">Table view is only available for array data</p>
        </div>
      );
    }

    // Automatically open table in new tab when table view is selected
    openTableInNewTab();
    
    return (
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <TableIcon className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
            <p className="text-cyan-400 font-medium">Opening table view in new tab...</p>
            <p className="text-slate-400 text-sm mt-1">
              Table with {parsedData.length} items is loading in a new window
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Process Tree Viewer Component (Special UI for pstree)
  const ProcessTreeViewer = ({ data, plugin }) => {
    const [expandedNodes, setExpandedNodes] = useState({});
    
    const toggleNode = (nodeId) => {
      setExpandedNodes(prev => ({
        ...prev,
        [nodeId]: !prev[nodeId]
      }));
    };

    const renderProcessNode = (process, level = 0, parentPath = '') => {
      const nodeId = `${parentPath}-${process.PID}`;
      const isExpanded = expandedNodes[nodeId];
      const hasChildren = process.__children && process.__children.length > 0;

      return (
        <div key={nodeId} className="process-node">
          <div 
            className={`flex items-center py-2 px-3 rounded-lg mb-1 transition-colors hover:bg-slate-700/50 ${
              level === 0 ? 'bg-slate-800/50' : ''
            }`}
            style={{ marginLeft: `${level * 20}px` }}
          >
            {hasChildren && (
              <button
                onClick={() => toggleNode(nodeId)}
                className="mr-2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>
            )}
            {!hasChildren && <div className="w-6 mr-2"></div>}
            
            <div className="flex items-center space-x-3 flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-blue-400 font-mono text-sm font-bold">PID {process.PID}</span>
                <span className="text-slate-400">→</span>
                <span className="text-green-400 font-medium">{process.ImageFileName}</span>
              </div>
              
              <div className="flex items-center space-x-4 text-xs text-slate-400">
                {process.PPID && (
                  <span>Parent: <span className="text-orange-400">{process.PPID}</span></span>
                )}
                {process.Threads && (
                  <span>Threads: <span className="text-purple-400">{process.Threads}</span></span>
                )}
                {process.Handles && (
                  <span>Handles: <span className="text-cyan-400">{process.Handles}</span></span>
                )}
              </div>
            </div>
          </div>
          
          {hasChildren && isExpanded && (
            <div className="ml-4">
              {process.__children.map(child => 
                renderProcessNode(child, level + 1, nodeId)
              )}
            </div>
          )}
        </div>
      );
    };

    let parsedData;
    try {
      parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      return (
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
          <p className="text-red-400 font-medium mb-2">Failed to parse process tree data</p>
        </div>
      );
    }

    if (!Array.isArray(parsedData)) {
      return (
        <div className="bg-amber-900/20 border border-amber-600 rounded-lg p-4">
          <p className="text-amber-400 font-medium">Process tree data should be an array</p>
        </div>
      );
    }

    return (
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden">
        <div className="flex items-center space-x-2 p-4 bg-slate-800 border-b border-slate-600">
          <Activity className="w-5 h-5 text-green-400" />
          <span className="text-green-400 font-medium">Process Tree</span>
          <span className="text-slate-400 text-sm">({parsedData.length} processes)</span>
        </div>
        
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="space-y-1">
            {parsedData.map(process => renderProcessNode(process))}
          </div>
        </div>
        
        <div className="p-3 bg-slate-800 border-t border-slate-600 text-xs text-slate-400">
          Click arrows to expand/collapse process children • PID = Process ID • Parent relationships shown
        </div>
      </div>
    );
  };

  // File Tree Reconstruction Component
  const FileTreeViewer = ({ data, plugin }) => {
    const [expandedPaths, setExpandedPaths] = useState({});

    const buildFileTree = (fileData) => {
      const tree = {};
      
      try {
        const parsedData = typeof fileData === 'string' ? JSON.parse(fileData) : fileData;
        if (!Array.isArray(parsedData)) return tree;

        parsedData.forEach((file, index) => {
          const filename = file.FileName || file.Name || file.Path || `File_${index}`;
          if (!filename || filename === 'N/A') return;
          
          const cleanPath = filename.replace(/\\\?\?\\/, '').replace(/\\/g, '/');
          const parts = cleanPath.split('/').filter(p => p);
          
          let current = tree;
          let fullPath = '';
          
          parts.forEach((part, i) => {
            fullPath += '/' + part;
            if (!current[part]) {
              current[part] = {
                isDirectory: i < parts.length - 1,
                children: {},
                fullPath: fullPath,
                fileData: i === parts.length - 1 ? file : null,
                size: file.Size || 0,
                created: file.CreationTime || file.CreateTime,
                modified: file.ModificationTime || file.ModifyTime
              };
            }
            current = current[part].children;
          });
        });
      } catch (error) {
        console.error('Error building file tree:', error);
      }
      
      return tree;
    };

    const togglePath = (path) => {
      setExpandedPaths(prev => ({
        ...prev,
        [path]: !prev[path]
      }));
    };

    const renderTree = (node, name, path = '', depth = 0) => {
      const isExpanded = expandedPaths[path];
      const hasChildren = Object.keys(node.children || {}).length > 0;
      
      return (
        <div key={path} className={`${depth > 0 ? 'ml-4' : ''}`}>
          <div 
            className={`flex items-center py-1 px-2 hover:bg-slate-700 rounded cursor-pointer ${depth === 0 ? 'font-semibold' : ''}`}
            onClick={() => hasChildren && togglePath(path)}
          >
            {hasChildren && (
              <ChevronRight className={`w-4 h-4 mr-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            )}
            {!hasChildren && <div className="w-5" />}
            
            {node.isDirectory ? (
              <Folder className="w-4 h-4 mr-2 text-blue-400" />
            ) : (
              <FileIcon className="w-4 h-4 mr-2 text-slate-400" />
            )}
            
            <span className={`text-sm ${node.isDirectory ? 'text-blue-300' : 'text-slate-300'}`}>
              {name}
            </span>
            
            {!node.isDirectory && node.size && (
              <span className="ml-auto text-xs text-slate-500">
                {formatFileSize(node.size)}
              </span>
            )}
          </div>
          
          {isExpanded && hasChildren && (
            <div className="border-l border-slate-600 ml-2">
              {Object.entries(node.children).map(([childName, childNode]) =>
                renderTree(childNode, childName, `${path}/${childName}`, depth + 1)
              )}
            </div>
          )}
        </div>
      );
    };

    const formatFileSize = (bytes) => {
      if (!bytes || bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const fileTree = buildFileTree(data);
    const totalFiles = Object.values(fileTree).reduce((count, node) => {
      const countFiles = (n) => {
        let total = n.isDirectory ? 0 : 1;
        Object.values(n.children || {}).forEach(child => {
          total += countFiles(child);
        });
        return total;
      };
      return count + countFiles(node);
    }, 0);

    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg">
        <div className="bg-gradient-to-r from-blue-900 to-slate-800 p-3 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Folder className="w-5 h-5 mr-2 text-blue-400" />
              <h3 className="font-semibold text-blue-100">File System Reconstruction</h3>
            </div>
            <div className="text-sm text-blue-200">
              {totalFiles} files recovered
            </div>
          </div>
        </div>
        
        <div className="p-4 max-h-96 overflow-y-auto">
          {Object.keys(fileTree).length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              <FileIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No file paths found in scan results</p>
            </div>
          ) : (
            <div className="space-y-1">
              {Object.entries(fileTree).map(([name, node]) =>
                renderTree(node, name, name, 0)
              )}
            </div>
          )}
        </div>
        
        <div className="p-3 bg-slate-800 border-t border-slate-600 text-xs text-slate-400">
          Interactive file tree • Click folders to expand • File sizes shown when available
        </div>
      </div>
    );
  };

  // Process Chart Viewer Component
  const ProcessChartViewer = ({ data, plugin }) => {
    const createProcessChart = () => {
      try {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        if (!Array.isArray(parsedData)) return null;

        // Create CPU/Memory usage chart
        const processData = parsedData.slice(0, 20).map(proc => ({
          name: proc.ImageFileName || proc.Name || `PID ${proc.PID}`,
          pid: proc.PID,
          cpu: Math.random() * 100, // Placeholder - would come from actual data
          memory: parseInt(proc.VmsPeak) || Math.random() * 1000000
        }));

        return processData;
      } catch (error) {
        console.error('Error creating process chart:', error);
        return null;
      }
    };

    const chartData = createProcessChart();
    
    if (!chartData) {
      return (
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
          <p className="text-red-400">Unable to generate process chart</p>
        </div>
      );
    }

    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg">
        <div className="bg-gradient-to-r from-green-900 to-slate-800 p-3 border-b border-slate-700">
          <div className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
            <h3 className="font-semibold text-green-100">Process Resource Usage</h3>
          </div>
        </div>
        
        <div className="p-4">
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {chartData.map((proc, index) => (
              <div key={index} className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-200">{proc.name}</span>
                  <span className="text-xs text-slate-400">PID: {proc.pid}</span>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>CPU Usage</span>
                      <span>{proc.cpu.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(proc.cpu, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Memory</span>
                      <span>{(proc.memory / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((proc.memory / 1000000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-3 bg-slate-800 border-t border-slate-600 text-xs text-slate-400">
          Resource usage visualization • Top 20 processes • Data simulated for demonstration
        </div>
      </div>
    );
  };

  // Network Graph Viewer Component
  const NetworkGraphViewer = ({ data, plugin }) => {
    const [selectedConnection, setSelectedConnection] = useState(null);

    const createNetworkGraph = () => {
      try {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        if (!Array.isArray(parsedData)) return { nodes: [], connections: [] };

        const nodes = new Map();
        const connections = [];

        parsedData.forEach((conn, index) => {
          const localAddr = conn.LocalAddr || conn.LocalAddress || 'Unknown';
          const foreignAddr = conn.ForeignAddr || conn.ForeignAddress || 'Unknown';
          const protocol = conn.Proto || conn.Protocol || 'TCP';
          const state = conn.State || 'UNKNOWN';
          const pid = conn.PID || conn.ProcessId || 0;

          // Add local node
          if (!nodes.has(localAddr)) {
            nodes.set(localAddr, {
              id: localAddr,
              type: 'local',
              connections: 0,
              processes: new Set()
            });
          }
          nodes.get(localAddr).connections++;
          nodes.get(localAddr).processes.add(pid);

          // Add foreign node (if not local)
          if (foreignAddr !== 'Unknown' && foreignAddr !== localAddr) {
            if (!nodes.has(foreignAddr)) {
              nodes.set(foreignAddr, {
                id: foreignAddr,
                type: 'foreign',
                connections: 0,
                processes: new Set()
              });
            }
            nodes.get(foreignAddr).connections++;
            nodes.get(foreignAddr).processes.add(pid);
          }

          // Add connection
          if (foreignAddr !== 'Unknown') {
            connections.push({
              id: index,
              source: localAddr,
              target: foreignAddr,
              protocol,
              state,
              pid,
              data: conn
            });
          }
        });

        return {
          nodes: Array.from(nodes.values()),
          connections: connections
        };
      } catch (error) {
        console.error('Error creating network graph:', error);
        return { nodes: [], connections: [] };
      }
    };

    const { nodes, connections } = createNetworkGraph();

    const getNodeColor = (node) => {
      if (node.type === 'local') return 'bg-blue-500';
      if (node.id.includes('127.0.0.1') || node.id.includes('localhost')) return 'bg-green-500';
      return 'bg-red-500';
    };

    const getStateColor = (state) => {
      switch (state?.toUpperCase()) {
        case 'ESTABLISHED': return 'text-green-400';
        case 'LISTENING': return 'text-blue-400';
        case 'CLOSE_WAIT': return 'text-yellow-400';
        default: return 'text-slate-400';
      }
    };

    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg">
        <div className="bg-gradient-to-r from-purple-900 to-slate-800 p-3 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Network className="w-5 h-5 mr-2 text-purple-400" />
              <h3 className="font-semibold text-purple-100">Network Connections Graph</h3>
            </div>
            <div className="text-sm text-purple-200">
              {nodes.length} nodes, {connections.length} connections
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Network Nodes */}
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">Network Nodes</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {nodes.map((node, index) => (
                  <div key={index} className="bg-slate-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getNodeColor(node)}`} />
                      <span className="text-sm font-medium text-slate-200">{node.id}</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      {node.connections} connections • {node.processes.size} processes
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Connections */}
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">Active Connections</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {connections.slice(0, 10).map((conn, index) => (
                  <div 
                    key={index} 
                    className="bg-slate-800 rounded-lg p-3 cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => setSelectedConnection(conn)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs">
                        <div className="text-slate-300">{conn.source} → {conn.target}</div>
                        <div className="flex space-x-2 mt-1">
                          <span className="text-slate-400">{conn.protocol}</span>
                          <span className={getStateColor(conn.state)}>{conn.state}</span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">
                        PID: {conn.pid}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Connection Details Modal */}
          {selectedConnection && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-200">Connection Details</h3>
                  <button
                    onClick={() => setSelectedConnection(null)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-slate-400">Source:</span>
                    <span className="ml-2 text-slate-200">{selectedConnection.source}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Target:</span>
                    <span className="ml-2 text-slate-200">{selectedConnection.target}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Protocol:</span>
                    <span className="ml-2 text-slate-200">{selectedConnection.protocol}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">State:</span>
                    <span className={`ml-2 ${getStateColor(selectedConnection.state)}`}>
                      {selectedConnection.state}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Process ID:</span>
                    <span className="ml-2 text-slate-200">{selectedConnection.pid}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-3 bg-slate-800 border-t border-slate-600 text-xs text-slate-400">
          Network topology visualization • Click connections for details • Blue=Local, Green=Localhost, Red=External
        </div>
      </div>
    );
  };

  // Structured Data Viewer Component
  const StructuredDataViewer = ({ data, plugin }) => {
    const [activeTab, setActiveTab] = useState({});
    const itemsPerPage = paginationSettings[plugin] || 1; // Show 1 item per page for detailed view
    const currentPage = currentPages[plugin] || 1;
    
    const toggleExpanded = (path) => {
      const key = `${plugin}-${path}`;
      setExpandedItems(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    };

    const isExpanded = (path) => {
      const key = `${plugin}-${path}`;
      return expandedItems[key] || false;
    };

    const setTabActive = (path, tabKey) => {
      const key = `${plugin}-${path}`;
      setActiveTab(prev => ({
        ...prev,
        [key]: tabKey
      }));
    };

    const getActiveTab = (path) => {
      const key = `${plugin}-${path}`;
      return activeTab[key];
    };

    // Pagination functions
    const changePage = (newPage) => {
      setCurrentPages(prev => ({
        ...prev,
        [plugin]: newPage
      }));
    };

    const openInNewTab = (itemData, itemIndex) => {
      // Create a new window/tab with detailed view
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>MemHawk - Item ${itemIndex + 1} Details</title>
              <style>
                body { 
                  font-family: 'Monaco', 'Consolas', monospace; 
                  background: #0f172a; 
                  color: #e2e8f0; 
                  margin: 0; 
                  padding: 20px; 
                }
                .container { max-width: 1200px; margin: 0 auto; }
                .header { 
                  background: linear-gradient(135deg, #1e293b, #334155); 
                  padding: 20px; 
                  border-radius: 10px; 
                  margin-bottom: 20px; 
                  border: 1px solid #475569;
                }
                .content { 
                  background: #1e293b; 
                  padding: 20px; 
                  border-radius: 10px; 
                  border: 1px solid #475569;
                }
                .key { color: #fbbf24; font-weight: bold; }
                .value { color: #60a5fa; }
                .null { color: #9ca3af; font-style: italic; }
                .string { color: #34d399; }
                .number { color: #f472b6; }
                .boolean { color: #a78bfa; }
                pre { white-space: pre-wrap; word-wrap: break-word; }
                .expandable { cursor: pointer; }
                .expandable:hover { background: #374151; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔍 MemHawk Analysis - Item ${itemIndex + 1}</h1>
                  <p>Plugin: <strong>${plugin}</strong></p>
                </div>
                <div class="content">
                  <pre>${JSON.stringify(itemData, null, 2)}</pre>
                </div>
              </div>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    };

    // Detect if object has tabbed structure (common properties)
    const shouldUseTabs = (obj) => {
      const keys = Object.keys(obj);
      return keys.length > 2 && keys.length <= 10; // Good for tab display
    };

    const renderTabbedObject = (value, path) => {
      const keys = Object.keys(value);
      const currentTab = getActiveTab(path) || keys[0];
      
      return (
        <div className="border border-slate-600 rounded-lg overflow-hidden">
          {/* Tab Headers */}
          <div className="flex bg-slate-800 border-b border-slate-600 overflow-x-auto">
            {keys.map((key) => (
              <button
                key={key}
                onClick={() => setTabActive(path, key)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-r border-slate-600 last:border-r-0 ${
                  currentTab === key
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="p-4 bg-slate-900/50">
            <div className="font-mono text-sm">
              {renderValue(value[currentTab], `${path}.${currentTab}`, 0)}
            </div>
          </div>
        </div>
      );
    };

    const renderValue = (value, path = '', depth = 0) => {
      if (value === null || value === undefined) {
        return <span className="text-gray-400 italic">null</span>;
      }

      if (typeof value === 'boolean') {
        return <span className={`font-medium ${value ? 'text-green-400' : 'text-red-400'}`}>{value.toString()}</span>;
      }

      if (typeof value === 'number') {
        return <span className="text-blue-400 font-mono">{value}</span>;
      }

      if (typeof value === 'string') {
        // Clean up string display
        const cleanValue = value.replace(/^["']|["']$/g, ''); // Remove quotes
        if (cleanValue.length > 100) {
          const isExp = isExpanded(`${path}-text`);
          return (
            <div>
              <button
                onClick={() => toggleExpanded(`${path}-text`)}
                className="text-yellow-300 hover:text-yellow-200 transition-colors text-left font-medium"
              >
                {isExp ? cleanValue : `${cleanValue.substring(0, 100)}...`}
                <ChevronDown className={`inline w-3 h-3 ml-1 transition-transform ${isExp ? 'rotate-180' : ''}`} />
              </button>
            </div>
          );
        }
        return <span className="text-yellow-300 font-medium">{cleanValue}</span>;
      }

      if (Array.isArray(value)) {
        if (value.length === 0) {
          return <span className="text-gray-400 italic">No items</span>;
        }

        const isExp = isExpanded(path);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = value.slice(startIndex, endIndex);
        const totalPages = Math.ceil(value.length / itemsPerPage);

        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => toggleExpanded(path)}
                className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
              >
                <ChevronDown className={`w-4 h-4 mr-2 transition-transform ${isExp ? 'rotate-180' : ''}`} />
                <span>{value.length} items</span>
              </button>
              
              {isExp && totalPages > 1 && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-slate-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        changePage(Math.max(1, currentPage - 1));
                      }}
                      disabled={currentPage === 1}
                      className="px-2 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded text-xs transition-colors"
                    >
                      ←
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        changePage(Math.min(totalPages, currentPage + 1));
                      }}
                      disabled={currentPage === totalPages}
                      className="px-2 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded text-xs transition-colors"
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {isExp && (
              <div className="ml-6 space-y-3">
                {paginatedItems.map((item, index) => {
                  const actualIndex = startIndex + index;
                  return (
                    <div key={actualIndex} className="border-l-2 border-purple-500/30 pl-4 group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-purple-400 font-medium">Item {actualIndex + 1}</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openInNewTab(item, actualIndex);
                          }}
                          className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-all"
                          title="Open in new tab"
                        >
                          Open
                        </button>
                      </div>
                      <div className="ml-2">
                        {renderValue(item, `${path}[${actualIndex}]`, depth + 1)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      if (typeof value === 'object') {
        const keys = Object.keys(value);
        if (keys.length === 0) {
          return <span className="text-gray-400 italic">Empty</span>;
        }

        // Use tabs for suitable objects
        if (shouldUseTabs(value) && depth < 2) {
          return renderTabbedObject(value, path);
        }

        // Traditional expandable view for deeply nested or unsuitable objects
        const isExp = isExpanded(path);
        return (
          <div className="space-y-1">
            <button
              onClick={() => toggleExpanded(path)}
              className="flex items-center text-green-400 hover:text-green-300 transition-colors font-medium"
            >
              <ChevronDown className={`w-4 h-4 mr-2 transition-transform ${isExp ? 'rotate-180' : ''}`} />
              <span>{keys.length} properties</span>
            </button>
            {isExp && (
              <div className="ml-6 space-y-2 border-l-2 border-green-500/30 pl-4">
                {keys.map((key) => (
                  <div key={key} className="space-y-1">
                    <div className="text-orange-400 font-medium">{key}:</div>
                    <div className="ml-4">
                      {renderValue(value[key], `${path}.${key}`, depth + 1)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      return <span className="text-gray-300 font-medium">{String(value)}</span>;
    };

    let parsedData;
    try {
      parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      return (
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
          <p className="text-red-400 font-medium mb-2">Failed to parse data</p>
          <pre className="text-red-300 text-sm overflow-auto">{data}</pre>
        </div>
      );
    }

    // Handle array data with pagination at the top level
    if (Array.isArray(parsedData)) {
      if (parsedData.length === 0) {
        return (
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <span className="text-gray-400 italic">No items found</span>
          </div>
        );
      }

      const totalPages = parsedData.length; // Each item gets its own page
      const currentItem = parsedData[currentPage - 1]; // Get current item
      const currentTab = getActiveTab('current-item') || Object.keys(currentItem)[0];

      return (
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden">
          {/* Header with pagination */}
          <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-600">
            <div className="flex items-center space-x-2">
              <Table className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 font-medium">Structured View</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-slate-300 text-sm">
                Item {currentPage} of {totalPages}
              </span>
              <div className="flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    changePage(Math.max(1, currentPage - 1));
                  }}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    changePage(Math.min(totalPages, currentPage + 1));
                  }}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* Tab Headers for current item */}
          <div className="flex bg-slate-800 border-b border-slate-600 overflow-x-auto">
            {Object.keys(currentItem).map((key) => (
              <button
                key={key}
                onClick={() => setTabActive('current-item', key)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-r border-slate-600 last:border-r-0 min-w-0 ${
                  currentTab === key
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                title={key}
              >
                <span className="truncate max-w-[120px] block">{key}</span>
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="p-6 bg-slate-900/50">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 mb-4">
                <span className="font-semibold text-orange-400 text-lg">{currentTab}</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                {renderValue(currentItem[currentTab], `current-item.${currentTab}`, 0)}
              </div>
            </div>
          </div>

          {/* Quick navigation dots */}
          <div className="flex justify-center space-x-1 p-3 bg-slate-800 border-t border-slate-600">
            {parsedData.slice(0, 10).map((_, index) => ( // Show first 10 dots
              <button
                key={index}
                onClick={() => changePage(index + 1)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentPage === index + 1 ? 'bg-blue-500' : 'bg-slate-600 hover:bg-slate-500'
                }`}
                title={`Go to item ${index + 1}`}
              />
            ))}
            {parsedData.length > 10 && (
              <span className="text-slate-400 text-xs ml-2">+{parsedData.length - 10} more</span>
            )}
          </div>
        </div>
      );
    }

    // Handle non-array data (single object)
    return (
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 font-mono text-sm">
        <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-slate-700">
          <Table className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-400 font-medium">Structured View</span>
        </div>
        <div className="space-y-2">
          {renderValue(parsedData, 'root')}
        </div>
      </div>
    );
  };
  const [darkMode, setDarkMode] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewStyle, setViewStyle] = useState('grid');
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [selectedPluginDetails, setSelectedPluginDetails] = useState(null);
  const [showPluginDetails, setShowPluginDetails] = useState(false);
  const [favoritePlugins, setFavoritePlugins] = useState([]);
  const [pluginStats, setPluginStats] = useState({});
  const [bookmarkedActions, setBookmarkedActions] = useState([]);
  const [showFileTree, setShowFileTree] = useState(false);
  const [fileTreeData, setFileTreeData] = useState(null);
  const [showProcessChart, setShowProcessChart] = useState(false);
  const [showNetworkGraph, setShowNetworkGraph] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [quickActions] = useState([
    { name: 'windows.pslist', label: 'Quick Process Scan', icon: 'zap' },
    { name: 'windows.malfind', label: 'Threat Detection', icon: 'shield' },
    { name: 'windows.filescan', label: 'File Discovery', icon: 'search' },
    { name: 'windows.netscan', label: 'Network Analysis', icon: 'network' }
  ]);
  const [pluginViewModes, setPluginViewModes] = useState({}); // 'raw', 'structured', or 'table' for each plugin - structured is default
  const [pluginFormattedOutputs, setPluginFormattedOutputs] = useState({}); // Store formatted outputs
  const [formattingPlugin, setFormattingPlugin] = useState(null); // Currently formatting plugin

  useEffect(() => {
    // Load available plugins on startup
    loadPlugins();
    
    // Set up scan progress listener
    if (window.electronAPI) {
      window.electronAPI.onScanProgress((event, progress) => {
        setScanProgress(progress);
        
        // Update automatic report progress if in automatic mode
        if (analysisMode === 'automatic' && isGeneratingAutoReport) {
          const progressPercent = Math.floor((progress.completed / progress.total) * 60); // 60% for scanning phase
          setAutoReportProgress({
            phase: 'processes',
            progress: 10 + progressPercent,
            message: `Analyzing: ${progress.currentPlugin}... (${progress.completed}/${progress.total})`
          });
        }
        
        if (progress.completed === progress.total) {
          setIsScanning(false);
        }
      });
    }
    
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('scan-progress');
      }
    };
  }, []);

  // Load and save favorites
  useEffect(() => {
    const savedFavorites = localStorage.getItem('memhawk-favorites');
    if (savedFavorites) {
      setFavoritePlugins(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('memhawk-favorites', JSON.stringify(favoritePlugins));
  }, [favoritePlugins]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.querySelector('input[placeholder*="Search plugins"]')?.focus();
      } else if (e.ctrlKey && e.key === 'a' && !e.shiftKey) {
        e.preventDefault();
        setSelectedPlugins(availablePlugins.map(p => p.name));
      } else if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setSelectedPlugins([]);
      } else if (e.key === 'Escape') {
        setShowPluginDetails(false);
        setFilterText('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [availablePlugins]);

  const loadPlugins = async () => {
    try {
      if (window.electronAPI) {
        const plugins = await window.electronAPI.getAvailablePlugins();
        setAvailablePlugins(plugins);
        // Pre-select essential analysis actions
        setSelectedPlugins(['windows.pslist', 'windows.filescan', 'windows.cmdline']);
      }
    } catch (error) {
      console.error('Failed to load plugins:', error);
    }
  };

  const handleSelectImage = async () => {
    try {
      if (window.electronAPI) {
        const imagePath = await window.electronAPI.selectMemoryDump();
        if (imagePath) {
          setSelectedImage(imagePath);
          setShowModeSelection(true); // Show mode selection after image selection
        }
      }
    } catch (error) {
      console.error('Failed to select image:', error);
    }
  };

  const handlePluginToggle = (pluginName) => {
    setSelectedPlugins(prev => 
      prev.includes(pluginName) 
        ? prev.filter(p => p !== pluginName)
        : [...prev, pluginName]
    );
  };

  const handleStartScan = async () => {
    if (!selectedImage || selectedPlugins.length === 0) return;
    
    setIsScanning(true);
    setScanResults({});
    setScanProgress({ completed: 0, total: selectedPlugins.length, currentPlugin: '' });
    
    try {
      if (window.electronAPI) {
        const results = await window.electronAPI.runVolatilityScan({
          imagePath: selectedImage,
          selectedPlugins,
          outputDir: './output'
        });
        setScanResults(results);
      }
    } catch (error) {
      console.error('Scan failed:', error);
      setIsScanning(false);
    }
  };

  const handleSaveResults = async () => {
    try {
      if (window.electronAPI && Object.keys(scanResults).length > 0) {
        const result = await window.electronAPI.saveResults(scanResults);
        if (result.success) {
          alert(`Results saved to: ${result.path}`);
        }
      }
    } catch (error) {
      console.error('Failed to save results:', error);
    }
  };

  const handleClearLogs = async () => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.clearLogs();
        setLogs([]);
      }
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  const loadLogs = async () => {
    try {
      if (window.electronAPI) {
        const currentLogs = await window.electronAPI.getScanLogs();
        setLogs(currentLogs);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  };

  const toggleLogs = () => {
    if (!showLogs) {
      loadLogs();
    }
    setShowLogs(!showLogs);
  };

  const handleGenerateReport = async () => {
    if (Object.keys(scanResults).length === 0) return;
    
    setIsGeneratingReport(true);
    try {
      if (window.electronAPI) {
        const imageInfo = {
          filename: selectedImage ? selectedImage.split(/[/\\]/).pop() : 'Unknown',
          created: new Date().toISOString()
        };
        
        const report = await window.electronAPI.generateGeminiReport({
          scanResults,
          imageInfo
        });
        
        if (report.success) {
          setAiReport(report.report);
          setViewMode('report');
          
          // Also generate quick summary
          const summary = await window.electronAPI.generateQuickSummary(scanResults);
          if (summary.success) {
            setQuickSummary(summary.summary);
          }
        } else {
          alert(`Failed to generate report: ${report.error}`);
        }
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate AI report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleSaveReport = async () => {
    if (!aiReport) return;
    
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.saveReport({
          report: aiReport,
          filename: `memhawk-ai-report-${new Date().toISOString().split('T')[0]}.md`
        });
        
        if (result.success) {
          alert(`Report saved to: ${result.path}`);
        }
      }
    } catch (error) {
      console.error('Failed to save report:', error);
      alert('Failed to save report');
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'raw' ? 'report' : 'raw');
  };

  const handleAutomaticReport = async () => {
    if (!selectedImage) return;
    
    setIsGeneratingAutoReport(true);
    setAnalysisMode('automatic');
    setAutoReportProgress({ phase: 'initializing', progress: 0, message: 'Starting automatic analysis...' });
    
    // Essential plugins for automatic report
    const essentialPlugins = [
      'windows.info',
      'windows.pslist', 
      'windows.pstree',
      'windows.filescan',
      'windows.netscan',
      'windows.handles',
      'windows.modules',
      'windows.cmdline'
    ];
    
    try {
      if (!window.electronAPI) {
        throw new Error('Electron API not available');
      }

      // Phase 1: System Information
      setAutoReportProgress({ phase: 'system', progress: 10, message: 'Analyzing system information...' });
      
      // Actually run the scan with essential plugins
      setIsScanning(true);
      setScanProgress({ completed: 0, total: essentialPlugins.length, currentPlugin: 'Starting...' });
      
      const results = await window.electronAPI.runVolatilityScan({
        imagePath: selectedImage,
        selectedPlugins: essentialPlugins,
        outputDir: './output'
      });
      
      // Store scan results - the results come directly from the API
      setScanResults(results);
      
      // Phase 2: Processing Results
      setAutoReportProgress({ phase: 'processes', progress: 60, message: 'Processing analysis results...' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Phase 3: Generating AI Report
      setAutoReportProgress({ phase: 'report', progress: 80, message: 'Generating AI-powered comprehensive report...' });
      
      // Generate AI report with actual scan results
      const imageInfo = {
        filename: selectedImage.split(/[/\\]/).pop(),
        created: new Date().toISOString(),
        size: 'Unknown' // We could add file size detection if needed
      };
      
      const report = await window.electronAPI.generateGeminiReport({
        scanResults: results,
        imageInfo,
        isAutomatic: true,
        analysisMode: 'comprehensive'
      });
      
      if (!report.success) {
        throw new Error(report.error || 'AI report generation failed');
      }
      
      // Set the generated report
      setAutoReport(report.report);
      setAiReport(report.report); // Also set for the main report view
      setViewMode('report');
      
      // Generate quick summary as well
      if (report.quickSummary || report.summary) {
        setQuickSummary(report.quickSummary || report.summary);
      }
      
      setAutoReportProgress({ phase: 'complete', progress: 100, message: 'Comprehensive analysis complete!' });
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error('Automatic report generation failed:', error);
      setAutoReportProgress({ 
        phase: 'error', 
        progress: 0, 
        message: `Analysis failed: ${error.message}. Please try again.` 
      });
      
      // Wait a bit before hiding the error
      await new Promise(resolve => setTimeout(resolve, 3000));
    } finally {
      setIsGeneratingAutoReport(false);
      setIsScanning(false);
    }
  };

  const formatPluginOutput = async (pluginName) => {
    if (!scanResults[pluginName] || formattingPlugin === pluginName) return;

    setFormattingPlugin(pluginName);
    
    try {
      const pluginData = availablePlugins.find(p => p.name === pluginName);
      const result = await window.electronAPI.formatPluginOutput({
        pluginName,
        pluginResult: scanResults[pluginName],
        pluginDisplayName: pluginData?.display_name
      });

      if (result.success) {
        setPluginFormattedOutputs(prev => ({
          ...prev,
          [pluginName]: result.formattedOutput
        }));
      } else {
        alert(`Failed to format ${pluginName}: ${result.error}`);
        // Switch back to raw mode on error
        setPluginViewModes(prev => ({
          ...prev,
          [pluginName]: 'raw'
        }));
      }
    } catch (error) {
      console.error('Error formatting plugin output:', error);
      // Switch back to raw mode on error
      setPluginViewModes(prev => ({
        ...prev,
        [pluginName]: 'raw'
      }));
    } finally {
      setFormattingPlugin(null);
    }
  };

  const downloadReport = (pluginName, data) => {
    try {
      const pluginDisplayName = availablePlugins.find(p => p.name === pluginName)?.display_name || 
                               pluginName.replace('windows.', '').replace(/([A-Z])/g, ' $1').trim();
      
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const filename = `MemHawk_${pluginDisplayName.replace(/\s+/g, '_')}_${timestamp}.json`;
      
      let reportData;
      if (typeof data === 'string') {
        try {
          reportData = JSON.parse(data);
        } catch {
          reportData = { raw_output: data };
        }
      } else {
        reportData = data;
      }

      const report = {
        memhawk_report: {
          plugin: pluginName,
          plugin_display_name: pluginDisplayName,
          timestamp: new Date().toISOString(),
          analysis_count: Array.isArray(reportData) ? reportData.length : 1,
          data: reportData
        }
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Show success message
      setLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        level: 'success',
        message: `Downloaded report: ${filename}`
      }]);
    } catch (error) {
      console.error('Error downloading report:', error);
      setLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `Failed to download report: ${error.message}`
      }]);
    }
  };

  const downloadSignedPDFReport = async () => {
    try {
      setLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Generating signed PDF report...'
      }]);

      const imageInfo = {
        filename: selectedImage ? selectedImage.split('\\').pop() : 'Unknown',
        size: 'Unknown',
        created: new Date().toISOString()
      };

      let result;
      
      // If we have an auto report (AI-generated markdown), use that directly
      if (analysisMode === 'automatic' && autoReport) {
        result = await window.electronAPI.generatePDFFromMarkdown({
          markdownContent: autoReport,
          imageInfo: imageInfo
        });
      } else {
        // Otherwise, generate AI report first then create PDF
        result = await window.electronAPI.generateSignedPDFReport({
          scanResults: scanResults,
          imageInfo: imageInfo
        });
      }

      if (result.success) {
        setLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          level: 'success',
          message: `🔒 Signed PDF report generated successfully! Report ID: ${result.reportId}`
        }]);

        setLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `📁 Report saved to: ${result.pdfPath}`
        }]);

        setLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `🔐 Digital signature: ${result.signature.substring(0, 32)}...`
        }]);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error generating PDF report:', error);
      setLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `Failed to generate PDF report: ${error.message}`
      }]);
    }
  };

  const toggleFavoritePlugin = (pluginName) => {
    setFavoritePlugins(prev => 
      prev.includes(pluginName) 
        ? prev.filter(p => p !== pluginName)
        : [...prev, pluginName]
    );
  };

  const openPluginDetails = (plugin) => {
    setSelectedPluginDetails(plugin);
    setShowPluginDetails(true);
  };

  const exportPluginList = () => {
    const pluginData = availablePlugins.map(plugin => ({
      name: plugin.name,
      display_name: plugin.display_name,
      category: plugin.category,
      description: plugin.description,
      priority: plugin.priority
    }));

    const blob = new Blob([JSON.stringify(pluginData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'memhawk-plugins.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`h-screen text-slate-100 font-mono flex flex-col dark-theme ${darkMode ? 'dark' : 'light'}`}>
      
      {/* Mode Selection Modal */}
      {showModeSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl border border-slate-600 p-8 max-w-2xl w-full mx-4 shadow-2xl">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Choose Analysis Mode</h2>
              <p className="text-slate-400">Select how you want to analyze your memory dump</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Automatic Report Mode */}
              <div
                onClick={() => {
                  setShowModeSelection(false);
                  handleAutomaticReport();
                }}
                className="group cursor-pointer bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-600/50 rounded-lg p-6 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 text-center">Automatic Report</h3>
                <p className="text-slate-300 text-sm mb-4 text-center">
                  AI-powered comprehensive analysis with automated insights and recommendations
                </p>
                <div className="text-xs text-slate-400 space-y-1">
                  <div className="flex items-center">
                    <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
                    <span>System overview & process analysis</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
                    <span>Network connections & file artifacts</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
                    <span>AI-generated threat assessment</span>
                  </div>
                </div>
              </div>

              {/* Plugin Mode */}
              <div
                onClick={() => {
                  setShowModeSelection(false);
                  setAnalysisMode('plugin');
                }}
                className="group cursor-pointer bg-gradient-to-br from-slate-900/30 to-slate-800/30 border border-slate-600/50 rounded-lg p-6 hover:border-slate-500 transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/20"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-slate-600 rounded-lg group-hover:scale-110 transition-transform">
                    <Cog className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 text-center">Plugin Mode</h3>
                <p className="text-slate-300 text-sm mb-4 text-center">
                  Manual plugin selection with detailed control over analysis parameters
                </p>
                <div className="text-xs text-slate-400 space-y-1">
                  <div className="flex items-center">
                    <CheckCircle className="w-3 h-3 text-blue-400 mr-2" />
                    <span>45+ specialized analysis plugins</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-3 h-3 text-blue-400 mr-2" />
                    <span>Granular control & customization</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-3 h-3 text-blue-400 mr-2" />
                    <span>Advanced visualization options</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowModeSelection(false)}
                className="text-slate-400 hover:text-slate-300 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Automatic Report Progress Modal */}
      {isGeneratingAutoReport && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl border border-slate-600 p-8 max-w-lg w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Brain className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Generating Automatic Report</h2>
              <p className="text-slate-400 mb-6">{autoReportProgress.message}</p>
              
              {/* Show current plugin progress if scanning */}
              {isScanning && scanProgress.currentPlugin && (
                <div className="mb-4 p-3 bg-slate-700 rounded-lg">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-300">Current Plugin:</span>
                    <span className="text-blue-300 font-medium">{scanProgress.currentPlugin}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Plugin Progress:</span>
                    <span>{scanProgress.completed}/{scanProgress.total}</span>
                  </div>
                </div>
              )}
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-700 rounded-full h-3 mb-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${autoReportProgress.progress}%` }}
                ></div>
              </div>
              
              <div className="text-sm text-slate-300 mb-6">
                {autoReportProgress.progress}% Complete
              </div>
              
              {/* Phase Indicators */}
              <div className="flex justify-center space-x-4 mb-6">
                {[
                  { key: 'system', icon: Database, label: 'System' },
                  { key: 'processes', icon: Cpu, label: 'Processes' },
                  { key: 'filesystem', icon: HardDrive, label: 'Files' },
                  { key: 'network', icon: Network, label: 'Network' },
                  { key: 'report', icon: FileText, label: 'Report' }
                ].map(({ key, icon: Icon, label }) => (
                  <div key={key} className="flex flex-col items-center">
                    <div className={`p-2 rounded-full transition-all duration-300 ${
                      autoReportProgress.phase === key 
                        ? 'bg-blue-500 text-white animate-bounce' 
                        : autoReportProgress.progress >= (['system', 'processes', 'filesystem', 'network', 'report'].indexOf(key) + 1) * 20
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-600 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-slate-400 mt-1">{label}</span>
                  </div>
                ))}
              </div>
              
              {/* Animated dots */}
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-500 rounded-lg shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">MemHawk</h1>
                <p className="text-xs text-slate-400">Advanced Memory Analysis Platform</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-slate-400" /> : <Moon className="w-5 h-5 text-slate-400" />}
            </button>
            <div className="text-xs text-slate-400">
              <div>by Adriteyo Das, Anvita Warjri, Shivam Lahoty</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col">
          {/* Image Selection */}
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-lg font-semibold mb-3 text-white">Memory Image</h2>
            <button
              onClick={handleSelectImage}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <HardDrive className="w-5 h-5" />
              <span>{selectedImage ? 'Change Image' : 'Select Image'}</span>
            </button>
            {selectedImage && (
              <div className="mt-2 p-2 bg-slate-800 rounded text-xs text-slate-300 break-all">
                {selectedImage.split(/[/\\]/).pop()}
              </div>
            )}
          </div>

          {/* Plugin Selection - Only show in plugin mode */}
          {analysisMode === 'plugin' && (
            <div className="flex-1 p-4 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">Plugins</h2>
              <span className="text-sm text-slate-400">
                {selectedPlugins.length}/{availablePlugins.length}
              </span>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="mb-4 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search plugins... (name, description, category)"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {filterText && (
                    <button
                      onClick={() => setFilterText('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="favorites">⭐ Favorites ({favoritePlugins.length})</option>
                  <option value="selected">✓ Selected ({selectedPlugins.length})</option>
                  <option value="Process Analysis">Process Analysis</option>
                  <option value="Memory Analysis">Memory Analysis</option>
                  <option value="Network Analysis">Network Analysis</option>
                  <option value="Registry Analysis">Registry Analysis</option>
                  <option value="File Analysis">File Analysis</option>
                  <option value="System Analysis">System Analysis</option>
                </select>
                <button
                  onClick={() => setViewStyle(viewStyle === 'grid' ? 'list' : 'grid')}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-200 transition-colors"
                  title={`Switch to ${viewStyle === 'grid' ? 'list' : 'grid'} view`}
                >
                  {viewStyle === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                </button>
                <button
                  onClick={exportPluginList}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-200 transition-colors"
                  title="Export plugin list"
                >
                  <Download className="w-4 h-4" />
                </button>
                <div className="relative group">
                  <button className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-200 transition-colors">
                    <AlertCircle className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-600 rounded-lg p-3 text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="font-semibold mb-2">Keyboard Shortcuts:</div>
                    <div>Ctrl+F: Focus search</div>
                    <div>Ctrl+A: Select all plugins</div>
                    <div>Ctrl+Shift+A: Clear selection</div>
                    <div>Escape: Close modals/clear search</div>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats and Actions */}
              <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                <span>
                  Showing {availablePlugins.filter(plugin => {
                    const matchesText = filterText === '' || 
                      plugin.display_name?.toLowerCase().includes(filterText.toLowerCase()) ||
                      plugin.name.toLowerCase().includes(filterText.toLowerCase()) ||
                      plugin.description?.toLowerCase().includes(filterText.toLowerCase()) ||
                      plugin.category?.toLowerCase().includes(filterText.toLowerCase());
                    
                    let matchesCategory = true;
                    if (selectedCategory === 'favorites') {
                      matchesCategory = favoritePlugins.includes(plugin.name);
                    } else if (selectedCategory === 'selected') {
                      matchesCategory = selectedPlugins.includes(plugin.name);
                    } else if (selectedCategory !== 'all') {
                      matchesCategory = plugin.category === selectedCategory;
                    }
                    
                    return matchesText && matchesCategory;
                  }).length} of {availablePlugins.length} plugins
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedPlugins([])}
                    className="hover:text-slate-200 transition-colors"
                    disabled={selectedPlugins.length === 0}
                  >
                    Clear ({selectedPlugins.length})
                  </button>
                  <button
                    onClick={() => {
                      const filtered = availablePlugins.filter(plugin => {
                        const matchesText = filterText === '' || 
                          plugin.display_name?.toLowerCase().includes(filterText.toLowerCase()) ||
                          plugin.name.toLowerCase().includes(filterText.toLowerCase()) ||
                          plugin.description?.toLowerCase().includes(filterText.toLowerCase()) ||
                          plugin.category?.toLowerCase().includes(filterText.toLowerCase());
                        
                        let matchesCategory = true;
                        if (selectedCategory === 'favorites') {
                          matchesCategory = favoritePlugins.includes(plugin.name);
                        } else if (selectedCategory === 'selected') {
                          matchesCategory = selectedPlugins.includes(plugin.name);
                        } else if (selectedCategory !== 'all') {
                          matchesCategory = plugin.category === selectedCategory;
                        }
                        
                        return matchesText && matchesCategory;
                      });
                      setSelectedPlugins(filtered.map(p => p.name));
                    }}
                    className="hover:text-slate-200 transition-colors"
                  >
                    Select Visible
                  </button>
                  {favoritePlugins.length > 0 && (
                    <button
                      onClick={() => setSelectedPlugins(favoritePlugins)}
                      className="hover:text-slate-200 transition-colors"
                    >
                      Select Favorites
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className={`flex-1 overflow-y-auto ${
              viewStyle === 'grid' 
                ? 'grid grid-cols-1 gap-2' 
                : 'space-y-1'
            }`}>
              {availablePlugins
                .filter(plugin => {
                  const matchesText = filterText === '' || 
                    plugin.display_name?.toLowerCase().includes(filterText.toLowerCase()) ||
                    plugin.name.toLowerCase().includes(filterText.toLowerCase()) ||
                    plugin.description?.toLowerCase().includes(filterText.toLowerCase()) ||
                    plugin.category?.toLowerCase().includes(filterText.toLowerCase());
                  
                  let matchesCategory = true;
                  if (selectedCategory === 'favorites') {
                    matchesCategory = favoritePlugins.includes(plugin.name);
                  } else if (selectedCategory === 'selected') {
                    matchesCategory = selectedPlugins.includes(plugin.name);
                  } else if (selectedCategory !== 'all') {
                    matchesCategory = plugin.category === selectedCategory;
                  }
                  
                  return matchesText && matchesCategory;
                })
                .map(plugin => (
                <div
                  key={plugin.name}
                  className={`${viewStyle === 'grid' ? 'p-3' : 'p-2'} rounded-lg border cursor-pointer transition-colors ${
                    selectedPlugins.includes(plugin.name)
                      ? 'bg-blue-900/30 border-blue-600 text-blue-100'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-300'
                  }`}
                  onClick={() => handlePluginToggle(plugin.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${viewStyle === 'list' ? 'text-sm' : ''}`}>
                        {plugin.display_name || plugin.name.replace('windows.', '')}
                      </span>
                      {favoritePlugins.includes(plugin.name) && (
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavoritePlugin(plugin.name);
                        }}
                        className="p-1 hover:bg-slate-700 rounded transition-colors"
                        title="Add to favorites"
                      >
                        <Star className={`w-3 h-3 ${favoritePlugins.includes(plugin.name) ? 'text-yellow-400 fill-current' : 'text-slate-500'}`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openPluginDetails(plugin);
                        }}
                        className="p-1 hover:bg-slate-700 rounded transition-colors"
                        title="Plugin details"
                      >
                        <AlertCircle className="w-3 h-3 text-slate-400" />
                      </button>
                      {selectedPlugins.includes(plugin.name) && (
                        <CheckCircle className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                  </div>
                  {viewStyle === 'grid' && (
                    <>
                      <p className="text-xs text-slate-400 mt-1">{plugin.description}</p>
                      {plugin.priority && (
                        <div className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
                          plugin.priority === 'high' ? 'bg-red-900/30 text-red-300' :
                          plugin.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-300' :
                          'bg-green-900/30 text-green-300'
                        }`}>
                          {plugin.priority} priority
                        </div>
                      )}
                    </>
                  )}
                  {viewStyle === 'list' && plugin.priority && (
                    <span className={`text-xs ${
                      plugin.priority === 'high' ? 'text-red-300' :
                      plugin.priority === 'medium' ? 'text-yellow-300' :
                      'text-green-300'
                    }`}>
                      • {plugin.priority}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Automatic Report Summary - Show in automatic mode */}
          {analysisMode === 'automatic' && autoReport && (
            <div className="flex-1 p-4 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white">Analysis Summary</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400">Complete</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-slate-800 rounded-lg p-4">
                <div className="prose prose-slate prose-invert prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {autoReport}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* Welcome Screen - Show when no mode selected */}
          {!analysisMode && selectedImage && (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center text-slate-400">
                <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Ready to Analyze</p>
                <p className="text-sm">Choose your analysis mode to begin</p>
                <button
                  onClick={() => setShowModeSelection(true)}
                  className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Select Mode
                </button>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="p-4 border-t border-slate-800 space-y-2">
            {analysisMode === 'plugin' && (
              <div className="space-y-2">
                <button
                  onClick={handleStartScan}
                  disabled={!selectedImage || selectedPlugins.length === 0 || isScanning}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-lg"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing Memory...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Start Analysis</span>
                    </>
                  )}
                </button>
                
                {Object.keys(scanResults).length > 0 && (
                  <button
                    onClick={downloadSignedPDFReport}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-lg"
                  >
                    <Shield className="w-5 h-5" />
                    <span>🔒 Download Signed PDF Report</span>
                  </button>
                )}
              </div>
            )}
            
            {analysisMode === 'automatic' && autoReport && (
              <button
                onClick={downloadSignedPDFReport}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-lg"
              >
                <Shield className="w-5 h-5" />
                <span>🔒 Download Signed PDF Report</span>
              </button>
            )}
            
            {selectedImage && !analysisMode && (
              <button
                onClick={() => setShowModeSelection(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-lg"
              >
                <Brain className="w-5 h-5" />
                <span>Choose Analysis Mode</span>
              </button>
            )}
            
            {analysisMode && (
              <button
                onClick={() => {
                  setAnalysisMode(null);
                  setAutoReport(null);
                  setScanResults({});
                  setShowModeSelection(true);
                }}
                className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Change Mode</span>
              </button>
            )}
            
            <div className="flex space-x-2">
              <button
                onClick={handleSaveResults}
                disabled={Object.keys(scanResults).length === 0}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:text-slate-500 text-white py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              
              <button
                onClick={toggleLogs}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                {showLogs ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>Logs</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-slate-950">
          {/* Progress Bar */}
          {isScanning && (
            <div className="bg-slate-900 border-b border-slate-800 p-4">
              <div className="flex items-center justify-between text-sm text-slate-300 mb-2">
                <span>Scanning: {scanProgress.currentPlugin}</span>
                <span>{scanProgress.completed}/{scanProgress.total}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(scanProgress.completed / scanProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {showLogs ? (
              // Logs View
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                  <h3 className="text-lg font-semibold text-white">Debug Logs</h3>
                  <button
                    onClick={handleClearLogs}
                    className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm flex items-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear</span>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded text-sm font-mono ${
                        log.type === 'error' ? 'bg-red-900/20 text-red-300' :
                        log.type === 'success' ? 'bg-green-900/20 text-green-300' :
                        'bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className="ml-2">{log.message}</span>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-center text-slate-500 py-8">
                      No logs available
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Results View
              <div className="h-full overflow-y-auto p-6">
                {Object.keys(scanResults).length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-white">Analysis Results</h3>
                      
                      <div className="flex items-center gap-3">
                        {/* AI Report Generation */}
                        <button
                          onClick={handleGenerateReport}
                          disabled={isGeneratingReport}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
                        >
                          {isGeneratingReport ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-sm">Generating...</span>
                            </>
                          ) : (
                            <>
                              <Brain className="w-4 h-4" />
                              <span className="text-sm">AI Report</span>
                            </>
                          )}
                        </button>

                        {/* View Toggle */}
                        {aiReport && (
                          <button
                            onClick={toggleViewMode}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-all duration-200"
                          >
                            {viewMode === 'raw' ? (
                              <>
                                <ToggleLeft className="w-4 h-4" />
                                <span className="text-sm">Raw</span>
                              </>
                            ) : (
                              <>
                                <ToggleRight className="w-4 h-4" />
                                <span className="text-sm">Report</span>
                              </>
                            )}
                          </button>
                        )}

                        {/* Save Report */}
                        {aiReport && (
                          <button
                            onClick={handleSaveReport}
                            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200"
                          >
                            <FileDown className="w-4 h-4" />
                            <span className="text-sm">Save</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quick Summary */}
                    {quickSummary && (
                      <div className="p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          <h4 className="font-medium text-purple-300">Quick AI Summary</h4>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{quickSummary}</p>
                      </div>
                    )}
                    
                    {/* Results Display */}
                    {viewMode === 'report' && aiReport ? (
                      <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
                        <div className="prose prose-invert prose-lg max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {aiReport}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(scanResults).map(([plugin, result]) => (
                          <div key={plugin} className="bg-slate-900 rounded-lg border border-slate-800">
                            <div className="p-4 border-b border-slate-800">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {result.success ? (
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                  ) : (
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                  )}
                                  <h4 className="text-lg font-medium text-white">
                                    {availablePlugins.find(p => p.name === plugin)?.display_name || 
                                     plugin.replace('windows.', '').replace(/([A-Z])/g, ' $1').trim()}
                                  </h4>
                                  <span className="text-xs text-slate-500">
                                    {new Date(result.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-600">
                                    <button
                                      onClick={() => setPluginViewModes(prev => ({ ...prev, [plugin]: 'structured' }))}
                                      className={`flex items-center space-x-1 px-3 py-1 text-xs rounded-md transition-colors ${
                                        (pluginViewModes[plugin] || 'structured') === 'structured'
                                          ? 'bg-blue-600 text-white'
                                          : 'text-slate-300 hover:text-white hover:bg-slate-700'
                                      }`}
                                      title={
                                        plugin === 'windows.pstree' ? "Interactive Process Tree" :
                                        plugin === 'windows.filescan' ? "File System Explorer" :
                                        plugin === 'windows.pslist' ? "Process Resource Charts" :
                                        (plugin === 'windows.netscan' || plugin === 'windows.netstat') ? "Network Connection Graph" :
                                        "Structured view with tabs"
                                      }
                                    >
                                      {plugin === 'windows.pstree' ? <Activity className="w-3 h-3" /> :
                                       plugin === 'windows.filescan' ? <Folder className="w-3 h-3" /> :
                                       plugin === 'windows.pslist' ? <BarChart3 className="w-3 h-3" /> :
                                       (plugin === 'windows.netscan' || plugin === 'windows.netstat') ? <Network className="w-3 h-3" /> :
                                       <Table className="w-3 h-3" />}
                                      <span>
                                        {plugin === 'windows.pstree' ? 'Tree' :
                                         plugin === 'windows.filescan' ? 'Explorer' :
                                         plugin === 'windows.pslist' ? 'Charts' :
                                         (plugin === 'windows.netscan' || plugin === 'windows.netstat') ? 'Graph' :
                                         'Structured'}
                                      </span>
                                    </button>
                                    <button
                                      onClick={() => setPluginViewModes(prev => ({ ...prev, [plugin]: 'table' }))}
                                      className={`flex items-center space-x-1 px-3 py-1 text-xs rounded-md transition-colors ${
                                        pluginViewModes[plugin] === 'table'
                                          ? 'bg-blue-600 text-white'
                                          : 'text-slate-300 hover:text-white hover:bg-slate-700'
                                      }`}
                                      title="Open complete table in new tab"
                                    >
                                      <TableIcon className="w-3 h-3" />
                                      <span>Table</span>
                                    </button>
                                    <button
                                      onClick={() => setPluginViewModes(prev => ({ ...prev, [plugin]: 'raw' }))}
                                      className={`flex items-center space-x-1 px-3 py-1 text-xs rounded-md transition-colors ${
                                        pluginViewModes[plugin] === 'raw'
                                          ? 'bg-blue-600 text-white'
                                          : 'text-slate-300 hover:text-white hover:bg-slate-700'
                                      }`}
                                      title="Raw JSON output"
                                    >
                                      <Code className="w-3 h-3" />
                                      <span>Raw</span>
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => downloadReport(plugin, result.output)}
                                    className="flex items-center space-x-1 px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                                    title="Download analysis report"
                                  >
                                    <Download className="w-3 h-3" />
                                    <span>Download</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="p-4">
                              {result.demo && (
                                <div className="mb-3 p-3 bg-amber-900/20 border border-amber-600 rounded-lg">
                                  <div className="flex items-center space-x-2 text-amber-300 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="font-medium">Demo Mode</span>
                                  </div>
                                  <p className="text-amber-200 text-xs mt-1">
                                    Memory analysis engine not available. Showing sample data for demonstration.
                                  </p>
                                </div>
                              )}
                              
                              {result.error && !result.demo ? (
                                <div className="text-red-300 font-mono text-sm">
                                  Error: {result.error}
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {(pluginViewModes[plugin] || 'structured') === 'structured' ? (
                                    <div className="max-h-80 overflow-y-auto">
                                      {plugin === 'windows.pstree' ? (
                                        <ProcessTreeViewer data={result.output} plugin={plugin} />
                                      ) : plugin === 'windows.filescan' ? (
                                        <FileTreeViewer data={result.output} plugin={plugin} />
                                      ) : plugin === 'windows.pslist' ? (
                                        <ProcessChartViewer data={result.output} plugin={plugin} />
                                      ) : (plugin === 'windows.netscan' || plugin === 'windows.netstat') ? (
                                        <NetworkGraphViewer data={result.output} plugin={plugin} />
                                      ) : (
                                        <StructuredDataViewer data={result.output} plugin={plugin} />
                                      )}
                                    </div>
                                  ) : pluginViewModes[plugin] === 'table' ? (
                                    <div className="max-h-80 overflow-y-auto">
                                      <TableDataViewer data={result.output} plugin={plugin} />
                                    </div>
                                  ) : (
                                    <div className="max-h-60 overflow-y-auto">
                                      <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap">
                                        {JSON.stringify(result.output, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-slate-500 max-w-2xl">
                      <div className="p-4 bg-blue-500/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-12 h-12 text-blue-400" />
                      </div>
                      <h3 className="text-2xl font-semibold mb-2 text-slate-300">Ready for Memory Analysis</h3>
                      <p className="text-slate-400 mb-6">
                        Load a memory dump and select analysis actions to begin forensic investigation
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-left">
                          <div className="flex items-center gap-2 mb-2">
                            <Database className="w-5 h-5 text-blue-400" />
                            <h4 className="text-slate-300 font-medium">Memory Dumps</h4>
                          </div>
                          <p className="text-sm text-slate-400">
                            Support for .vmem, .raw, .mem, .dmp formats
                          </p>
                        </div>
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-left">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="w-5 h-5 text-purple-400" />
                            <h4 className="text-slate-300 font-medium">AI-Powered</h4>
                          </div>
                          <p className="text-sm text-slate-400">
                            Intelligent analysis with automated reporting
                          </p>
                        </div>
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-left">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-5 h-5 text-green-400" />
                            <h4 className="text-slate-300 font-medium">Fast Analysis</h4>
                          </div>
                          <p className="text-sm text-slate-400">
                            Quick scans with comprehensive results
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Plugin Details Modal */}
      {showPluginDetails && selectedPluginDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Plugin Details</h3>
              <button
                onClick={() => setShowPluginDetails(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">
                  {selectedPluginDetails.display_name || selectedPluginDetails.name.replace('windows.', '')}
                </h4>
                <p className="text-slate-400 text-sm mb-2">{selectedPluginDetails.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs">
                    {selectedPluginDetails.category}
                  </span>
                  <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                    {selectedPluginDetails.name}
                  </span>
                  {selectedPluginDetails.priority && (
                    <span className={`px-2 py-1 rounded text-xs ${
                      selectedPluginDetails.priority === 'high' ? 'bg-red-900/30 text-red-300' :
                      selectedPluginDetails.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-300' :
                      'bg-green-900/30 text-green-300'
                    }`}>
                      {selectedPluginDetails.priority} priority
                    </span>
                  )}
                </div>
              </div>
              
              <div className="border-t border-slate-700 pt-4">
                <h5 className="font-semibold text-white mb-2">Actions</h5>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      handlePluginToggle(selectedPluginDetails.name);
                      setShowPluginDetails(false);
                    }}
                    className={`px-3 py-1.5 rounded text-sm transition-colors ${
                      selectedPlugins.includes(selectedPluginDetails.name)
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {selectedPlugins.includes(selectedPluginDetails.name) ? 'Remove from Analysis' : 'Add to Analysis'}
                  </button>
                  <button
                    onClick={() => {
                      toggleFavoritePlugin(selectedPluginDetails.name);
                    }}
                    className={`px-3 py-1.5 rounded text-sm transition-colors ${
                      favoritePlugins.includes(selectedPluginDetails.name)
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-slate-600 hover:bg-slate-700 text-white'
                    }`}
                  >
                    {favoritePlugins.includes(selectedPluginDetails.name) ? 'Remove from Favorites' : 'Add to Favorites'}
                  </button>
                </div>
              </div>
              
              {scanResults[selectedPluginDetails.name] && (
                <div className="border-t border-slate-700 pt-4">
                  <h5 className="font-semibold text-white mb-2">Recent Results</h5>
                  <p className="text-slate-400 text-sm">
                    Last run: Available in results section
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
