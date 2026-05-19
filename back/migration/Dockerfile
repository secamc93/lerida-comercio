FROM golang:1.24-alpine AS builder

ENV CGO_ENABLED=0 GOOS=linux

# Módulo compartido referenciado por replace directive (../models)
COPY models /workspace/models

WORKDIR /workspace/migration

COPY migration/go.mod migration/go.sum* ./
RUN go mod download

COPY migration .
RUN go build -ldflags="-w -s" -o /out/migration ./cmd/main.go

FROM alpine:3.20
RUN apk add --no-cache ca-certificates tzdata && \
    cp /usr/share/zoneinfo/America/Bogota /etc/localtime
WORKDIR /app
COPY --from=builder /out/migration /app/migration
CMD ["/app/migration"]
