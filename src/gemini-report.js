/**
 *const axios = require('axios');
const PDFReportGenerator = require('./pdf-generator');
const UserProfileManager = require('./user-profile');

class OllamaReportGenerator {
  constructor() {
    this.ollamaUrl = 'http://localhost:11434';
    this.model = 'llama3.2:1b'; // Try larger model for better analysis
    this.pdfGenerator = new PDFReportGenerator();
    this.userProfile = new UserProfileManager();
  }AI Report Generator
 * Generates structured forensic reports using local Ollama AI models
 * 
 * Authors: Adriteyo Das, Anvita Warjri, Shivam Lahoty
 */

const axios = require('axios');
const PDFReportGenerator = require('./pdf-generator');

class OllamaReportGenerator {
  constructor() {
    this.ollamaUrl = 'http://localhost:11434';
    this.model = 'gpt-oss:120b-cloud'; // Try larger model for better analysis
    this.pdfGenerator = new PDFReportGenerator();
  }

  async checkOllamaConnection() {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`);
      return response.status === 200;
    } catch (error) {
      console.error('Ollama connection failed:', error.message);
      return false;
    }
  }

  /**
   * Get analyst signature for reports
   */
  getAnalystSignature() {
    const timestamp = new Date().toISOString();
    return {
      hasProfile: true,
      signature: `**Prepared by:**
MemHawk Forensic Analysis Tool
Digital Forensics & Incident Response Platform

**Report Generated:**
${timestamp}

**Analysis Engine:**
Volatility 3 with MemHawk Integration
AI Model: Ollama ${this.model}

**Authors:** Adriteyo Das, Anvita Warjri, Shivam Lahoty`
    };
  }

  /**
   * Generate a comprehensive forensic report from scan results
   */
  async generateForensicReport(scanResults, imageInfo = {}) {
    // Check if Ollama is running
    const isConnected = await this.checkOllamaConnection();
    if (!isConnected) {
      return {
        success: false,
        error: 'Ollama is not running. Please start Ollama service.',
        timestamp: new Date().toISOString()
      };
    }

    const prompt = await this.buildForensicPrompt(scanResults, imageInfo);
    
    try {
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,
          top_p: 0.9,
          top_k: 20,
          num_ctx: 4096
        }
      });

      return {
        success: true,
        report: response.data.response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Ollama API Error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Format individual plugin output using AI
   */
  async formatPluginOutput(pluginName, pluginResult, pluginDisplayName = null) {
    // Check if Ollama is running
    const isConnected = await this.checkOllamaConnection();
    if (!isConnected) {
      return {
        success: false,
        error: 'Ollama is not running. Please start Ollama service.',
        timestamp: new Date().toISOString()
      };
    }

    const prompt = this.buildPluginFormatPrompt(pluginName, pluginResult, pluginDisplayName);
    
    try {
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,
          top_p: 0.9,
          top_k: 20,
          num_ctx: 4096
        }
      });

      return {
        success: true,
        formattedOutput: response.data.response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Ollama Plugin Format Error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Build a structured prompt for forensic analysis
   */
  async buildForensicPrompt(scanResults, imageInfo) {
    const extractedData = this.extractReadableData(scanResults);
    const analystInfo = this.getAnalystSignature();
    
    return `You are a digital forensics expert analyzing a memory dump. Based on the ACTUAL scan results below, provide a specific forensic analysis. DO NOT use generic examples.

MEMORY IMAGE: ${imageInfo.filename || 'Unknown'}
ANALYSIS TOOL: MemHawk (open-source memory forensics tool)

=== ACTUAL FORENSIC DATA FOUND ===
${extractedData}

Based on this ACTUAL data, provide a forensic report with:

**EXECUTIVE SUMMARY**
What specific findings were discovered in this memory dump?

**PROCESS ANALYSIS**
List the actual processes found, their PIDs, and any suspicious behavior.

**SECURITY ASSESSMENT**
Identify any malware indicators or suspicious activities based on the real data above.

**KEY FINDINGS**
Highlight the most important discoveries from this specific analysis.
- Any suspicious or unusual processes

### 4. FILE SYSTEM ANALYSIS
- Key files and directories found
- Recently accessed files
- Suspicious file activities

### 5. NETWORK ANALYSIS
- Network connections (if available)
- Communication patterns
- Suspicious network activity

### 6. SECURITY ASSESSMENT
- Potential malware indicators
- System vulnerabilities
- Suspicious activities or anomalies

### 7. TIMELINE ANALYSIS
- Key events chronologically
- Process creation times
- File access patterns

### 8. RECOMMENDATIONS
- Immediate actions required
- Further investigation steps
- Security improvements

### 9. TECHNICAL DETAILS
- Detailed plugin outputs
- Memory addresses and offsets
- Technical artifacts

## Formatting Guidelines
- Use professional forensic terminology
- Include specific evidence with memory addresses
- Highlight critical findings with **bold** text
- Use bullet points for clarity
- Include relevant timestamps
- Provide confidence levels for findings

## Analysis Focus
- Prioritize security-relevant findings
- Identify potential threats or compromises
- Explain technical findings in business context
- Provide actionable recommendations

Generate a thorough, professional forensic report that would be suitable for legal proceedings or incident response documentation.

---

${analystInfo.signature}

**End of Report**`;
  }

  /**
   * Extract readable data from scan results for AI analysis
   */
  extractReadableData(scanResults) {
    let extractedData = '';
    
    Object.entries(scanResults).forEach(([pluginName, result]) => {
      if (result.success && result.output) {
        extractedData += `\n=== ${pluginName.toUpperCase()} RESULTS ===\n`;
        
        // If output is a string, include it directly
        if (typeof result.output === 'string') {
          extractedData += result.output.substring(0, 1000) + (result.output.length > 1000 ? '...' : '') + '\n';
        }
        // If output is an object/array, extract key information
        else if (typeof result.output === 'object') {
          try {
            // For process lists, extract process names and PIDs
            if (pluginName.includes('pslist') || pluginName.includes('pstree')) {
              const processInfo = this.extractProcessInfo(result.output);
              extractedData += processInfo;
              
              // Add debug info if extraction failed
              if (processInfo.includes('format not recognized') && Array.isArray(result.output) && result.output.length > 0) {
                extractedData += `Debug: First item keys: ${Object.keys(result.output[0]).join(', ')}\n`;
              }
            }
            // For file scans, extract file paths
            else if (pluginName.includes('filescan')) {
              const fileInfo = this.extractFileInfo(result.output);
              extractedData += fileInfo;
              
              // Add debug info if extraction failed
              if (fileInfo.includes('format not recognized') && Array.isArray(result.output) && result.output.length > 0) {
                extractedData += `Debug: First item keys: ${Object.keys(result.output[0]).join(', ')}\n`;
              }
            }
            // For network scans, extract connections
            else if (pluginName.includes('netscan')) {
              const networkInfo = this.extractNetworkInfo(result.output);
              extractedData += networkInfo;
              
              // Add debug info if extraction failed
              if (networkInfo.includes('format not recognized') && Array.isArray(result.output) && result.output.length > 0) {
                extractedData += `Debug: First item keys: ${Object.keys(result.output[0]).join(', ')}\n`;
              }
            }
            // For other plugins, show structured data
            else {
              const formatted = JSON.stringify(result.output, null, 2);
              extractedData += formatted.substring(0, 800) + (formatted.length > 800 ? '...' : '') + '\n';
            }
          } catch (e) {
            extractedData += `Data parsing error: ${e.message}\n`;
            // Add debug info about the data structure
            extractedData += `Debug: Output type: ${typeof result.output}, isArray: ${Array.isArray(result.output)}\n`;
          }
        }
      } else if (!result.success) {
        extractedData += `\n=== ${pluginName.toUpperCase()} ===\nError: ${result.error}\n`;
      }
    });
    
    return extractedData || 'No readable scan data found.';
  }

  /**
   * Extract process information from plugin output
   */
  extractProcessInfo(output) {
    let processInfo = '';
    if (Array.isArray(output)) {
      output.slice(0, 20).forEach(process => { // Limit to first 20 processes
        // Handle different field name formats from Volatility
        const name = process.ImageFileName || process.name || process.Name || 'Unknown';
        const pid = process.PID || process.pid || 'Unknown';
        const ppid = process.PPID || process.ppid || process.Parent || '';
        
        if (name !== 'Unknown' && pid !== 'Unknown') {
          processInfo += `- Process: ${name} (PID: ${pid})${ppid ? ` Parent: ${ppid}` : ''}\n`;
        }
      });
    }
    return processInfo || 'Process data format not recognized\n';
  }

  /**
   * Extract file information from plugin output
   */
  extractFileInfo(output) {
    let fileInfo = '';
    if (Array.isArray(output)) {
      output.slice(0, 15).forEach(file => { // Limit to first 15 files
        // Handle different field name formats from Volatility
        const name = file.Name || file.path || file.name || file.FileName || 'Unknown';
        const size = file.Size || file.size || '';
        
        if (name !== 'Unknown') {
          fileInfo += `- File: ${name}${size ? ` (${size} bytes)` : ''}\n`;
        }
      });
    }
    return fileInfo || 'File data format not recognized\n';
  }

  /**
   * Extract network connection information from plugin output
   */
  extractNetworkInfo(output) {
    let networkInfo = '';
    if (Array.isArray(output)) {
      output.slice(0, 10).forEach(conn => { // Limit to first 10 connections
        // Handle different field name formats from Volatility
        const localAddr = conn.LocalAddr || conn.local_addr || conn.LocalAddress || 'N/A';
        const localPort = conn.LocalPort || conn.local_port || conn.LocalPortNumber || '?';
        const remoteAddr = conn.ForeignAddr || conn.remote_addr || conn.RemoteAddr || conn.RemoteAddress || 'N/A';
        const remotePort = conn.ForeignPort || conn.remote_port || conn.RemotePort || conn.RemotePortNumber || '?';
        const state = conn.State || conn.state || '';
        
        if (localAddr !== 'N/A' || remoteAddr !== 'N/A') {
          networkInfo += `- Connection: ${localAddr}:${localPort} -> ${remoteAddr}:${remotePort}${state ? ` (${state})` : ''}\n`;
        }
      });
    }
    return networkInfo || 'Network data format not recognized\n';
  }

  /**
   * Summarize scan results for better prompt context
   */
  summarizeScanResults(scanResults) {
    const summary = {
      totalPlugins: Object.keys(scanResults).length,
      successfulScans: 0,
      failedScans: 0,
      pluginTypes: []
    };

    Object.entries(scanResults).forEach(([plugin, result]) => {
      if (result.success) {
        summary.successfulScans++;
      } else {
        summary.failedScans++;
      }
      
      // Categorize plugin types
      if (plugin.includes('pslist') || plugin.includes('pstree') || plugin.includes('psscan')) {
        summary.pluginTypes.push('Process Analysis');
      } else if (plugin.includes('filescan') || plugin.includes('file')) {
        summary.pluginTypes.push('File System Analysis');
      } else if (plugin.includes('net') || plugin.includes('socket')) {
        summary.pluginTypes.push('Network Analysis');
      } else if (plugin.includes('registry')) {
        summary.pluginTypes.push('Registry Analysis');
      } else if (plugin.includes('malfind') || plugin.includes('malware')) {
        summary.pluginTypes.push('Malware Analysis');
      }
    });

    return summary;
  }

  /**
   * Build a formatting prompt for individual plugin output
   */
  buildPluginFormatPrompt(pluginName, pluginResult, pluginDisplayName) {
    const displayName = pluginDisplayName || pluginName.replace('windows.', '').replace(/([A-Z])/g, ' $1').trim();
    
    return `Convert this forensics data to clean, organized markdown. Keep it simple and readable.

## ${displayName} Results

\`\`\`json
${JSON.stringify(pluginResult.output, null, 2)}
\`\`\`

Format as:
- Clean markdown tables for structured data
- **Bold** important values (PIDs, paths, addresses)
- Bullet points for lists
- \`code formatting\` for technical values
- Keep descriptions brief and factual

${this.getSimpleFormatGuidance(pluginName)}

Just output clean markdown - no lengthy analysis or recommendations.`;
  }

  /**
   * Get plugin category for better formatting context
   */
  getPluginCategory(pluginName) {
    if (pluginName.includes('pslist') || pluginName.includes('pstree') || pluginName.includes('cmdline')) {
      return 'Process Analysis';
    } else if (pluginName.includes('filescan') || pluginName.includes('dumpfiles')) {
      return 'File System Analysis';
    } else if (pluginName.includes('netscan') || pluginName.includes('netstat')) {
      return 'Network Analysis';
    } else if (pluginName.includes('registry') || pluginName.includes('hivelist')) {
      return 'Registry Analysis';
    } else if (pluginName.includes('malfind') || pluginName.includes('hollowfind')) {
      return 'Malware Detection';
    } else if (pluginName.includes('dlllist') || pluginName.includes('modules')) {
      return 'Binary Analysis';
    } else if (pluginName.includes('vadinfo') || pluginName.includes('memmap')) {
      return 'Memory Analysis';
    }
    return 'System Analysis';
  }

  /**
   * Get simple formatting guidance for different plugin types
   */
  getSimpleFormatGuidance(pluginName) {
    if (pluginName.includes('pslist') || pluginName.includes('pstree')) {
      return 'Focus on: Process names, PIDs, parent relationships, start times';
    } else if (pluginName.includes('netscan')) {
      return 'Focus on: Local/remote addresses, ports, connection states, associated processes';
    } else if (pluginName.includes('filescan')) {
      return 'Focus on: File paths, handles, access times, file sizes';
    } else if (pluginName.includes('cmdline')) {
      return 'Focus on: Process names, command line arguments, execution paths';
    } else if (pluginName.includes('dlllist')) {
      return 'Focus on: DLL names, base addresses, load paths, process associations';
    } else if (pluginName.includes('handles')) {
      return 'Focus on: Handle types, values, access permissions, associated objects';
    }
    return 'Focus on: Key data fields, important values, technical details';
  }

  /**
   * Generate a quick summary for the scan results
   */
  async generateQuickSummary(scanResults) {
    // Check if Ollama is running
    const isConnected = await this.checkOllamaConnection();
    if (!isConnected) {
      return {
        success: false,
        error: 'Ollama is not running. Please start Ollama service.',
        timestamp: new Date().toISOString()
      };
    }

    const extractedData = this.extractReadableData(scanResults);
    
    const prompt = `You are a digital forensics expert. Analyze the ACTUAL memory forensics scan results below and provide exactly 3 sentences about what you found in this specific memory dump.

=== ACTUAL FORENSIC DATA FOUND ===
${extractedData}

Based on the real data above, provide exactly 3 sentences:
1. What specific processes, files, or system artifacts were actually found in this scan
2. Any suspicious or notable findings from the actual data shown
3. Your security assessment based on these specific findings

Analyze only the actual data provided - no generic examples.`;

    try {
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,
          top_p: 0.9,
          top_k: 20,
          num_ctx: 4096
        }
      });

      return {
        success: true,
        summary: response.data.response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Generate a comprehensive forensic report and export as signed PDF
   */
  async generateSignedPDFReport(scanResults, imageInfo = {}) {
    try {
      // First generate the forensic report content
      const reportResult = await this.generateForensicReport(scanResults, imageInfo);
      
      if (!reportResult.success) {
        return {
          success: false,
          error: `Failed to generate report: ${reportResult.error}`,
          timestamp: new Date().toISOString()
        };
      }

      // Use the AI-generated report directly as markdown
      const markdownReport = reportResult.report;

      // Generate signed PDF
      const pdfResult = await this.pdfGenerator.generatePDFReport(
        markdownReport,
        'MemHawk Forensic Analysis Report',
        imageInfo
      );

      if (!pdfResult.success) {
        return {
          success: false,
          error: `Failed to generate PDF: ${pdfResult.error}`,
          timestamp: new Date().toISOString()
        };
      }

      // Save PDF to file system
      const saveResult = await this.pdfGenerator.savePDFToFile(
        pdfResult.pdfBuffer,
        pdfResult.filename
      );

      return {
        success: true,
        report: reportResult.report,
        pdfPath: saveResult.success ? saveResult.path : null,
        pdfDirectory: saveResult.success ? saveResult.directory : null,
        reportId: pdfResult.reportId,
        signature: pdfResult.signature,
        filename: pdfResult.filename,
        timestamp: pdfResult.timestamp,
        saveError: saveResult.success ? null : saveResult.error
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Generate signed PDF from existing AI markdown report
   */
  async generatePDFFromMarkdown(markdownContent, imageInfo = {}) {
    try {
      // Generate signed PDF directly from markdown content
      const pdfResult = await this.pdfGenerator.generatePDFReport(
        markdownContent,
        'MemHawk Forensic Analysis Report',
        imageInfo
      );

      if (!pdfResult.success) {
        return {
          success: false,
          error: `Failed to generate PDF: ${pdfResult.error}`,
          timestamp: new Date().toISOString()
        };
      }

      // Save PDF to file system
      const saveResult = await this.pdfGenerator.savePDFToFile(
        pdfResult.pdfBuffer,
        pdfResult.filename
      );

      return {
        success: true,
        pdfPath: saveResult.success ? saveResult.path : null,
        pdfDirectory: saveResult.success ? saveResult.directory : null,
        reportId: pdfResult.reportId,
        signature: pdfResult.signature,
        filename: pdfResult.filename,
        timestamp: pdfResult.timestamp,
        saveError: saveResult.success ? null : saveResult.error
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Format the AI-generated report as proper Markdown
   */
  formatReportAsMarkdown(aiReport, scanResults, imageInfo) {
    const timestamp = new Date().toLocaleString();
    const pluginCount = Object.keys(scanResults).length;
    const successfulScans = Object.values(scanResults).filter(r => r.success).length;

    return `# MemHawk Forensic Analysis Report

## Executive Summary

${aiReport}

## Analysis Statistics

- **Total Plugins Executed:** ${pluginCount}
- **Successful Scans:** ${successfulScans}
- **Failed Scans:** ${pluginCount - successfulScans}
- **Analysis Date:** ${timestamp}
- **Memory Image:** ${imageInfo.filename || 'Unknown'}

## Detailed Plugin Results

${this.generateDetailedPluginResults(scanResults)}

## Technical Metadata

- **Tool:** MemHawk v1.0.0 (Open Source Memory Forensics)
- **Analysis Engine:** Volatility 3 Framework
- **AI Analysis:** Local Ollama (${this.model})
- **Report Format:** Digitally Signed PDF
- **Confidence Level:** Based on algorithmic analysis and pattern recognition

## Disclaimer

This report was generated using automated forensic analysis tools. While every effort has been made to ensure accuracy, the findings should be reviewed and validated by qualified digital forensics professionals. The analysis is based on memory dump examination and may not capture all system activities.

---

**Report Generated by MemHawk Forensics Platform**  
*Open Source Digital Memory Analysis Tool*`;
  }

  /**
   * Generate detailed plugin results in Markdown format
   */
  generateDetailedPluginResults(scanResults) {
    let markdown = '';
    
    Object.entries(scanResults).forEach(([pluginName, result]) => {
      const displayName = pluginName.replace('windows.', '').replace(/([A-Z])/g, ' $1').trim();
      
      markdown += `### ${displayName.toUpperCase()}\n\n`;
      
      if (result.success) {
        markdown += `**Status:** ✅ Success\n\n`;
        
        if (typeof result.output === 'string' && result.output.length > 0) {
          markdown += '```\n';
          markdown += result.output.substring(0, 1000);
          if (result.output.length > 1000) {
            markdown += '\n... (truncated)';
          }
          markdown += '\n```\n\n';
        } else if (typeof result.output === 'object') {
          // Format structured data
          if (pluginName.includes('pslist') && Array.isArray(result.output)) {
            markdown += '| Process Name | PID | PPID | Threads | Handles |\n';
            markdown += '|--------------|-----|------|---------|----------|\n';
            result.output.slice(0, 10).forEach(proc => {
              markdown += `| ${proc.name || 'N/A'} | ${proc.pid || 'N/A'} | ${proc.ppid || 'N/A'} | ${proc.threads || 'N/A'} | ${proc.handles || 'N/A'} |\n`;
            });
            markdown += '\n';
          } else {
            markdown += '```json\n';
            markdown += JSON.stringify(result.output, null, 2).substring(0, 800);
            markdown += '\n```\n\n';
          }
        }
      } else {
        markdown += `**Status:** ❌ Failed\n`;
        markdown += `**Error:** ${result.error}\n\n`;
      }
    });
    
    return markdown;
  }
}

module.exports = OllamaReportGenerator;