.DEFAULT_GOAL := help

.PHONY: help install dev build preview clean

help: ## 列出所有可用指令
	@awk 'BEGIN {FS = ":.*## "; printf "可用指令：\n\n"} /^[a-zA-Z_-]+:.*## / {printf "  %-12s %s\n", "make " $$1, $$2}' $(MAKEFILE_LIST)

install: ## 安裝專案依賴
	npm install

dev: ## 啟動本機開發伺服器
	npm run dev

build: ## 建置靜態網站
	npm run build

preview: build ## 預覽正式建置結果
	npm run preview

clean: ## 移除 Astro 建置產物
	rm -rf dist .astro
