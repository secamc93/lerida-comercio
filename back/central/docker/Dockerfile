# ===== Stage 1: build =====
FROM golang:1.24-alpine AS builder

ENV CGO_ENABLED=0 GOOS=linux

RUN apk add --no-cache git

WORKDIR /workspace

# Copia los módulos referenciados por replace directives
COPY migration /workspace/migration
COPY models /workspace/models

WORKDIR /workspace/central
COPY central/go.mod central/go.sum* ./
RUN go mod download

COPY central .
RUN go build -ldflags="-w -s" -o /out/central ./cmd/main.go

# ===== Stage 2: runtime =====
FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata wget && \
    cp /usr/share/zoneinfo/America/Bogota /etc/localtime && \
    echo "America/Bogota" > /etc/timezone

RUN adduser -D -u 1001 appuser
WORKDIR /app
COPY --from=builder /out/central /app/central
USER appuser

EXPOSE 3050

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3050/health || exit 1

CMD ["/app/central"]
