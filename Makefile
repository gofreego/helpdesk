build: clean build-ui
	go build -o application .

build-linux: clean build-ui
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o application .

build-ui:
	@if [ ! -d ui/node_modules ]; then \
		$(MAKE) -C ui install; \
	fi
	$(MAKE) -C ui build
run: build-ui
	go run .
test:
	go test -v ./...
migrate:
	sql-migrator ./migration.yml

clean: clean-ui
	rm -f application

clean-ui:
	$(MAKE) -C ui clean
	rm -rf ui/node_modules
	rm -f ui/package-lock.json

docker: build-linux
	docker build -t helpdesk .
	rm -f application

docker-run: docker
	@echo "Tagging image as latest"
	docker tag helpdesk helpdesk:latest
	@echo "removing existing container named helpdesk if any"
	docker rm -f helpdesk || true
	@echo "Running image with name helpdesk, mapping ports 8085:8085 and 8086:8086"
	docker run -d --name helpdesk -p 8085:8085 -p 8086:8086 helpdesk:latest

install: install-ui
	go mod tidy
	go get github.com/grpc-ecosystem/grpc-gateway/v2/internal/descriptor@v2.27.2
	go install github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-grpc-gateway
	go install github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-openapiv2
	go install google.golang.org/protobuf/cmd/protoc-gen-go
	go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.5.1
	go install github.com/envoyproxy/protoc-gen-validate@latest
	go install github.com/gofreego/goutils/cmd/sql-migrator@v1.3.8

install-ui:
	$(MAKE) -C ui install

setup: setup-ui
	@echo "Compiling proto files..."
	sh ./api/protoc.sh
	go mod tidy

setup-ui:
	$(MAKE) -C ui setup

redeploy:
	@echo "Pulling latest code from git"
	git pull
	@echo "Rebuilding the docker image with the latest code"
	docker-compose build
	@echo "Rebuilding and redeploying the service"
	docker-compose down
	docker-compose up -d
	@echo "Service redeployed successfully"
