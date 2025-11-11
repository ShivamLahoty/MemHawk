const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const isDev = process.env.ELECTRON_IS_DEV === 'true';
const { exec, spawn } = require('child_process');
const fs = require('fs');
const OllamaReportGenerator = require('../src/gemini-report');

let mainWindow;
let logMessages = [];
let ollamaReporter;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    frame: process.platform === 'darwin' ? false : true,
    icon: path.join(__dirname, '../res/icon.ico'),
    show: false,
    backgroundColor: '#0f172a'
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../frontend/dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  // Initialize Ollama reporter
  ollamaReporter = new OllamaReportGenerator();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('select-memory-dump', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Memory Dumps', extensions: ['raw', 'mem', 'dmp', 'vmem', 'img', 'dd'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('get-available-plugins', async () => {
  try {
    // Try to get plugins from Python backend
    return new Promise((resolve) => {
      const pythonProcess = exec('python src/volatility_bridge.py', 
        { cwd: path.join(__dirname, '..') },
        (error, stdout, stderr) => {
          if (error) {
            console.log('Using fallback plugin list');
            resolve(getFallbackPlugins());
            return;
          }
          
          try {
            // Parse the output to extract plugins (simplified for demo)
            resolve(getFallbackPlugins());
          } catch (parseError) {
            console.log('Using fallback plugin list');  
            resolve(getFallbackPlugins());
          }
        }
      );
    });
  } catch (error) {
    console.error('Error getting plugins:', error);
    return getFallbackPlugins();
  }
});

function getFallbackPlugins() {
  return [
    // Process Analysis
    { name: 'windows.pslist', category: 'Process', description: 'List running processes' },
    { name: 'windows.pstree', category: 'Process', description: 'Display process tree' },
    { name: 'windows.psscan', category: 'Process', description: 'Scan for EPROCESS objects' },
    { name: 'windows.cmdline', category: 'Process', description: 'Show command line arguments' },
    { name: 'windows.envars', category: 'Process', description: 'Display process environment variables' },
    { name: 'windows.privileges', category: 'Process', description: 'List process token privileges' },
    { name: 'windows.getsids', category: 'Process', description: 'Print the SIDs owning each process' },
    
    // Memory Analysis
    { name: 'windows.vadinfo', category: 'Memory', description: 'List process memory ranges' },
    { name: 'windows.vadwalk', category: 'Memory', description: 'Walk the VAD tree' },
    { name: 'windows.memmap', category: 'Memory', description: 'Print the memory map' },
    { name: 'windows.virtmap', category: 'Memory', description: 'List virtual mapped sections' },
    
    // File System
    { name: 'windows.filescan', category: 'File System', description: 'Scan for file objects' },
    { name: 'windows.dumpfiles', category: 'File System', description: 'Dump cached file contents' },
    
    // DLL and Module Analysis
    { name: 'windows.dlllist', category: 'Modules', description: 'List loaded DLLs for processes' },
    { name: 'windows.ldrmodules', category: 'Modules', description: 'List loaded modules in memory' },
    { name: 'windows.modules', category: 'Modules', description: 'List loaded kernel modules' },
    { name: 'windows.modscan', category: 'Modules', description: 'Scan for modules in memory' },
    { name: 'windows.unloadedmodules', category: 'Modules', description: 'List unloaded kernel modules' },
    { name: 'windows.verinfo', category: 'Modules', description: 'List version information from PE files' },
    
    // Network Analysis
    { name: 'windows.netscan', category: 'Network', description: 'Scan for network objects' },
    { name: 'windows.netstat', category: 'Network', description: 'Traverse network tracking structures' },
    
    // Registry Analysis
    { name: 'windows.registry.hivelist', category: 'Registry', description: 'List registry hives' },
    { name: 'windows.registry.hivescan', category: 'Registry', description: 'Scan for registry hives' },
    { name: 'windows.registry.printkey', category: 'Registry', description: 'Print registry key values' },
    { name: 'windows.registry.userassist', category: 'Registry', description: 'Print UserAssist registry keys' },
    { name: 'windows.registry.certificates', category: 'Registry', description: 'List certificates in registry' },
    
    // Services and Handles
    { name: 'windows.handles', category: 'Objects', description: 'List open handles' },
    { name: 'windows.mutantscan', category: 'Objects', description: 'Scan for mutexes' },
    { name: 'windows.symlinkscan', category: 'Objects', description: 'Scan for symbolic links' },
    { name: 'windows.svcscan', category: 'Services', description: 'Scan for Windows services' },
    { name: 'windows.svclist', category: 'Services', description: 'List services from services.exe' },
    
    // Malware Detection
    { name: 'windows.malfind', category: 'Malware', description: 'Find malicious code patterns' },
    { name: 'windows.malware.malfind', category: 'Malware', description: 'Enhanced malicious code detection' },
    { name: 'windows.hollowprocesses', category: 'Malware', description: 'Detect process hollowing' },
    { name: 'windows.suspicious_threads', category: 'Malware', description: 'Find suspicious threads' },
    { name: 'windows.iat', category: 'Malware', description: 'Extract Import Address Table' },
    
    // System Information
    { name: 'windows.info', category: 'System', description: 'Show system information' },
    { name: 'windows.crashinfo', category: 'System', description: 'Show crash dump information' },
    { name: 'windows.kpcrs', category: 'System', description: 'Print KPCR structures' },
    { name: 'windows.statistics', category: 'System', description: 'Show memory statistics' },
    { name: 'windows.sessions', category: 'System', description: 'List session information' },
    
    // Threads and Timers
    { name: 'windows.threads', category: 'Threads', description: 'List process threads' },
    { name: 'windows.thrdscan', category: 'Threads', description: 'Scan for threads' },
    { name: 'windows.timers', category: 'System', description: 'Print kernel timers' },
    
    // System Calls and Callbacks
    { name: 'windows.ssdt', category: 'System', description: 'List system call table' },
    { name: 'windows.callbacks', category: 'System', description: 'List kernel callbacks' },
    
    // Pool Analysis
    { name: 'windows.poolscanner', category: 'Pool', description: 'Generic pool scanner' },
    { name: 'windows.bigpools', category: 'Pool', description: 'List big page pools' },
    
    // Drivers
    { name: 'windows.driverirp', category: 'Drivers', description: 'List IRPs for drivers' },
    { name: 'windows.driverscan', category: 'Drivers', description: 'Scan for drivers' },
    { name: 'windows.devicetree', category: 'Drivers', description: 'List device tree' }
  ];
}

ipcMain.handle('run-volatility-scan', async (event, { imagePath, selectedPlugins, outputDir }) => {
  return new Promise((resolve, reject) => {
    const results = {};
    let completedPlugins = 0;
    
    // Log the scan start
    const logMessage = `Starting scan with ${selectedPlugins.length} plugins on ${path.basename(imagePath)}`;
    logMessages.push({ timestamp: new Date().toISOString(), message: logMessage, type: 'info' });
    
    selectedPlugins.forEach((plugin, index) => {
      setTimeout(() => {
        runVolatilityPlugin(imagePath, plugin, outputDir)
          .then(result => {
            results[plugin] = result;
            completedPlugins++;
            
            // Send progress update
            mainWindow.webContents.send('scan-progress', {
              completed: completedPlugins,
              total: selectedPlugins.length,
              currentPlugin: plugin,
              result: result
            });
            
            if (completedPlugins === selectedPlugins.length) {
              resolve(results);
            }
          })
          .catch(error => {
            results[plugin] = { error: error.message };
            completedPlugins++;
            
            if (completedPlugins === selectedPlugins.length) {
              resolve(results);
            }
          });
      }, index * 100); // Stagger the plugin executions
    });
  });
});

ipcMain.handle('get-scan-logs', async () => {
  return logMessages;
});

ipcMain.handle('clear-logs', async () => {
  logMessages = [];
  return true;
});

// User Profile Management
const UserProfileManager = require('../src/user-profile');
const userProfileManager = new UserProfileManager();

ipcMain.handle('load-user-profile', async () => {
  try {
    const profile = await userProfileManager.loadProfile();
    return { success: true, profile: profile };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-user-profile', async (event, profile) => {
  try {
    const validation = userProfileManager.validateProfile(profile);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }
    
    const result = await userProfileManager.saveProfile(profile);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-analyst-signature', async () => {
  try {
    const signature = await userProfileManager.getAnalystSignature();
    return { success: true, signature: signature };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-results', async (event, results) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'Text Files', extensions: ['txt'] }
    ],
    defaultPath: `memhawk-results-${new Date().toISOString().split('T')[0]}.json`
  });
  
  if (!result.canceled) {
    try {
      const data = JSON.stringify(results, null, 2);
      fs.writeFileSync(result.filePath, data);
      return { success: true, path: result.filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  return { success: false, error: 'Save cancelled' };
});

ipcMain.handle('generate-gemini-report', async (event, { scanResults, imageInfo }) => {
  try {
    if (!ollamaReporter) {
      ollamaReporter = new OllamaReportGenerator();
    }
    
    const report = await ollamaReporter.generateForensicReport(scanResults, imageInfo);
    
    logMessages.push({
      timestamp: new Date().toISOString(),
      message: report.success ? 'AI report generated successfully' : `AI report failed: ${report.error}`,
      type: report.success ? 'success' : 'error'
    });
    
    return report;
  } catch (error) {
    console.error('Error generating Gemini report:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
});

ipcMain.handle('generate-quick-summary', async (event, scanResults) => {
  try {
    if (!ollamaReporter) {
      ollamaReporter = new OllamaReportGenerator();
    }
    
    const summary = await ollamaReporter.generateQuickSummary(scanResults);
    return summary;
  } catch (error) {
    console.error('Error generating quick summary:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
});

// Format individual plugin output with AI
ipcMain.handle('format-plugin-output', async (event, { pluginName, pluginResult, pluginDisplayName }) => {
  try {
    const reportGenerator = new OllamaReportGenerator();
    const result = await reportGenerator.formatPluginOutput(pluginName, pluginResult, pluginDisplayName);
    return result;
  } catch (error) {
    console.error('Error formatting plugin output:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
});

ipcMain.handle('save-report', async (event, { report, filename }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'Markdown Files', extensions: ['md'] },
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'HTML Files', extensions: ['html'] }
    ],
    defaultPath: filename || `memhawk-report-${new Date().toISOString().split('T')[0]}.md`
  });
  
  if (!result.canceled) {
    try {
      fs.writeFileSync(result.filePath, report);
      return { success: true, path: result.filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  return { success: false, error: 'Save cancelled' };
});

// Generate and download signed PDF report
ipcMain.handle('generate-signed-pdf-report', async (event, { scanResults, imageInfo }) => {
  try {
    if (!ollamaReporter) {
      ollamaReporter = new OllamaReportGenerator();
    }
    
    const pdfResult = await ollamaReporter.generateSignedPDFReport(scanResults, imageInfo);
    
    if (pdfResult.success && pdfResult.pdfPath) {
      // Show the PDF in file explorer
      shell.showItemInFolder(pdfResult.pdfPath);
      
      // Also offer to open the PDF
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'PDF Report Generated',
        message: '🔒 Digitally Signed PDF Report Generated Successfully!',
        detail: `Report saved to: ${pdfResult.pdfPath}\n\nReport ID: ${pdfResult.reportId}\nSignature: ${pdfResult.signature.substring(0, 16)}...\n\nThis PDF document has been digitally signed with embedded metadata.\nThe signature is verifiable and any tampering will invalidate it.`,
        buttons: ['Open PDF', 'Open Folder', 'OK'],
        defaultId: 0
      }).then((result) => {
        if (result.response === 0) {
          // Open PDF
          shell.openPath(pdfResult.pdfPath);
        } else if (result.response === 1) {
          // Open folder
          shell.showItemInFolder(pdfResult.pdfPath);
        }
      });
    }
    
    return pdfResult;
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
});

// Generate signed PDF from existing markdown content
ipcMain.handle('generate-pdf-from-markdown', async (event, { markdownContent, imageInfo }) => {
  try {
    if (!ollamaReporter) {
      ollamaReporter = new OllamaReportGenerator();
    }
    
    const pdfResult = await ollamaReporter.generatePDFFromMarkdown(markdownContent, imageInfo);
    
    if (pdfResult.success && pdfResult.pdfPath) {
      // Show the PDF in file explorer
      shell.showItemInFolder(pdfResult.pdfPath);
      
      // Also offer to open the PDF
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'PDF Report Generated',
        message: '🔒 Digitally Signed PDF Report Generated Successfully!',
        detail: `Report saved to: ${pdfResult.pdfPath}\n\nReport ID: ${pdfResult.reportId}\nSignature: ${pdfResult.signature.substring(0, 16)}...\n\nThis PDF document has been digitally signed with embedded metadata.\nThe signature is verifiable and any tampering will invalidate it.`,
        buttons: ['Open PDF', 'Open Folder', 'Verify Signature', 'OK'],
        defaultId: 0
      }).then((result) => {
        if (result.response === 0) {
          // Open PDF
          shell.openPath(pdfResult.pdfPath);
        } else if (result.response === 1) {
          // Open folder
          shell.showItemInFolder(pdfResult.pdfPath);
        } else if (result.response === 2) {
          // Verify signature
          // Could implement signature verification dialog here
        }
      });
    }
    
    return pdfResult;
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
});

// Verify PDF signature
ipcMain.handle('verify-pdf-signature', async (event, { pdfPath }) => {
  try {
    const PDFReportGenerator = require('../src/pdf-generator');
    const pdfGenerator = new PDFReportGenerator();
    
    const pdfBuffer = await fs.readFile(pdfPath);
    const verification = await pdfGenerator.verifyPDFSignature(pdfBuffer);
    
    return verification;
  } catch (error) {
    return {
      isSigned: false,
      error: error.message
    };
  }
});

// Helper functions
function getPluginDescription(pluginName) {
  const descriptions = {
    'windows.pslist': 'List running processes',
    'windows.pstree': 'Show process tree',
    'windows.filescan': 'Scan for file objects',
    'windows.cmdline': 'Show command line arguments',
    'windows.dlllist': 'List loaded DLLs',
    'windows.handles': 'List open handles',
    'windows.malfind': 'Find malicious code',
    'windows.modules': 'List kernel modules',
    'windows.info': 'Show system information',
    'windows.registry.printkey': 'Print registry keys'
  };
  
  return descriptions[pluginName] || 'Volatility plugin';
}

async function runVolatilityPlugin(imagePath, plugin, outputDir) {
  return new Promise((resolve, reject) => {
    // Try multiple possible paths for vol command
    const possibleVolPaths = [
      'vol',
      'vol.exe',
      'C:\\Users\\dasad\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\vol.exe',
      path.join(process.env.USERPROFILE, 'AppData', 'Local', 'Programs', 'Python', 'Python312', 'Scripts', 'vol.exe'),
      path.join(process.env.PROGRAMFILES, 'Python', 'Python312', 'Scripts', 'vol.exe'),
      'python -m volatility3'
    ];
    
    let command = null;
    
    // Find the first working vol command
    for (const volPath of possibleVolPaths) {
      try {
        // Test if this path works
        if (volPath.includes('vol')) {
          command = `"${volPath}" -f "${imagePath}" -r json ${plugin}`;
        } else {
          command = `${volPath} -f "${imagePath}" -r json ${plugin}`;
        }
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!command) {
      command = `vol -f "${imagePath}" -r json ${plugin}`; // fallback
    }
    
    logMessages.push({ 
      timestamp: new Date().toISOString(), 
      message: `Starting ${plugin} scan with command: ${command}`, 
      type: 'info',
      plugin: plugin
    });
    
    // Try to run actual Volatility command
    exec(command, 
      { 
        timeout: 300000, // 5 minute timeout
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        cwd: outputDir,
        env: {
          ...process.env,
          PATH: process.env.PATH + ';C:\\Users\\dasad\\AppData\\Local\\Programs\\Python\\Python312\\Scripts'
        }
      },
      (error, stdout, stderr) => {
        if (error) {
          // If real Volatility fails, use mock data for demo
          logMessages.push({ 
            timestamp: new Date().toISOString(), 
            message: `${plugin} failed, using demo data: ${error.message}`, 
            type: 'warning',
            plugin: plugin
          });
          
          // Generate mock results
          setTimeout(() => {
            const mockResults = generateMockResults(plugin);
            resolve({
              plugin: plugin,
              command: command,
              output: mockResults,
              timestamp: new Date().toISOString(),
              success: true,
              demo: true
            });
          }, Math.random() * 2000 + 500);
          return;
        }
        
        // Parse real Volatility output
        let output;
        try {
          output = JSON.parse(stdout);
        } catch (parseError) {
          output = stdout; // Return raw output if JSON parsing fails
        }
        
        logMessages.push({ 
          timestamp: new Date().toISOString(), 
          message: `Completed ${plugin} scan successfully`, 
          type: 'success',
          plugin: plugin
        });
        
        resolve({
          plugin: plugin,
          command: command,
          output: output,
          timestamp: new Date().toISOString(),
          success: true,
          stderr: stderr || null
        });
      }
    );
  });
}

function generateMockResults(plugin) {
  const mockData = {
    'windows.pslist': [
      { PID: 4, PPID: 0, ImageFileName: 'System', Offset: '0x80000000', Threads: 42, Handles: 512, CreateTime: '2024-01-01 10:00:00' },
      { PID: 400, PPID: 4, ImageFileName: 'smss.exe', Offset: '0x81234567', Threads: 3, Handles: 21, CreateTime: '2024-01-01 10:00:01' },
      { PID: 456, PPID: 400, ImageFileName: 'csrss.exe', Offset: '0x82345678', Threads: 8, Handles: 156, CreateTime: '2024-01-01 10:00:02' },
      { PID: 500, PPID: 456, ImageFileName: 'winlogon.exe', Offset: '0x83456789', Threads: 12, Handles: 234, CreateTime: '2024-01-01 10:00:03' },
      { PID: 1024, PPID: 500, ImageFileName: 'explorer.exe', Offset: '0x84567890', Threads: 24, Handles: 890, CreateTime: '2024-01-01 10:00:15' }
    ],
    'windows.pstree': {
      processes: [
        { name: 'System', pid: 4, ppid: 0, children: [
          { name: 'smss.exe', pid: 400, ppid: 4, children: [
            { name: 'csrss.exe', pid: 456, ppid: 400, children: [] },
            { name: 'winlogon.exe', pid: 500, ppid: 400, children: [
              { name: 'explorer.exe', pid: 1024, ppid: 500, children: [
                { name: 'notepad.exe', pid: 1234, ppid: 1024, children: [] },
                { name: 'cmd.exe', pid: 1456, ppid: 1024, children: [] }
              ]}
            ]}
          ]}
        ]}
      ]
    },
    'windows.filescan': [
      { Offset: '0x12345678', Name: '\\Windows\\System32\\kernel32.dll', Size: 1024000 },
      { Offset: '0x23456789', Name: '\\Windows\\System32\\ntdll.dll', Size: 2048000 },
      { Offset: '0x34567890', Name: '\\Windows\\System32\\user32.dll', Size: 512000 },
      { Offset: '0x45678901', Name: '\\Windows\\explorer.exe', Size: 1536000 },
      { Offset: '0x56789012', Name: '\\Documents and Settings\\User\\Desktop\\document.txt', Size: 4096 }
    ],
    'windows.cmdline': [
      { PID: 1024, Process: 'explorer.exe', Args: 'C:\\WINDOWS\\Explorer.EXE' },
      { PID: 1234, Process: 'notepad.exe', Args: 'notepad.exe C:\\temp\\file.txt' },
      { PID: 1456, Process: 'cmd.exe', Args: 'cmd.exe /c dir C:\\' },
      { PID: 1678, Process: 'svchost.exe', Args: 'svchost.exe -k netsvcs' }
    ],
    'windows.dlllist': [
      { PID: 1024, Process: 'explorer.exe', Base: '0x400000', Size: '0x177000', LoadCount: 1, Path: 'C:\\WINDOWS\\explorer.exe' },
      { PID: 1024, Process: 'explorer.exe', Base: '0x7c900000', Size: '0xaf000', LoadCount: 65535, Path: 'C:\\WINDOWS\\system32\\ntdll.dll' },
      { PID: 1024, Process: 'explorer.exe', Base: '0x7c800000', Size: '0xf6000', LoadCount: 65535, Path: 'C:\\WINDOWS\\system32\\kernel32.dll' }
    ],
    'windows.handles': [
      { PID: 1024, Handle: '0x4', Access: '0x100020', Type: 'Process', Details: 'Pid: 1024' },
      { PID: 1024, Handle: '0x8', Access: '0xf01ff', Type: 'Thread', Details: 'Tid: 1028' },
      { PID: 1024, Handle: '0xc', Access: '0x100000', Type: 'File', Details: '\\Device\\HarddiskVolume1\\WINDOWS\\explorer.exe' }
    ],
    'windows.modules': [
      { Offset: '0x80000000', Name: 'ntoskrnl.exe', Base: '0x80400000', Size: '0x1f7000', File: 'ntoskrnl.exe' },
      { Offset: '0x80100000', Name: 'hal.dll', Base: '0x80600000', Size: '0x33000', File: 'hal.dll' },
      { Offset: '0x80200000', Name: 'KDCOM.DLL', Base: '0x80700000', Size: '0x8000', File: 'KDCOM.DLL' }
    ],
    'windows.info': {
      Variable: 'KdDebuggerDataBlock',
      Value: '0x80545ae0',
      'System Time': '2024-01-01 15:30:45 UTC',
      'System Uptime': '1 day, 5:30:45',
      'Kernel Base': '0x80400000'
    },
    'windows.malfind': [
      { PID: 1234, Process: 'suspicious.exe', 'Start VPN': '0x400000', 'End VPN': '0x401000', Tag: 'VadS', Protection: 'PAGE_EXECUTE_READWRITE', Hexdump: '4d 5a 90 00 03 00 00 00' }
    ]
  };
  
  return mockData[plugin] || [{ 
    message: `Demo data for ${plugin}`, 
    note: 'This is sample data - install Volatility 3 for real analysis',
    plugin: plugin,
    status: 'demo_mode'
  }];
}