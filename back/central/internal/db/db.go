package db

import (
	"fmt"
	"log"
	"time"

	"github.com/secamc93/lerida-comercio/back/central/internal/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlog "gorm.io/gorm/logger"
)

func Open(cfg *config.Config) *gorm.DB {
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s TimeZone=America/Bogota",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPass, cfg.DBName, cfg.DBSSLMode)

	logLevel := gormlog.Warn
	if cfg.LogLevel == "debug" {
		logLevel = gormlog.Info
	}

	gdb, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormlog.Default.LogMode(logLevel),
	})
	if err != nil {
		log.Fatalf("error abriendo Postgres: %v", err)
	}

	sqlDB, err := gdb.DB()
	if err != nil {
		log.Fatalf("error obteniendo *sql.DB: %v", err)
	}
	sqlDB.SetMaxOpenConns(20)
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)

	if err := sqlDB.Ping(); err != nil {
		log.Fatalf("Postgres no responde: %v", err)
	}

	log.Println("✅ Postgres conectado")
	return gdb
}
