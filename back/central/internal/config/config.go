package config

import (
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	AppEnv             string
	HTTPPort           string
	LogLevel           string
	JWTSecret          string
	JWTExpiration      time.Duration
	DBHost             string
	DBPort             string
	DBUser             string
	DBPass             string
	DBName             string
	DBSSLMode          string
	CORSAllowedOrigins []string
}

func Load() *Config {
	hours, _ := strconv.Atoi(getEnv("JWT_EXPIRATION_HOURS", "24"))
	origins := strings.Split(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:3000"), ",")
	for i := range origins {
		origins[i] = strings.TrimSpace(origins[i])
	}

	return &Config{
		AppEnv:             getEnv("APP_ENV", "development"),
		HTTPPort:           getEnv("HTTP_PORT", "3050"),
		LogLevel:           getEnv("LOG_LEVEL", "info"),
		JWTSecret:          getEnv("JWT_SECRET", "dev-secret-change-me"),
		JWTExpiration:      time.Duration(hours) * time.Hour,
		DBHost:             getEnv("DB_HOST", "localhost"),
		DBPort:             getEnv("DB_PORT", "5434"),
		DBUser:             getEnv("DB_USER", "lerida"),
		DBPass:             getEnv("DB_PASS", "lerida_dev_2026"),
		DBName:             getEnv("DB_NAME", "lerida_comercio"),
		DBSSLMode:          getEnv("DB_SSLMODE", "disable"),
		CORSAllowedOrigins: origins,
	}
}

func getEnv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
