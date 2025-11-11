#!/usr/bin/env python3
"""
MemHawk Sandbox Test Suite
Tests the sandbox functionality with various scenarios

Authors: Adriteyo Das, Anvita Warjri, Shivam Lahoty
"""

import sys
import os
import tempfile
import json
from pathlib import Path

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

try:
    from sandbox import MemHawkSandbox, SandboxedVolatilityRunner
    from volatility_bridge import VolatilityRunner
except ImportError as e:
    print(f"Import error: {e}")
    print("Make sure you're in the correct directory and dependencies are installed")
    sys.exit(1)

def create_test_memory_dump():
    """Create a small test memory dump file for testing"""
    test_file = Path("test_memory.dmp")
    
    if not test_file.exists():
        # Create a small fake memory dump with proper header
        with open(test_file, 'wb') as f:
            # Write a fake PAGEDUM header (Windows crash dump signature)
            f.write(b'PAGEDUM\x00')
            f.write(b'\x00' * 1000)  # 1KB of null bytes
        print(f"Created test memory dump: {test_file}")
    
    return str(test_file)

def test_sandbox_validation():
    """Test file validation functionality"""
    print("\n" + "="*50)
    print("Testing Sandbox File Validation")
    print("="*50)
    
    test_file = create_test_memory_dump()
    
    with MemHawkSandbox() as sandbox:
        # Test valid file
        result = sandbox.validate_file(test_file)
        print(f"Valid file test: {'PASS' if result['valid'] else 'FAIL'}")
        print(f"  - File size: {result.get('file_size_human', 'N/A')}")
        print(f"  - Risk level: {result.get('risk_level', 'N/A')}")
        
        # Test invalid extension
        invalid_file = "test.exe"
        Path(invalid_file).touch()  # Create empty file
        result = sandbox.validate_file(invalid_file)
        print(f"Invalid extension test: {'PASS' if not result['valid'] else 'FAIL'}")
        Path(invalid_file).unlink()  # Clean up
        
        # Test non-existent file
        result = sandbox.validate_file("nonexistent.dmp")
        print(f"Non-existent file test: {'PASS' if not result['valid'] else 'FAIL'}")

def test_sandbox_execution():
    """Test sandboxed execution"""
    print("\n" + "="*50)
    print("Testing Sandbox Execution")
    print("="*50)
    
    test_file = create_test_memory_dump()
    
    with MemHawkSandbox(max_execution_time=30) as sandbox:
        # Test command execution (simple test command)
        result = sandbox.execute_volatility(['python', '--version'])
        print(f"Command execution test: {'PASS' if result['success'] else 'FAIL'}")
        if result['success']:
            print(f"  - Execution time: {result['execution_time']:.2f}s")
            print(f"  - Output: {result['stdout'].strip()}")
        else:
            print(f"  - Error: {result.get('error', 'Unknown error')}")

def test_volatility_integration():
    """Test Volatility integration with sandbox"""
    print("\n" + "="*50)
    print("Testing Volatility Integration")
    print("="*50)
    
    # Test standard runner
    runner = VolatilityRunner(use_sandbox=False)
    print(f"Standard runner - Volatility found: {'YES' if runner.volatility_path else 'NO'}")
    
    # Test sandboxed runner
    try:
        sandbox_runner = VolatilityRunner(use_sandbox=True)
        print(f"Sandboxed runner - Sandbox enabled: {'YES' if sandbox_runner.use_sandbox else 'NO'}")
        
        # Test plugin execution (will use demo data if no real memory dump)
        result = sandbox_runner.run_plugin("fake_memory.dmp", "windows.pslist")
        print(f"Plugin execution test: {'PASS' if result['success'] else 'FAIL'}")
        print(f"  - Security mode: {result.get('security_mode', 'standard')}")
        
    except Exception as e:
        print(f"Sandboxed runner error: {e}")

def test_resource_monitoring():
    """Test resource monitoring capabilities"""
    print("\n" + "="*50)
    print("Testing Resource Monitoring")
    print("="*50)
    
    config = {
        'max_memory_mb': 100,  # Low limit for testing
        'max_cpu_percent': 50,
        'max_execution_time': 10
    }
    
    with MemHawkSandbox(**config) as sandbox:
        # Test resource usage collection
        usage = sandbox._get_resource_usage()
        print(f"Resource monitoring test: {'PASS' if 'memory_mb' in usage else 'FAIL'}")
        if 'memory_mb' in usage:
            print(f"  - Memory usage: {usage['memory_mb']:.2f}MB")
            print(f"  - CPU usage: {usage['cpu_percent']}%")

def test_cleanup():
    """Test sandbox cleanup"""
    print("\n" + "="*50)
    print("Testing Sandbox Cleanup")
    print("="*50)
    
    sandbox_dir = None
    
    # Create and cleanup sandbox
    with MemHawkSandbox() as sandbox:
        sandbox_dir = sandbox.sandbox_dir
        print(f"Sandbox directory created: {sandbox_dir}")
        print(f"Directory exists: {'YES' if sandbox_dir.exists() else 'NO'}")
    
    # Check if cleanup worked
    if sandbox_dir:
        cleanup_success = not sandbox_dir.exists()
        print(f"Cleanup test: {'PASS' if cleanup_success else 'FAIL'}")

def run_all_tests():
    """Run all sandbox tests"""
    print("MemHawk Sandbox Test Suite")
    print("=" * 50)
    
    try:
        test_sandbox_validation()
        test_sandbox_execution()
        test_volatility_integration()
        test_resource_monitoring()
        test_cleanup()
        
        print("\n" + "="*50)
        print("All tests completed!")
        print("="*50)
        
    except KeyboardInterrupt:
        print("\nTests interrupted by user")
    except Exception as e:
        print(f"\nTest suite error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Clean up test files
        test_files = ["test_memory.dmp"]
        for file in test_files:
            if Path(file).exists():
                Path(file).unlink()
                print(f"Cleaned up: {file}")

if __name__ == "__main__":
    run_all_tests()