#!/usr/bin/env python3
"""
MemHawk - Modern Memory Forensics Tool
Entry point for the Electron-based GUI application

Authors: Adriteyo Das, Anvita Warjri, Shivam Lahoty
"""

import os
import sys
import subprocess
import pathlib
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed"""
    
    # Check for Node.js
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode != 0:
            print("Error: Node.js is not installed or not in PATH")
            return False
        print(f"✓ Node.js {result.stdout.strip()} found")
    except FileNotFoundError:
        print("✗ Node.js not found. Please install Node.js 16.x or later")
        return False
    
    # Check for npm - try multiple possible locations
    npm_commands = ['npm', 'npm.cmd']
    npm_found = False
    
    for npm_cmd in npm_commands:
        try:
            result = subprocess.run([npm_cmd, '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✓ npm {result.stdout.strip()} found")
                npm_found = True
                break
        except FileNotFoundError:
            continue
    
    if not npm_found:
        print("✗ npm not found. This usually means:")
        print("  1. Node.js was installed without npm")
        print("  2. npm is not in your system PATH")
        print("  3. You need to restart your terminal/command prompt")
        print("\nTry these solutions:")
        print("  • Close and reopen your terminal")
        print("  • Reinstall Node.js from https://nodejs.org (includes npm)")
        print("  • Or try running: start-memhawk.bat (which uses npm.cmd)")
        return False
    
    return True

def install_dependencies():
    """Install Node.js dependencies if needed"""
    
    # Try to find the right npm command
    npm_cmd = 'npm'
    try:
        subprocess.run([npm_cmd, '--version'], capture_output=True, text=True, check=True)
    except (FileNotFoundError, subprocess.CalledProcessError):
        npm_cmd = 'npm.cmd'
        try:
            subprocess.run([npm_cmd, '--version'], capture_output=True, text=True, check=True)
        except (FileNotFoundError, subprocess.CalledProcessError):
            print("npm command not found for dependency installation")
            return False
    
    # Check if node_modules exists
    if not os.path.exists('node_modules'):
        print("Installing main dependencies...")
        result = subprocess.run([npm_cmd, 'install'], cwd='.')
        if result.returncode != 0:
            print("Failed to install main dependencies")
            return False
    
    # Check if frontend dependencies are installed
    frontend_node_modules = Path('frontend/node_modules')
    if not frontend_node_modules.exists():
        print("Installing frontend dependencies...")
        result = subprocess.run([npm_cmd, 'install'], cwd='frontend')
        if result.returncode != 0:
            print("Failed to install frontend dependencies")
            return False
    
    return True

def create_directories():
    """Create necessary directories"""
    directories = ['lib', 'case', 'src/data', 'output']
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✓ Directory '{directory}' ready")

def start_memhawk():
    """Start the MemHawk application"""
    
    print("\n" + "="*60)
    print("🦅 MemHawk - Memory Forensics Tool")
    print("Authors: Adriteyo Das, Anvita Warjri, Shivam Lahoty")
    print("="*60)
    
    # Check dependencies
    if not check_dependencies():
        print("\nPlease install the required dependencies and try again.")
        return False
    
    # Install dependencies if needed
    if not install_dependencies():
        print("\nFailed to install dependencies.")
        return False
    
    # Create directories
    create_directories()
    
    print("\n🚀 Starting MemHawk...")
    
    # Start the Electron application
    try:
        # Try to find the right npm command
        npm_cmd = 'npm'
        try:
            subprocess.run([npm_cmd, '--version'], capture_output=True, text=True, check=True)
        except (FileNotFoundError, subprocess.CalledProcessError):
            npm_cmd = 'npm.cmd'
        
        print(f"Starting MemHawk using: {npm_cmd} start")
        subprocess.run([npm_cmd, 'start'], cwd='.')
    except KeyboardInterrupt:
        print("\n\nMemHawk stopped by user.")
    except Exception as e:
        print(f"\nError starting MemHawk: {e}")
        print("Try using: start-memhawk.bat instead")
        return False
    
    return True

def main():
    """Main entry point"""
    
    # Change to the script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    if len(sys.argv) > 1:
        if sys.argv[1] in ['--help', '-h']:
            print("MemHawk - Modern Memory Forensics Tool")
            print("\nUsage:")
            print("  python memhawk.py          Start the application")
            print("  python memhawk.py --help   Show this help message")
            print("  python memhawk.py --dev    Start in development mode")
            return
        elif sys.argv[1] == '--dev':
            print("Starting MemHawk in development mode...")
            try:
                if os.name == 'nt':  # Windows
                    subprocess.run(['npm.cmd', 'run', 'electron-dev'], cwd='.')
                else:  # Unix/Linux/macOS
                    subprocess.run(['npm', 'run', 'electron-dev'], cwd='.')
            except KeyboardInterrupt:
                print("\nMemHawk development server stopped.")
            return
    
    # Normal startup
    success = start_memhawk()
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()