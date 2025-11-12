#!/bin/bash

# Clube Digital - Development Helper Script
# Uso: ./dev.sh [comando]

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
print_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════╗"
    echo "║      🏢 Clube Digital - Dev Helper      ║"
    echo "╚══════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Menu de ajuda
show_help() {
    print_banner
    echo -e "${GREEN}Comandos disponíveis:${NC}\n"

    echo -e "${CYAN}🚀 Combinações de Serviços:${NC}"
    echo -e "  ${YELLOW}all${NC}          - Roda TUDO (API + Admin + Club-Admin + Mobile)"
    echo -e "  ${YELLOW}full${NC}         - Roda API + Admin + Mobile"
    echo -e "  ${YELLOW}admin${NC}        - Roda API + Admin Frontend"
    echo -e "  ${YELLOW}club${NC}         - Roda API + Club-Admin"
    echo ""

    echo -e "${CYAN}🔧 Serviços Individuais:${NC}"
    echo -e "  ${YELLOW}api${NC}          - Apenas Backend (porta 8033)"
    echo -e "  ${YELLOW}frontend${NC}     - Apenas Admin Frontend (porta 3033)"
    echo -e "  ${YELLOW}club-only${NC}    - Apenas Club-Admin (porta 3000)"
    echo -e "  ${YELLOW}mobile${NC}       - Apenas Mobile (Expo)"
    echo ""

    echo -e "${CYAN}🛑 Controle:${NC}"
    echo -e "  ${YELLOW}stop${NC}         - Para todos os serviços"
    echo ""

    echo -e "${CYAN}💡 Exemplos:${NC}"
    echo -e "  ${GREEN}./dev.sh all${NC}     # Inicia tudo"
    echo -e "  ${GREEN}./dev.sh admin${NC}   # Inicia API + Admin"
    echo -e "  ${GREEN}./dev.sh stop${NC}    # Para tudo"
    echo ""
}

# Função para rodar comando npm
run_npm() {
    local cmd=$1
    echo -e "${GREEN}▶ Executando: npm run $cmd${NC}"
    npm run "$cmd"
}

# Função para rodar comando make
run_make() {
    local cmd=$1
    echo -e "${GREEN}▶ Executando: make $cmd${NC}"
    make "$cmd"
}

# Main
case "$1" in
    "all"|"everything")
        print_banner
        echo -e "${GREEN}🚀 Iniciando TODOS os serviços...${NC}\n"
        echo -e "${BLUE}API:${NC} http://localhost:8033"
        echo -e "${MAGENTA}Admin:${NC} http://localhost:3033"
        echo -e "${CYAN}Club-Admin:${NC} http://localhost:3000"
        echo -e "${GREEN}Mobile:${NC} Expo (QR Code)\n"
        run_npm "dev:everything"
        ;;
    "full")
        print_banner
        echo -e "${GREEN}🚀 Iniciando API + Admin + Mobile...${NC}\n"
        run_npm "dev:full"
        ;;
    "admin")
        print_banner
        echo -e "${GREEN}🚀 Iniciando API + Admin...${NC}\n"
        run_npm "dev:all"
        ;;
    "club")
        print_banner
        echo -e "${GREEN}🚀 Iniciando API + Club-Admin...${NC}\n"
        run_npm "dev:club-admin"
        ;;
    "api")
        print_banner
        echo -e "${GREEN}🔧 Iniciando apenas Backend...${NC}\n"
        run_npm "dev:api"
        ;;
    "frontend")
        print_banner
        echo -e "${GREEN}🖥️  Iniciando apenas Admin Frontend...${NC}\n"
        run_npm "dev:frontend"
        ;;
    "club-only")
        print_banner
        echo -e "${GREEN}🏢 Iniciando apenas Club-Admin...${NC}\n"
        run_npm "dev:club-admin-only"
        ;;
    "mobile")
        print_banner
        echo -e "${GREEN}📱 Iniciando apenas Mobile...${NC}\n"
        run_npm "dev:mobile"
        ;;
    "stop")
        print_banner
        echo -e "${RED}🛑 Parando todos os serviços...${NC}\n"
        run_make "stop"
        ;;
    "help"|"-h"|"--help"|"")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Comando desconhecido: $1${NC}\n"
        show_help
        exit 1
        ;;
esac
