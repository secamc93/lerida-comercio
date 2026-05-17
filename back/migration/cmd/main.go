package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/secamc93/lerida-comercio/back/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlog "gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
)

func main() {
	seedFlag := flag.Bool("seed", false, "Inserta datos iniciales después de migrar")
	resetFlag := flag.Bool("reset", false, "Elimina TODAS las tablas antes de migrar (destructivo)")
	flag.Parse()

	_ = godotenv.Load()

	dsn := buildDSN()
	log.Println("→ Conectando a Postgres...")

	// SingularTable: true para coincidir con el shared/db del backend.
	// Sin esto, AutoMigrate crea "users" pero el backend consulta "user".
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger:         gormlog.Default.LogMode(gormlog.Warn),
		NamingStrategy: schema.NamingStrategy{SingularTable: true},
	})
	if err != nil {
		log.Fatalf("❌ Error conectando a Postgres: %v", err)
	}

	sqlDB, _ := db.DB()
	sqlDB.SetMaxOpenConns(10)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)

	if *resetFlag {
		log.Println("⚠️  --reset: eliminando todas las tablas existentes...")
		if err := dropAllTables(db); err != nil {
			log.Fatalf("❌ Drop falló: %v", err)
		}
		log.Println("✅ Tablas eliminadas.")
	}

	log.Println("→ Ejecutando AutoMigrate (auth basics)...")
	if err := db.AutoMigrate(
		&models.Scope{},
		&models.BusinessType{},
		&models.Business{},
		&models.Resource{},
		&models.Action{},
		&models.Permission{},
		&models.Role{},
		&models.User{},
		&models.BusinessStaff{},
		&models.BusinessResourceConfigured{},
		&models.APIKey{},
		&models.Integration{},
		// Torneo
		&models.Torneo{},
		&models.Equipo{},
		&models.Jugador{},
		&models.Partido{},
		&models.PartidoEvento{},
	); err != nil {
		log.Fatalf("❌ AutoMigrate falló: %v", err)
	}
	log.Println("✅ Migración completada.")

	if *seedFlag {
		log.Println("→ Insertando seed data (scopes, roles, super admin)...")
		if err := seedData(db); err != nil {
			log.Fatalf("❌ Seed falló: %v", err)
		}
		log.Println("✅ Seed completado.")
	}
}

// dropAllTables borra todas las tablas del schema `public` salvo las del
// sistema (incluyendo las de PostGIS que viven en topology / public).
func dropAllTables(db *gorm.DB) error {
	// CASCADE para que se vayan también las tablas pivote (role_permissions,
	// user_roles, user_businesses, etc.).
	tablesToDrop := []string{
		// Antiguas (directorio + torneo)
		"jugador_stats", "partidos", "jugadores", "equipos",
		"comercios", "categorias", "admins",
		// Plurales viejos (de un AutoMigrate anterior sin SingularTable)
		"api_keys", "integrations", "business_resource_configureds",
		"business_staffs", "permissions", "roles", "actions",
		"resources", "businesses", "business_types", "scopes", "users",
		// Singulares (esquema actual)
		"api_key", "integration", "business_resource_configured",
		"business_staff", "user_roles", "user_businesses", "role_permissions",
		"permission", "role", "action", "resource",
		"business", "business_type", "scope", "user",
	}
	for _, t := range tablesToDrop {
		if err := db.Exec(fmt.Sprintf(`DROP TABLE IF EXISTS %q CASCADE`, t)).Error; err != nil {
			return fmt.Errorf("drop %s: %w", t, err)
		}
	}
	return nil
}

func buildDSN() string {
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5434")
	user := getEnv("DB_USER", "lerida")
	pass := getEnv("DB_PASS", "lerida_dev_2026")
	name := getEnv("DB_NAME", "lerida_comercio")
	ssl := getEnv("DB_SSLMODE", "disable")
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s TimeZone=America/Bogota",
		host, port, user, pass, name, ssl)
}

func getEnv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

// seedData inserta los datos necesarios para `lerida-comercio`. Se mantiene
// alineado con `auth-seed.md` pero recortado al alcance del proyecto:
//   - 1 business_type:  "Lerida Comercio"
//   - 2 scopes:         platform, business
//   - 13 actions:       Create..Migrate (genéricas)
//   - 7 resources:      Usuarios, Permisos, Roles, Recursos, Empresas,
//                       Integraciones, Notificaciones
//   - 3 roles:          Super Admin (platform), Operador (platform),
//                       Administrador (business · Lerida Comercio)
//   - permisos CRUD:    4 por recurso × 7 = 28
//   - role_permissions: Super Admin no requiere filas (bypass por scope=platform).
//                       Operador sin filas (asignar a demanda).
//                       Administrador recibe CRUD de los 6 recursos de negocio
//                       (Usuarios/Permisos/Roles/Recursos/Empresas/Integraciones).
//   - 1 usuario admin:  admin@lerida.local / admin123 (Super Admin)
func seedData(db *gorm.DB) error {
	// ── business_type ──────────────────────────────────────────────
	bizType := models.BusinessType{
		Name:        "Lerida Comercio",
		Code:        "lerida-comercio",
		Description: "Directorio de comercios + torneo de fútbol 8",
		IsActive:    true,
	}
	if err := db.Where("code = ?", bizType.Code).FirstOrCreate(&bizType).Error; err != nil {
		return fmt.Errorf("business_type: %w", err)
	}

	// ── scopes ─────────────────────────────────────────────────────
	scopePlatform := models.Scope{Name: "Platform", Code: "platform", Description: "Scope para permisos globales", IsSystem: true}
	scopeBusiness := models.Scope{Name: "Business", Code: "business", Description: "Scope para permisos de negocio", IsSystem: false}
	for _, s := range []*models.Scope{&scopePlatform, &scopeBusiness} {
		if err := db.Where("code = ?", s.Code).FirstOrCreate(s).Error; err != nil {
			return fmt.Errorf("scope %s: %w", s.Code, err)
		}
	}

	// ── actions ────────────────────────────────────────────────────
	actionsSpec := []models.Action{
		{Name: "Create", Description: "Crear nuevos registros"},
		{Name: "Read", Description: "Leer/ver información"},
		{Name: "Update", Description: "Modificar registros existentes"},
		{Name: "Delete", Description: "Eliminar registros"},
		{Name: "Manage", Description: "Control total (incluye todas las acciones)"},
		{Name: "Approve", Description: "Aprobar solicitudes o documentos"},
		{Name: "Reject", Description: "Rechazar solicitudes o documentos"},
		{Name: "Assign", Description: "Asignar recursos o tareas"},
		{Name: "Schedule", Description: "Programar eventos o tareas"},
		{Name: "Report", Description: "Generar reportes"},
		{Name: "Configure", Description: "Configurar parámetros del sistema"},
		{Name: "Audit", Description: "Auditar acciones del sistema"},
		{Name: "Migrate", Description: "Ejecutar migraciones de datos"},
	}
	actions := map[string]models.Action{}
	for i := range actionsSpec {
		if err := db.Where("name = ?", actionsSpec[i].Name).FirstOrCreate(&actionsSpec[i]).Error; err != nil {
			return fmt.Errorf("action %s: %w", actionsSpec[i].Name, err)
		}
		actions[actionsSpec[i].Name] = actionsSpec[i]
	}

	// ── resources (auth basics + dominio mínimo) ──────────────────
	resourceSpec := []models.Resource{
		{Name: "Usuarios", Description: "Gestión de usuarios"},
		{Name: "Permisos", Description: "Gestión de permisos"},
		{Name: "Roles", Description: "Gestión de roles"},
		{Name: "Recursos", Description: "Gestión de recursos"},
		{Name: "Empresas", Description: "Gestión de empresas (business)"},
		{Name: "Integraciones", Description: "Gestión de integraciones"},
		{Name: "Notificaciones", Description: "Configuración de notificaciones"},
	}
	resources := map[string]models.Resource{}
	for i := range resourceSpec {
		if err := db.Where("name = ?", resourceSpec[i].Name).FirstOrCreate(&resourceSpec[i]).Error; err != nil {
			return fmt.Errorf("resource %s: %w", resourceSpec[i].Name, err)
		}
		resources[resourceSpec[i].Name] = resourceSpec[i]
	}

	// ── permissions: CRUD × resource ───────────────────────────────
	// Notificaciones es transversal: business_type_id NULL.
	// El resto va atado a business_type "Lerida Comercio".
	permActions := []string{"Create", "Read", "Update", "Delete"}
	permsByResource := map[string][]models.Permission{}
	for _, r := range resourceSpec {
		var btID *uint
		if r.Name != "Notificaciones" {
			btID = &bizType.ID
		}
		for _, a := range permActions {
			name := a + " " + r.Name
			perm := models.Permission{
				Name:           name,
				Description:    name,
				ResourceID:     r.ID,
				ActionID:       actions[a].ID,
				ScopeID:        scopeBusiness.ID,
				BusinessTypeID: btID,
			}
			if err := db.Where("name = ?", perm.Name).FirstOrCreate(&perm).Error; err != nil {
				return fmt.Errorf("permission %s: %w", perm.Name, err)
			}
			permsByResource[r.Name] = append(permsByResource[r.Name], perm)
		}
	}

	// ── roles ──────────────────────────────────────────────────────
	roleSuper := models.Role{
		Name: "Super Admin", Description: "Super administrador con acceso total",
		Level: 1, IsSystem: true, ScopeID: scopePlatform.ID,
	}
	roleOperador := models.Role{
		Name: "Operador", Description: "Operador de plataforma",
		Level: 2, IsSystem: true, ScopeID: scopePlatform.ID,
	}
	bizTypeID := bizType.ID
	roleAdmin := models.Role{
		Name: "Administrador", Description: "Administrador de empresa",
		Level: 1, IsSystem: false, ScopeID: scopeBusiness.ID,
		BusinessTypeID: &bizTypeID,
	}
	for _, r := range []*models.Role{&roleSuper, &roleOperador, &roleAdmin} {
		if err := db.Where("name = ? AND scope_id = ?", r.Name, r.ScopeID).FirstOrCreate(r).Error; err != nil {
			return fmt.Errorf("role %s: %w", r.Name, err)
		}
	}

	// Administrador → CRUD sobre los 6 recursos de negocio (no Notificaciones).
	var adminPerms []models.Permission
	for _, rname := range []string{"Usuarios", "Permisos", "Roles", "Recursos", "Empresas", "Integraciones"} {
		adminPerms = append(adminPerms, permsByResource[rname]...)
	}
	if err := db.Model(&roleAdmin).Association("Permissions").Replace(&adminPerms); err != nil {
		return fmt.Errorf("attach permissions to Administrador: %w", err)
	}

	// ── usuario super admin ───────────────────────────────────────
	hash, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("bcrypt: %w", err)
	}
	adminUser := models.User{
		Name:     "Super Admin",
		Email:    "admin@lerida.local",
		Password: string(hash),
		IsActive: true,
		ScopeID:  &scopePlatform.ID,
	}
	if err := db.Where("email = ?", adminUser.Email).FirstOrCreate(&adminUser).Error; err != nil {
		return fmt.Errorf("user admin: %w", err)
	}
	if err := db.Model(&adminUser).Association("Roles").Replace(&roleSuper); err != nil {
		return fmt.Errorf("attach role to user: %w", err)
	}

	// BusinessStaff sin business_id: el módulo de login espera esta fila
	// para resolver el rol global del super admin.
	var existingStaff models.BusinessStaff
	if err := db.Where("user_id = ? AND business_id IS NULL", adminUser.ID).First(&existingStaff).Error; err == gorm.ErrRecordNotFound {
		staff := models.BusinessStaff{UserID: adminUser.ID, RoleID: &roleSuper.ID}
		if err := db.Create(&staff).Error; err != nil {
			return fmt.Errorf("business_staff: %w", err)
		}
	}

	log.Printf("  · 1 business_type, 2 scopes, %d actions, %d resources", len(actionsSpec), len(resourceSpec))
	log.Printf("  · 3 roles (Super Admin, Operador, Administrador), %d permissions", len(actionsSpec[:4])*len(resourceSpec))
	log.Printf("  · Super Admin: admin@lerida.local / admin123")
	return nil
}
