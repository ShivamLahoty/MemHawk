<<<<<<< HEAD
# MemHawk - Advanced Memory Analysis Platform

A professional, AI-powered memory forensics platform that provides comprehensive analysis of memory dumps through an intuitive, modern interface.

## Features

- **Modern Interface**: Clean, dark-themed UI built with React and Tailwind CSS
- **Memory Analysis**: Comprehensive memory dump analysis using Volatility 3 plugins
- **Real-time Progress**: Live progress tracking during forensic scans
- **Results Export**: Save analysis results in JSON format
- **Debug Logging**: Comprehensive logging system for troubleshooting
- **Plugin Management**: Easy selection and management of Volatility plugins

## Requirements

- Node.js 16.x or later
- Python 3.6 or later
- Volatility 3 framework
- Electron

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd volatility-gui
```

2. Install dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

## Development

To run the application in development mode:

```bash
npm start
```

This will start both the React development server and the Electron application.

## Building

To build the application for distribution:

```bash
npm run build
npm run electron-pack
```

## Usage

1. Launch MemHawk
2. Select a memory dump file using the "Select Image" button
3. Choose the Volatility plugins you want to run
4. Click "Start Scan" to begin analysis
5. View results in real-time as they complete
6. Save results using the "Save" button
7. Use the "Logs" button to view debug information

## Supported File Formats

- Raw memory dumps (.raw, .mem, .dmp)
- VMware memory files (.vmem)
- VirtualBox core dumps
- Physical memory images (.img, .dd)

## Author

- Shivam Lahoty

## License

MIT License
=======
# MemHawk
Forensics Memory Dump Analyzer
>>>>>>> 946b64d021616be6451a674732ddd89b6ca0ec20
