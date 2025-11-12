.PHONY: help dev dev-all dev-api dev-frontend dev-mobile stop install

# Cores para output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
NC=\033[0m # No Color

help: ## Mostra esta mensagem de ajuda
	@echo "$(BLUE)Clube Digital - Comandos Disponíveis:$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""

install: ## Instala todas as dependências
	@echo "$(BLUE)📦 Instalando dependências...$(NC)"
	npm install

dev: ## Roda Backend (8033) + Frontend (3033)
	@echo "$(GREEN)🚀 Iniciando Backend + Frontend...$(NC)"
	@echo "$(YELLOW)Backend: http://localhost:8033$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:3033$(NC)"
	@npm run dev:all

dev-all: ## Roda Backend + Frontend + Mobile
	@echo "$(GREEN)🚀 Iniciando Backend + Frontend + Mobile...$(NC)"
	@echo "$(YELLOW)Backend: http://localhost:8033$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:3033$(NC)"
	@echo "$(YELLOW)Mobile: Expo$(NC)"
	@npm run dev:full

dev-everything: ## Roda TUDO: Backend + Admin + Club-Admin + Mobile
	@echo "$(GREEN)🚀 Iniciando TODOS os serviços...$(NC)"
	@echo "$(YELLOW)Backend (API): http://localhost:8033$(NC)"
	@echo "$(YELLOW)Admin Frontend: http://localhost:3033$(NC)"
	@echo "$(YELLOW)Club-Admin Frontend: http://localhost:3000$(NC)"
	@echo "$(YELLOW)Mobile: Expo$(NC)"
	@npm run dev:everything

dev-club-admin: ## Roda Backend + Club-Admin
	@echo "$(GREEN)🚀 Iniciando Backend + Club-Admin...$(NC)"
	@echo "$(YELLOW)Backend: http://localhost:8033$(NC)"
	@echo "$(YELLOW)Club-Admin: http://localhost:3000$(NC)"
	@npm run dev:club-admin

dev-api: ## Roda apenas o Backend (8033)
	@echo "$(GREEN)🔧 Iniciando Backend...$(NC)"
	@echo "$(YELLOW)Backend: http://localhost:8033$(NC)"
	@cd apps/api && npm run dev

dev-frontend: ## Roda apenas o Admin Frontend (3033)
	@echo "$(GREEN)🖥️  Iniciando Admin Frontend...$(NC)"
	@echo "$(YELLOW)Admin Frontend: http://localhost:3033$(NC)"
	@cd apps/admin/frontend && npm run dev -- -p 3033

dev-club-admin-only: ## Roda apenas o Club-Admin Frontend (3000)
	@echo "$(GREEN)🏢 Iniciando Club-Admin Frontend...$(NC)"
	@echo "$(YELLOW)Club-Admin: http://localhost:3000$(NC)"
	@cd apps/club-admin/frontend && npm run dev

dev-mobile: ## Roda apenas o Mobile (Expo)
	@echo "$(GREEN)📱 Iniciando Mobile...$(NC)"
	@cd apps/mobile && npm run start

stop: ## Para todos os processos node/npm
	@echo "$(RED)🛑 Parando todos os processos...$(NC)"
	@pkill -f "node.*npm" || true
	@pkill -f "node.*nodemon" || true
	@pkill -f "next.*dev" || true
	@pkill -f "expo" || true
	@echo "$(GREEN)✅ Processos finalizados$(NC)"

clean: ## Limpa node_modules e cache
	@echo "$(YELLOW)🧹 Limpando projeto...$(NC)"
	@npm run clean
	@echo "$(GREEN)✅ Limpeza concluída$(NC)"
