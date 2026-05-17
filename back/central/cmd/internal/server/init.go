package server

import (
	"context"
	"fmt"

	"github.com/secamc93/lerida-comercio/back/central/cmd/internal/routes"
	"github.com/secamc93/lerida-comercio/back/central/services/auth"
	"github.com/secamc93/lerida-comercio/back/central/services/auth/middleware"
	"github.com/secamc93/lerida-comercio/back/central/services/modules"
	"github.com/secamc93/lerida-comercio/back/central/shared/db"
	"github.com/secamc93/lerida-comercio/back/central/shared/env"
	"github.com/secamc93/lerida-comercio/back/central/shared/log"
	"github.com/secamc93/lerida-comercio/back/central/shared/rabbitmq"
	"github.com/secamc93/lerida-comercio/back/central/shared/redis"
	"github.com/secamc93/lerida-comercio/back/central/shared/storage"
)

func Init(ctx context.Context) error {
	logger := log.New()
	environment := env.New(logger)

	database := db.New(logger, environment)

	// Initialize S3
	s3Service := storage.New(environment, logger)

	// Initialize RabbitMQ (opcional en local: si falla solo se loguea).
	queueRegistry := NewQueueRegistry()
	rabbitMQ, err := rabbitmq.New(logger, environment)
	if err != nil {
		logger.Error(ctx).
			Err(err).
			Msg("Failed to initialize RabbitMQ - consumers will be disabled")
	} else if rmq, ok := rabbitMQ.(interface{ SetQueueRegistry(rabbitmq.QueueRegistryCallback) }); ok {
		rmq.SetQueueRegistry(queueRegistry.Register)
	}

	// Initialize Redis (opcional en local).
	redisRegistry := NewRedisRegistry()
	redisClient := redis.New(logger, environment)
	if redisClient != nil {
		if rc, ok := redisClient.(interface {
			SetCacheRegistry(redis.CacheRegistryCallback)
			SetChannelRegistry(redis.ChannelRegistryCallback)
		}); ok {
			rc.SetCacheRegistry(redisRegistry.RegisterCachePrefix)
			rc.SetChannelRegistry(redisRegistry.RegisterChannel)
		}
	}

	middleware.InitFromEnv(environment, logger)
	r := routes.BuildRouter(ctx, logger, environment)

	v1Group := r.Group("/api/v1")

	// Bundle de autenticación + RBAC.
	auth.New(v1Group, database, logger, environment, s3Service)

	// Bundle de módulos de negocio (torneo, etc.).
	modules.New(v1Group, database, logger)

	LogStartupInfo(ctx, logger, environment, queueRegistry, redisRegistry)

	port := environment.Get("HTTP_PORT")

	addr := fmt.Sprintf(":%s", port)
	return r.Run(addr)
}
