# Build stage for UI
FROM node:20-alpine AS ui-builder
WORKDIR /app/ui
COPY ui/package*.json ./
RUN npm install
COPY ui/ .
RUN npm run build

# Build stage for Go application
FROM golang:1.24-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy go.mod and go.sum files
COPY go.mod go.sum ./
RUN go mod download

# Copy the entire project
COPY . .

# Copy built UI assets from ui-builder
COPY --from=ui-builder /app/ui/dist ./ui/dist

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o application .

# Final stage
FROM alpine:latest
WORKDIR /app

# Install certificates for HTTPS requests if needed
RUN apk add --no-cache ca-certificates

# Copy the binary from the builder
COPY --from=builder /app/application .

# Copy configuration and resources
COPY --from=builder /app/dev.yaml .
COPY --from=builder /app/api/docs ./api/docs

# Expose ports
EXPOSE 8085 8086

# Run the application
CMD ["/app/application"]