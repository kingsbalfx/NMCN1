#!/bin/bash

# Kingsbal Backend Quick Start Script
# This script automates the initial setup process

set -e  # Exit on error

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   🚀 Kingsbal Backend - Quick Start Setup                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${BLUE}📦 Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js ${NODE_VERSION} found${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found. Please install npm first.${NC}"
    exit 1
fi
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ npm ${NPM_VERSION} found${NC}"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL not found in PATH${NC}"
    echo "   You'll need to set up the database manually"
else
    echo -e "${GREEN}✅ PostgreSQL found${NC}"
fi

echo ""

# Install dependencies
echo -e "${BLUE}📚 Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file already exists${NC}"
    read -p "   Do you want to reconfigure it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "   Using existing .env"
    else
        cp .env.example .env
        echo -e "${GREEN}✅ .env reset from template${NC}"
    fi
else
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created from template${NC}"
fi

echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo ""
echo "1. Configure your .env file with your credentials:"
echo -e "   ${YELLOW}nano .env${NC}  (or open in your editor)"
echo ""
echo "   Required variables:"
echo "   - DATABASE_URL"
echo "   - JWT_SECRET"
echo "   - OPENAI_API_KEY"
echo "   - PAYSTACK_SECRET_KEY"
echo ""

echo "2. Create PostgreSQL database:"
echo -e "   ${YELLOW}createdb kingsbal${NC}"
echo ""
echo "   And load schema:"
echo -e "   ${YELLOW}psql -d kingsbal -f DATABASE_SCHEMA.sql${NC}"
echo ""

echo "3. Validate setup:"
echo -e "   ${YELLOW}node validate-setup.js${NC}"
echo ""

echo "4. Start development server:"
echo -e "   ${YELLOW}npm run dev${NC}"
echo ""

echo "5. Test the API:"
echo -e "   ${YELLOW}curl http://localhost:5000${NC}"
echo ""

echo "📖 Documentation available in:"
echo "   - SETUP_GUIDE.md (Complete setup instructions)"
echo "   - API_DOCUMENTATION.md (API reference)"
echo "   - BACKEND_README.md (Feature overview)"
echo ""

echo -e "${GREEN}✨ Setup script completed!${NC}"
echo ""
