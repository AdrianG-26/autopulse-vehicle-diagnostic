#!/usr/bin/env python3
"""
🔄 Cloud Migration Helper Script
=============================
Helps transition from SQLite-based system to cloud-first Supabase architecture.
"""

import os
import sys
import argparse
import subprocess
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CloudMigrationHelper:
    """Helper for transitioning to cloud-first architecture"""
    
    def __init__(self):
        self.base_dir = Path(__file__).parent.parent
        self.src_dir = self.base_dir / 'src'
        
    def check_environment(self):
        """Check if environment is ready for cloud migration"""
        logger.info("🔍 Checking cloud migration readiness...")
        
        checks_passed = 0
        total_checks = 5
        
        # 1. Check Supabase credentials
        if self.check_supabase_credentials():
            logger.info("✅ Supabase credentials found")
            checks_passed += 1
        else:
            logger.error("❌ Supabase credentials missing")
        
        # 2. Check cloud storage module
        if (self.src_dir / 'supabase_direct_storage.py').exists():
            logger.info("✅ Cloud storage module exists")
            checks_passed += 1
        else:
            logger.error("❌ Cloud storage module missing")
        
        # 3. Check cloud collector
        if (self.src_dir / 'cloud_collector_daemon.py').exists():
            logger.info("✅ Cloud collector daemon exists")
            checks_passed += 1
        else:
            logger.error("❌ Cloud collector daemon missing")
        
        # 4. Check cloud web server
        if (self.src_dir / 'cloud_web_server.py').exists():
            logger.info("✅ Cloud web server exists")
            checks_passed += 1
        else:
            logger.error("❌ Cloud web server missing")
        
        # 5. Check Python dependencies
        if self.check_python_dependencies():
            logger.info("✅ Python dependencies available")
            checks_passed += 1
        else:
            logger.error("❌ Python dependencies missing")
        
        success_rate = (checks_passed / total_checks) * 100
        logger.info(f"🎯 Migration readiness: {success_rate:.1f}% ({checks_passed}/{total_checks} checks passed)")
        
        return checks_passed == total_checks
    
    def check_supabase_credentials(self):
        """Check if Supabase credentials are configured"""
        if os.getenv('SUPABASE_URL') and os.getenv('SUPABASE_KEY'):
            return True
        
        env_file = self.base_dir / '.env'
        if env_file.exists():
            content = env_file.read_text()
            return 'SUPABASE_URL=' in content and 'SUPABASE_KEY=' in content
        
        return False
    
    def check_python_dependencies(self):
        """Check if required Python packages are available"""
        required_packages = ['supabase', 'flask', 'pandas', 'numpy']
        
        for package in required_packages:
            try:
                __import__(package)
            except ImportError:
                logger.warning(f"Missing package: {package}")
                return False
        
        return True
    
    def install_dependencies(self):
        """Install required Python dependencies"""
        logger.info("📦 Installing cloud dependencies...")
        
        dependencies = [
            'supabase>=2.0.0',
            'python-dotenv',
            'flask>=2.0.0',
            'flask-socketio',
            'pandas',
            'numpy',
            'scikit-learn',
            'joblib'
        ]
        
        try:
            for dep in dependencies:
                logger.info(f"Installing {dep}...")
                subprocess.run([sys.executable, '-m', 'pip', 'install', dep], check=True)
            
            logger.info("✅ Dependencies installed successfully")
            
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Failed to install dependencies: {e}")
    
    def create_env_template(self):
        """Create .env template file"""
        env_template = """# Supabase Configuration
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_KEY=your_supabase_anon_key_here

# Optional: Custom configuration
VEHICLE_DATA_BATCH_SIZE=50
COLLECTION_INTERVAL=2.0
"""
        
        env_file = self.base_dir / '.env.template'
        env_file.write_text(env_template)
        
        logger.info(f"📝 Created environment template: {env_file}")
        logger.info("💡 Copy .env.template to .env and add your Supabase credentials")
    
    def test_cloud_connection(self):
        """Test connection to Supabase"""
        try:
            sys.path.insert(0, str(self.src_dir))
            from supabase_direct_storage import supabase_storage
            
            if supabase_storage.is_connected:
                logger.info("✅ Cloud connection successful")
                return True
            else:
                logger.error("❌ Cloud connection failed")
                return False
                
        except Exception as e:
            logger.error(f"❌ Cloud connection test error: {e}")
            return False
    
    def migration_report(self):
        """Generate migration status report"""
        logger.info("📊 Cloud Migration Status Report")
        logger.info("=" * 50)
        
        logger.info("🏗️ Architecture Changes:")
        logger.info("  Old: OBD → SQLite → Flask → React")
        logger.info("  New: OBD → Supabase → Flask → React")
        logger.info("")
        
        logger.info("🔧 Component Mapping:")
        logger.info("  automated_car_collector_daemon.py → cloud_collector_daemon.py")
        logger.info("  web_server.py → cloud_web_server.py")
        logger.info("  enhanced_database.py → supabase_direct_storage.py")
        logger.info("")
        
        logger.info("🎯 Cloud Benefits:")
        logger.info("  ✓ Real-time data sync across devices")
        logger.info("  ✓ Scalable cloud infrastructure")
        logger.info("  ✓ Reduced local storage requirements")
        logger.info("  ✓ Automatic backups and reliability")
        logger.info("  ✓ Multi-vehicle fleet management")

def main():
    """Main migration helper entry point"""
    parser = argparse.ArgumentParser(description='Cloud Migration Helper')
    parser.add_argument('--check', action='store_true', help='Check migration readiness')
    parser.add_argument('--install-deps', action='store_true', help='Install Python dependencies')
    parser.add_argument('--create-env', action='store_true', help='Create environment template')
    parser.add_argument('--test-connection', action='store_true', help='Test cloud connection')
    parser.add_argument('--report', action='store_true', help='Show migration report')
    
    args = parser.parse_args()
    
    helper = CloudMigrationHelper()
    
    if args.check:
        ready = helper.check_environment()
        sys.exit(0 if ready else 1)
    elif args.install_deps:
        helper.install_dependencies()
    elif args.create_env:
        helper.create_env_template()
    elif args.test_connection:
        success = helper.test_cloud_connection()
        sys.exit(0 if success else 1)
    elif args.report:
        helper.migration_report()
    else:
        helper.migration_report()
        logger.info("")
        ready = helper.check_environment()
        
        if ready:
            logger.info("🎉 System ready for cloud migration!")
        else:
            logger.info("⚠️ Complete the checklist items before migrating")

if __name__ == "__main__":
    main()
