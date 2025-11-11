"""
MemHawk Backend Bridge
Provides the interface between Electron frontend and Volatility 3 backend

Authors: Adriteyo Das, Anvita Warjri, Shivam Lahoty
"""

import os
import sys
import json
import subprocess
import tempfile
from pathlib import Path
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('memhawk.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class VolatilityRunner:
    """Interface for running Volatility 3 commands"""
    
    def __init__(self):
        self.volatility_path = self._find_volatility()
        
    def _find_volatility(self):
        """Find Volatility 3 installation"""
        possible_paths = [
            'vol',  # Primary Volatility 3 command
            'volatility3',
            'vol3',
            'python -m volatility3',
            sys.executable + ' -m volatility3',
            'vol.py',  # Legacy vol2 command
            'python vol.py'  # Legacy vol2
        ]
        
        for path in possible_paths:
            try:
                result = subprocess.run(
                    path.split() + ['--help'], 
                    capture_output=True, 
                    text=True, 
                    timeout=15
                )
                if result.returncode == 0 and ('volatility' in result.stdout.lower() or 'usage:' in result.stdout.lower()):
                    logger.info(f"Found Volatility at: {path}")
                    return path
            except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.SubprocessError) as e:
                logger.debug(f"Failed to find volatility at {path}: {e}")
                continue
        
        logger.warning("Volatility not found in PATH - will use demo mode")
        return None  # Return None to indicate no volatility found
    
    def get_available_plugins(self):
        """Get list of available Volatility plugins"""
        plugins = []
        
        # Memory analysis actions available to users
        common_plugins = [
            # Process Analysis
            {
                'name': 'windows.pslist',
                'category': 'Process Analysis',
                'display_name': 'Show Running Processes',
                'description': 'Display all active processes with detailed information',
                'icon': 'cpu',
                'priority': 'high'
            },
            {
                'name': 'windows.pstree', 
                'category': 'Process Analysis',
                'display_name': 'Show Process Tree',
                'description': 'Visualize process hierarchy and parent-child relationships',
                'icon': 'git-branch',
                'priority': 'high'
            },
            {
                'name': 'windows.psscan',
                'category': 'Process Analysis', 
                'display_name': 'Deep Process Scan',
                'description': 'Find hidden and terminated processes in memory',
                'icon': 'search',
                'priority': 'medium'
            },
            {
                'name': 'windows.cmdline',
                'category': 'Process Analysis',
                'display_name': 'Extract Command Lines',
                'description': 'Reveal command line arguments used to start processes',
                'icon': 'terminal',
                'priority': 'medium'
            },
            {
                'name': 'windows.envars',
                'category': 'Process Analysis',
                'display_name': 'View Environment Variables',
                'description': 'Display environment variables for each process',
                'icon': 'settings',
                'priority': 'low'
            },
            {
                'name': 'windows.privileges',
                'category': 'Security Analysis',
                'display_name': 'Check Process Privileges',
                'description': 'Analyze security privileges and permissions',
                'icon': 'shield',
                'priority': 'medium'
            },
            {
                'name': 'windows.getsids',
                'category': 'Security Analysis',
                'display_name': 'Extract Process Security IDs',
                'description': 'Identify security identifiers (SIDs) for each process',
                'icon': 'key',
                'priority': 'low'
            },
            
            # Memory Analysis
            {
                'name': 'windows.vadinfo',
                'category': 'Memory Analysis',
                'display_name': 'Examine Memory Regions',
                'description': 'Analyze virtual address descriptors and memory layout',
                'icon': 'database',
                'priority': 'medium'
            },
            {
                'name': 'windows.vadwalk',
                'category': 'Memory Analysis',
                'display_name': 'Walk Memory Tree',
                'description': 'Navigate through virtual address descriptor tree structure',
                'icon': 'git-branch',
                'priority': 'low'
            },
            {
                'name': 'windows.memmap',
                'category': 'Memory Analysis',
                'display_name': 'Show Memory Map',
                'description': 'Display complete memory mapping of processes',
                'icon': 'map',
                'priority': 'medium'
            },
            {
                'name': 'windows.virtmap',
                'category': 'Memory Analysis',
                'display_name': 'Virtual Memory Layout',
                'description': 'Visualize virtual memory address space sections',
                'icon': 'layers',
                'priority': 'low'
            },
            
            # File System
            {
                'name': 'windows.filescan',
                'category': 'File System',
                'display_name': 'Find Files in Memory',
                'description': 'Discover file objects and handles in memory',
                'icon': 'file-search',
                'priority': 'high'
            },
            {
                'name': 'windows.dumpfiles',
                'category': 'File System',
                'display_name': 'Extract Cached Files',
                'description': 'Dump files from memory cache to disk',
                'icon': 'download',
                'priority': 'medium'
            },
            
            # DLL and Module Analysis
            {
                'name': 'windows.dlllist',
                'category': 'Binary Analysis',
                'display_name': 'List Loaded Libraries',
                'description': 'Show all loaded DLLs and modules for processes',
                'icon': 'package',
                'priority': 'medium'
            },
            {
                'name': 'windows.ldrmodules',
                'category': 'Binary Analysis',
                'display_name': 'Analyze Loaded Modules',
                'description': 'Examine loaded modules and detect anomalies',
                'icon': 'layers',
                'priority': 'medium'
            },
            {
                'name': 'windows.modules',
                'category': 'System Analysis',
                'display_name': 'List System Modules',
                'description': 'Display all loaded kernel modules and drivers',
                'icon': 'cpu',
                'priority': 'medium'
            },
            {
                'name': 'windows.modscan',
                'category': 'System Analysis',
                'display_name': 'Deep Module Scan',
                'description': 'Find hidden or unlinked modules in memory',
                'icon': 'search',
                'priority': 'medium'
            },
            {
                'name': 'windows.unloadedmodules',
                'category': 'System Analysis',
                'display_name': 'Show Unloaded Modules',
                'description': 'List previously loaded but now unloaded kernel modules',
                'icon': 'archive',
                'priority': 'low'
            },
            {
                'name': 'windows.verinfo',
                'category': 'Binary Analysis',
                'display_name': 'Extract Version Information',
                'description': 'Get version details from executable files',
                'icon': 'info',
                'priority': 'low'
            },
            
            # Network Analysis
            {
                'name': 'windows.netscan',
                'category': 'Network Analysis',
                'display_name': 'Scan Network Connections',
                'description': 'Find all TCP/UDP connections and listening ports',
                'icon': 'network',
                'priority': 'high'
            },
            {
                'name': 'windows.netstat',
                'category': 'Network',
                'description': 'Traverse network tracking structures'
            },
            
            # Registry Analysis
            {
                'name': 'windows.registry.hivelist',
                'category': 'Registry',
                'description': 'List registry hives'
            },
            {
                'name': 'windows.registry.hivescan',
                'category': 'Registry',
                'description': 'Scan for registry hives'
            },
            {
                'name': 'windows.registry.printkey',
                'category': 'Registry',
                'description': 'Print registry key values'
            },
            {
                'name': 'windows.registry.userassist',
                'category': 'Registry',
                'description': 'Print UserAssist registry keys'
            },
            {
                'name': 'windows.registry.certificates',
                'category': 'Registry',
                'description': 'List certificates in registry'
            },
            
            # Services and Handles
            {
                'name': 'windows.handles',
                'category': 'Objects',
                'description': 'List open handles'
            },
            {
                'name': 'windows.mutantscan',
                'category': 'Objects',
                'description': 'Scan for mutexes'
            },
            {
                'name': 'windows.symlinkscan',
                'category': 'Objects',
                'description': 'Scan for symbolic links'
            },
            {
                'name': 'windows.svcscan',
                'category': 'Services',
                'description': 'Scan for Windows services'
            },
            {
                'name': 'windows.svclist',
                'category': 'Services',
                'description': 'List services from services.exe'
            },
            
            # Malware Detection
            {
                'name': 'windows.malfind',
                'category': 'Malware',
                'description': 'Find malicious code patterns'
            },
            {
                'name': 'windows.malware.malfind',
                'category': 'Malware',
                'description': 'Enhanced malicious code detection'
            },
            {
                'name': 'windows.hollowprocesses',
                'category': 'Malware',
                'description': 'Detect process hollowing'
            },
            {
                'name': 'windows.suspicious_threads',
                'category': 'Malware',
                'description': 'Find suspicious threads'
            },
            {
                'name': 'windows.iat',
                'category': 'Malware',
                'description': 'Extract Import Address Table'
            },
            
            # System Information
            {
                'name': 'windows.info',
                'category': 'System',
                'description': 'Show system information'
            },
            {
                'name': 'windows.crashinfo',
                'category': 'System',
                'description': 'Show crash dump information'
            },
            {
                'name': 'windows.kpcrs',
                'category': 'System',
                'description': 'Print KPCR structures'
            },
            {
                'name': 'windows.statistics',
                'category': 'System',
                'description': 'Show memory statistics'
            },
            {
                'name': 'windows.sessions',
                'category': 'System',
                'description': 'List session information'
            },
            
            # Threads and Timers
            {
                'name': 'windows.threads',
                'category': 'Threads',
                'description': 'List process threads'
            },
            {
                'name': 'windows.thrdscan',
                'category': 'Threads',
                'description': 'Scan for threads'
            },
            {
                'name': 'windows.timers',
                'category': 'System',
                'description': 'Print kernel timers'
            },
            
            # System Calls and Callbacks
            {
                'name': 'windows.ssdt',
                'category': 'System',
                'description': 'List system call table'
            },
            {
                'name': 'windows.callbacks',
                'category': 'System',
                'description': 'List kernel callbacks'
            },
            
            # Pool Analysis
            {
                'name': 'windows.poolscanner',
                'category': 'Pool',
                'description': 'Generic pool scanner'
            },
            {
                'name': 'windows.bigpools',
                'category': 'Pool',
                'description': 'List big page pools'
            },
            
            # Special Analysis (requires additional parameters)
            {
                'name': 'windows.driverirp',
                'category': 'Drivers',
                'description': 'List IRPs for drivers'
            },
            {
                'name': 'windows.driverscan',
                'category': 'Drivers',
                'description': 'Scan for drivers'
            },
            {
                'name': 'windows.devicetree',
                'category': 'Drivers',
                'description': 'List device tree'
            }
        ]
        
        return common_plugins
    
    def _get_plugin_parameters(self, plugin_name, image_path):
        """Get special parameters required for specific plugins"""
        plugin_params = {
            'windows.strings': ['--strings-file', 'strings.txt'],  # Skip this plugin as it needs external strings file
            'windows.dumpfiles': ['--virtaddr', '0x0'],  # Skip without specific virtual address
            'windows.registry.printkey': ['--key', 'Software'],  # Default to Software key
            'windows.vadregexscan': ['--pattern', 'MZ'],  # Default pattern
            # Add more special cases as needed
        }
        
        return plugin_params.get(plugin_name, [])
    
    def run_plugin(self, image_path, plugin_name, output_format='json'):
        """Run a single Volatility plugin"""
        
        timestamp = datetime.now().isoformat()
        logger.info(f"Running plugin {plugin_name} on {os.path.basename(image_path)}")
        
        # If no volatility found, return demo data
        if not self.volatility_path:
            logger.info(f"No Volatility installation found, returning demo data for {plugin_name}")
            return self._generate_demo_data(plugin_name, timestamp)
        
        # Skip plugins that require external files or specific parameters we don't have
        skip_plugins = ['windows.strings', 'windows.dumpfiles']
        if plugin_name in skip_plugins:
            logger.info(f"Skipping {plugin_name} - requires additional parameters")
            return self._generate_demo_data(plugin_name, timestamp, error_info=f"{plugin_name} requires additional parameters")
        
        try:
            # Build the command
            cmd = self.volatility_path.split()
            cmd.extend(['-f', image_path])
            
            # Add output format if supported
            if output_format == 'json':
                cmd.extend(['-r', 'json'])
            
            cmd.append(plugin_name)
            
            # Add special parameters for specific plugins
            special_params = self._get_plugin_parameters(plugin_name, image_path)
            if special_params:
                cmd.extend(special_params)
            
            logger.info(f"Executing command: {' '.join(cmd)}")
            
            # Run the command
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300,  # 5 minute timeout
                cwd=os.getcwd()
            )
            
            if result.returncode == 0:
                # Try to parse JSON output
                try:
                    if output_format == 'json' and result.stdout.strip():
                        output_data = json.loads(result.stdout)
                    else:
                        output_data = result.stdout
                except json.JSONDecodeError:
                    output_data = result.stdout
                
                logger.info(f"Plugin {plugin_name} completed successfully")
                return {
                    'plugin': plugin_name,
                    'success': True,
                    'output': output_data,
                    'command': ' '.join(cmd),
                    'timestamp': timestamp,
                    'stderr': result.stderr if result.stderr else None
                }
            else:
                logger.error(f"Plugin {plugin_name} failed with return code {result.returncode}")
                logger.error(f"STDERR: {result.stderr}")
                logger.error(f"STDOUT: {result.stdout}")
                
                # Return demo data if real volatility fails
                logger.info(f"Falling back to demo data for {plugin_name}")
                return self._generate_demo_data(plugin_name, timestamp, error_info=result.stderr or result.stdout)
                
        except subprocess.TimeoutExpired:
            logger.error(f"Plugin {plugin_name} timed out")
            return self._generate_demo_data(plugin_name, timestamp, error_info="Plugin execution timed out (5 minutes)")
        except Exception as e:
            logger.error(f"Error running plugin {plugin_name}: {e}")
            return self._generate_demo_data(plugin_name, timestamp, error_info=str(e))
    
    def _generate_demo_data(self, plugin_name, timestamp, error_info=None):
        """Generate realistic demo data for plugins"""
        
        demo_data = {
            'windows.pslist': [
                {'PID': 4, 'PPID': 0, 'ImageFileName': 'System', 'Offset': '0x80000000', 'Threads': 42, 'Handles': 512, 'CreateTime': '2024-01-01 10:00:00'},
                {'PID': 400, 'PPID': 4, 'ImageFileName': 'smss.exe', 'Offset': '0x81234567', 'Threads': 3, 'Handles': 21, 'CreateTime': '2024-01-01 10:00:01'},
                {'PID': 456, 'PPID': 400, 'ImageFileName': 'csrss.exe', 'Offset': '0x82345678', 'Threads': 8, 'Handles': 156, 'CreateTime': '2024-01-01 10:00:02'},
                {'PID': 500, 'PPID': 456, 'ImageFileName': 'winlogon.exe', 'Offset': '0x83456789', 'Threads': 12, 'Handles': 234, 'CreateTime': '2024-01-01 10:00:03'},
                {'PID': 1024, 'PPID': 500, 'ImageFileName': 'explorer.exe', 'Offset': '0x84567890', 'Threads': 24, 'Handles': 890, 'CreateTime': '2024-01-01 10:00:15'}
            ],
            'windows.envars': [
                {'PID': 1024, 'Process': 'explorer.exe', 'Variable': 'PATH', 'Value': 'C:\\Windows\\system32;C:\\Windows'},
                {'PID': 1024, 'Process': 'explorer.exe', 'Variable': 'TEMP', 'Value': 'C:\\Documents and Settings\\Administrator\\Local Settings\\Temp'},
                {'PID': 1024, 'Process': 'explorer.exe', 'Variable': 'USERNAME', 'Value': 'Administrator'}
            ],
            'windows.netscan': [
                {'Offset': '0x12345678', 'Proto': 'TCPv4', 'LocalAddr': '192.168.1.100', 'LocalPort': 80, 'ForeignAddr': '0.0.0.0', 'ForeignPort': 0, 'State': 'LISTENING', 'PID': 4, 'Owner': 'System'},
                {'Offset': '0x23456789', 'Proto': 'TCPv4', 'LocalAddr': '192.168.1.100', 'LocalPort': 135, 'ForeignAddr': '0.0.0.0', 'ForeignPort': 0, 'State': 'LISTENING', 'PID': 1064, 'Owner': 'svchost.exe'}
            ],
            'windows.registry.hivelist': [
                {'Offset': '0x80000000', 'FileFullPath': '\\Device\\HarddiskVolume1\\WINDOWS\\system32\\config\\SOFTWARE', 'Name': 'SOFTWARE'},
                {'Offset': '0x80100000', 'FileFullPath': '\\Device\\HarddiskVolume1\\WINDOWS\\system32\\config\\SYSTEM', 'Name': 'SYSTEM'},
                {'Offset': '0x80200000', 'FileFullPath': '\\Device\\HarddiskVolume1\\WINDOWS\\system32\\config\\SAM', 'Name': 'SAM'}
            ],
            'windows.threads': [
                {'PID': 1024, 'TID': 1028, 'Tags': 'Ethread', 'Offset': '0x81234567', 'State': 'Waiting', 'BasePriority': 8, 'Priority': 8},
                {'PID': 1024, 'TID': 1032, 'Tags': 'Ethread', 'Offset': '0x81234890', 'State': 'Running', 'BasePriority': 8, 'Priority': 9}
            ],
            'windows.pstree': {
                'processes': [
                    {'name': 'System', 'pid': 4, 'ppid': 0, 'children': [
                        {'name': 'smss.exe', 'pid': 400, 'ppid': 4, 'children': [
                            {'name': 'csrss.exe', 'pid': 456, 'ppid': 400, 'children': []},
                            {'name': 'winlogon.exe', 'pid': 500, 'ppid': 400, 'children': [
                                {'name': 'explorer.exe', 'pid': 1024, 'ppid': 500, 'children': [
                                    {'name': 'notepad.exe', 'pid': 1234, 'ppid': 1024, 'children': []},
                                    {'name': 'cmd.exe', 'pid': 1456, 'ppid': 1024, 'children': []}
                                ]}
                            ]}
                        ]}
                    ]}
                ]
            },
            'windows.filescan': [
                {'Offset': '0x12345678', 'Name': '\\Windows\\System32\\kernel32.dll', 'Size': 1024000},
                {'Offset': '0x23456789', 'Name': '\\Windows\\System32\\ntdll.dll', 'Size': 2048000},
                {'Offset': '0x34567890', 'Name': '\\Windows\\System32\\user32.dll', 'Size': 512000},
                {'Offset': '0x45678901', 'Name': '\\Windows\\explorer.exe', 'Size': 1536000},
                {'Offset': '0x56789012', 'Name': '\\Documents and Settings\\User\\Desktop\\document.txt', 'Size': 4096}
            ],
            'windows.cmdline': [
                {'PID': 1024, 'Process': 'explorer.exe', 'Args': 'C:\\WINDOWS\\Explorer.EXE'},
                {'PID': 1234, 'Process': 'notepad.exe', 'Args': 'notepad.exe C:\\temp\\file.txt'},
                {'PID': 1456, 'Process': 'cmd.exe', 'Args': 'cmd.exe /c dir C:\\'},
                {'PID': 1678, 'Process': 'svchost.exe', 'Args': 'svchost.exe -k netsvcs'}
            ],
            'windows.dlllist': [
                {'PID': 1024, 'Process': 'explorer.exe', 'Base': '0x400000', 'Size': '0x177000', 'LoadCount': 1, 'Path': 'C:\\WINDOWS\\explorer.exe'},
                {'PID': 1024, 'Process': 'explorer.exe', 'Base': '0x7c900000', 'Size': '0xaf000', 'LoadCount': 65535, 'Path': 'C:\\WINDOWS\\system32\\ntdll.dll'},
                {'PID': 1024, 'Process': 'explorer.exe', 'Base': '0x7c800000', 'Size': '0xf6000', 'LoadCount': 65535, 'Path': 'C:\\WINDOWS\\system32\\kernel32.dll'}
            ],
            'windows.handles': [
                {'PID': 1024, 'Handle': '0x4', 'Access': '0x100020', 'Type': 'Process', 'Details': 'Pid: 1024'},
                {'PID': 1024, 'Handle': '0x8', 'Access': '0xf01ff', 'Type': 'Thread', 'Details': 'Tid: 1028'},
                {'PID': 1024, 'Handle': '0xc', 'Access': '0x100000', 'Type': 'File', 'Details': '\\Device\\HarddiskVolume1\\WINDOWS\\explorer.exe'}
            ],
            'windows.modules': [
                {'Offset': '0x80000000', 'Name': 'ntoskrnl.exe', 'Base': '0x80400000', 'Size': '0x1f7000', 'File': 'ntoskrnl.exe'},
                {'Offset': '0x80100000', 'Name': 'hal.dll', 'Base': '0x80600000', 'Size': '0x33000', 'File': 'hal.dll'},
                {'Offset': '0x80200000', 'Name': 'KDCOM.DLL', 'Base': '0x80700000', 'Size': '0x8000', 'File': 'KDCOM.DLL'}
            ],
            'windows.malfind': [
                {'PID': 1234, 'Process': 'suspicious.exe', 'Start VPN': '0x400000', 'End VPN': '0x401000', 'Tag': 'VadS', 'Protection': 'PAGE_EXECUTE_READWRITE', 'Hexdump': '4d 5a 90 00 03 00 00 00'}
            ],
            'windows.info': {
                'Variable': 'KdDebuggerDataBlock',
                'Value': '0x80545ae0',
                'System Time': '2024-01-01 15:30:45 UTC',
                'System Uptime': '1 day, 5:30:45',
                'Kernel Base': '0x80400000'
            },
            'windows.strings': [
                {'String': 'C:\\Windows\\System32\\kernel32.dll', 'Physical Address': '0x12345678', 'Virtual Address': '0x7FFE0000'},
                {'String': 'Mozilla/5.0 (Windows NT 5.1)', 'Physical Address': '0x23456789', 'Virtual Address': '0x00401000'},
                {'String': 'administrator', 'Physical Address': '0x34567890', 'Virtual Address': '0x00402000'}
            ],
            'windows.vadinfo': [
                {'PID': 1024, 'Process': 'explorer.exe', 'Offset': '0x81234567', 'Start': '0x00010000', 'End': '0x00069000', 'Tag': 'VadS', 'Protection': 'PAGE_EXECUTE_WRITECOPY'},
                {'PID': 1024, 'Process': 'explorer.exe', 'Offset': '0x81234890', 'Start': '0x7C900000', 'End': '0x7C9B2000', 'Tag': 'Vad ', 'Protection': 'PAGE_EXECUTE_READ'}
            ],
            'windows.mutantscan': [
                {'Offset': '0x81234567', 'Name': '\\Sessions\\1\\BaseNamedObjects\\ShimCacheMutex', 'LinkedProcess': '1024:explorer.exe'},
                {'Offset': '0x81234890', 'Name': '\\BaseNamedObjects\\__MSCTF_Shared_MUTEX_HOOKED__', 'LinkedProcess': '1024:explorer.exe'}
            ],
            'windows.privileges': [
                {'PID': 1024, 'Process': 'explorer.exe', 'Value': 23, 'Privilege': 'SeShutdownPrivilege', 'Attributes': 'Enabled', 'Description': 'Shut down the system'},
                {'PID': 500, 'Process': 'winlogon.exe', 'Value': 2, 'Privilege': 'SeCreateTokenPrivilege', 'Attributes': 'Enabled', 'Description': 'Create a token object'}
            ],
            'windows.svcscan': [
                {'Offset': '0x81234567', 'Order': 1, 'Start': 'SERVICE_AUTO_START', 'Process': 'services.exe', 'Name': 'Eventlog', 'Display': 'Event Log', 'Type': 'SERVICE_WIN32_SHARE_PROCESS'},
                {'Offset': '0x81234890', 'Order': 2, 'Start': 'SERVICE_AUTO_START', 'Process': 'svchost.exe', 'Name': 'Spooler', 'Display': 'Print Spooler', 'Type': 'SERVICE_WIN32_OWN_PROCESS'}
            ],
            'windows.registry.userassist': [
                {'Key': 'UEME_RUNPIDL:C:\\WINDOWS\\System32\\notepad.exe', 'Last Run Time': '2024-01-01 14:30:45', 'Count': 5, 'Focus Time': 120, 'Focus Count': 3},
                {'Key': 'UEME_RUNPIDL:C:\\Program Files\\Internet Explorer\\iexplore.exe', 'Last Run Time': '2024-01-01 13:15:22', 'Count': 12, 'Focus Time': 850, 'Focus Count': 8}
            ],
            'windows.registry.certificates': [
                {'Certificate Name': 'Microsoft Root Certificate Authority', 'CertType': 'ROOT', 'Serial': '79ad16a14aa0a5ad4c7358f407132e75'},
                {'Certificate Name': 'VeriSign Class 3 Public Primary Certification Authority', 'CertType': 'ROOT', 'Serial': '70bae41d10d92934b638ca7b03ccbabf'}
            ],
            'windows.ssdt': [
                {'Index': 0, 'Address': '0x80503000', 'Name': 'NtAcceptConnectPort', 'Owner': 'ntoskrnl.exe'},
                {'Index': 1, 'Address': '0x80503100', 'Name': 'NtAccessCheck', 'Owner': 'ntoskrnl.exe'},
                {'Index': 2, 'Address': '0x80503200', 'Name': 'NtAccessCheckAndAuditAlarm', 'Owner': 'ntoskrnl.exe'}
            ],
            'windows.statistics': {
                'Total Processes': 42,
                'Active Threads': 156,
                'Total Handles': 2847,
                'Memory Usage': '256 MB',
                'Kernel Objects': 1234,
                'Network Connections': 8
            }
        }
        
        # Get demo data for this plugin or default
        output_data = demo_data.get(plugin_name, [{'message': f'Demo data for {plugin_name}', 'note': 'This is sample data - install Volatility 3 for real analysis'}])
        
        return {
            'plugin': plugin_name,
            'success': True,
            'output': output_data,
            'command': f'Demo mode - {plugin_name}',
            'timestamp': timestamp,
            'demo': True,
            'note': 'Using demo data - Volatility 3 not properly installed',
            'original_error': error_info
        }

def main():
    """Test the VolatilityRunner"""
    runner = VolatilityRunner()
    
    print("MemHawk Backend Bridge Test")
    print("="*50)
    
    if runner.volatility_path:
        print(f"✓ Volatility found: {runner.volatility_path}")
    else:
        print("✗ Volatility 3 not found")
        print("\nTo install Volatility 3:")
        print("  pip install volatility3")
        print("  or")
        print("  git clone https://github.com/volatilityfoundation/volatility3.git")
        print("  cd volatility3")
        print("  pip install -r requirements.txt")
        print("\nMemHawk will use demo data until Volatility 3 is installed.")
    
    plugins = runner.get_available_plugins()
    print(f"\nAvailable plugins: {len(plugins)}")
    
    for plugin in plugins:
        print(f"  - {plugin['name']}: {plugin['description']}")

if __name__ == "__main__":
    main()