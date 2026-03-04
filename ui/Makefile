.PHONY: setup install build run dev lint clean preview test

# Default target
help:
	@echo "Available targets:"
	@echo "  setup    - Install dependencies and setup the project"
	@echo "  install  - Install npm dependencies"
	@echo "  build    - Build the project for production"
	@echo "  run      - Alias for dev (start development server)"
	@echo "  dev      - Start development server"
	@echo "  lint     - Run ESLint"
	@echo "  preview  - Preview the production build"
	@echo "  test     - Run tests (if available)"
	@echo "  clean    - Clean build artifacts"
	@echo "  help     - Show this help message"

# Setup the project
setup: install
	@echo "UI setup complete!"

# Install dependencies
install:
	npm install

# Build for production
build: clean
	npm run build

# Start development server (alias for dev)
run: dev

# Start development server
dev:
	npm run dev

# Run linter
lint:
	npm run lint

# Preview production build
preview: build
	npm run preview

# Run tests (if available)
test:
	@if [ -f package.json ] && grep -q '"test"' package.json; then \
		npm test; \
	else \
		echo "No test script found in package.json"; \
	fi

# Clean build artifacts
clean:
	rm -rf dist/
	rm -rf node_modules/.vite/
	rm -rf node_modules/.cache/

# Clean and reinstall dependencies
clean-install: clean
	rm -rf node_modules/
	rm -f package-lock.json
	npm install