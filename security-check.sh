#!/bin/bash

# GitHub Security Verification Script
# Run this before pushing to GitHub to ensure no sensitive data is exposed

echo "🔍 HR-VS GitHub Security Verification"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Initialize counters
ERRORS=0
WARNINGS=0

echo ""
echo "1. 🔍 Checking for hardcoded passwords..."

# Check for common hardcoded passwords
if grep -r "admin123\|manager123\|employee123" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" --exclude="security-check.sh" 2>/dev/null; then
    echo -e "${RED}❌ CRITICAL: Hardcoded passwords found!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No hardcoded passwords found${NC}"
fi

echo ""
echo "2. 🔍 Checking for sensitive console logs..."

# Check for console logs that might expose sensitive data
SENSITIVE_LOGS=$(grep -r "console\.log.*\[.*\]" client/src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -E "Auth|Login|email|password|token|user" | head -5)

if [ ! -z "$SENSITIVE_LOGS" ]; then
    echo -e "${RED}❌ CRITICAL: Sensitive console logs found:${NC}"
    echo "$SENSITIVE_LOGS"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No sensitive console logs found${NC}"
fi

echo ""
echo "3. 🔍 Checking .env files are ignored..."

if [ -f ".gitignore" ] && grep -q "\.env" .gitignore; then
    echo -e "${GREEN}✅ .env files are properly ignored${NC}"
else
    echo -e "${RED}❌ CRITICAL: .env files are not ignored!${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "4. 🔍 Checking for accidentally committed .env files..."

if find . -name ".env*" -not -name ".env.example" -not -path "./node_modules/*" -not -path "./.git/*" | grep -q .; then
    echo -e "${RED}❌ CRITICAL: .env files found in repository!${NC}"
    find . -name ".env*" -not -name ".env.example" -not -path "./node_modules/*" -not -path "./.git/*"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No .env files found in repository${NC}"
fi

echo ""
echo "5. 🔍 Checking for JWT secrets in code..."

if grep -r "JWT_SECRET.*=" . --exclude-dir=node_modules --exclude-dir=.git --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" 2>/dev/null | grep -v "process.env.JWT_SECRET" | grep -v ".env.example"; then
    echo -e "${RED}❌ CRITICAL: Hardcoded JWT secrets found!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No hardcoded JWT secrets found${NC}"
fi

echo ""
echo "6. 🔍 Checking for database connection strings..."

if grep -r "mongodb://\|mongodb+srv://" . --exclude-dir=node_modules --exclude-dir=.git --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" 2>/dev/null | grep -v "process.env" | grep -v ".env.example" | grep -v "localhost:27017"; then
    echo -e "${RED}❌ CRITICAL: Hardcoded database connections found!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No hardcoded database connections found${NC}"
fi

echo ""
echo "7. 🔍 Checking setup script security..."

if [ -f "setup/create-admin.js" ]; then
    if grep -q "process.env.*PASSWORD" setup/create-admin.js; then
        echo -e "${GREEN}✅ Setup script uses environment variables${NC}"
    else
        echo -e "${RED}❌ CRITICAL: Setup script may contain hardcoded passwords!${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${YELLOW}⚠️ Setup script not found${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "8. 🔍 Checking for API keys..."

if grep -r "api.*key\|API.*KEY" . --exclude-dir=node_modules --exclude-dir=.git --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" 2>/dev/null | grep -v "process.env" | grep -v ".env.example" | grep -v "comment"; then
    echo -e "${RED}❌ CRITICAL: Possible hardcoded API keys found!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No hardcoded API keys found${NC}"
fi

echo ""
echo "========================================="
echo "🎯 Security Verification Results:"
echo "========================================="

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ SECURE - Safe to push to GitHub!${NC}"
    echo -e "${GREEN}All security checks passed.${NC}"
    
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️ $WARNINGS warning(s) found - please review${NC}"
    fi
    
    echo ""
    echo "🚀 Ready for GitHub push!"
    exit 0
else
    echo -e "${RED}❌ SECURITY ISSUES FOUND!${NC}"
    echo -e "${RED}$ERRORS critical error(s) must be fixed before pushing to GitHub${NC}"
    
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️ $WARNINGS warning(s) found - please review${NC}"
    fi
    
    echo ""
    echo -e "${RED}🛑 DO NOT PUSH TO GITHUB until all errors are resolved!${NC}"
    exit 1
fi
