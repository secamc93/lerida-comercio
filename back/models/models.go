// Package models es la única fuente de verdad del schema de Lérida Comercio.
// Contiene únicamente las entidades necesarias para autenticación,
// autorización (roles + permisos), business (multi-tenant) y usuarios.
// Cualquier otro dominio (torneo, directorio, e-commerce, etc.) se agrega
// en archivos separados de este mismo paquete cuando se necesite.
package models

import (
	"time"

	"gorm.io/gorm"
)

// ====================================================================
//  BUSINESS TYPES — Tipos de negocios soportados por la plataforma
// ====================================================================

type BusinessType struct {
	gorm.Model
	Name        string `gorm:"size:100;not null;unique"`
	Code        string `gorm:"size:50;not null;unique"`
	Description string `gorm:"size:500"`
	Icon        string `gorm:"size:100"`
	IsActive    bool   `gorm:"default:true"`

	Businesses  []Business
	Roles       []Role       `gorm:"foreignKey:BusinessTypeID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Resources   []Resource   `gorm:"foreignKey:BusinessTypeID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Permissions []Permission `gorm:"foreignKey:BusinessTypeID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}

// ====================================================================
//  SCOPES — Ámbitos de permisos y roles (platform | business)
// ====================================================================

type Scope struct {
	gorm.Model
	Name        string `gorm:"size:100;not null;unique"`
	Code        string `gorm:"size:50;not null;unique"`
	Description string `gorm:"size:500"`
	IsSystem    bool   `gorm:"default:false"`

	Roles       []Role       `gorm:"foreignKey:ScopeID"`
	Permissions []Permission `gorm:"foreignKey:ScopeID"`
}

// ====================================================================
//  BUSINESSES — Multi-tenant + configuración de marca blanca
// ====================================================================

type Business struct {
	gorm.Model
	Name             string `gorm:"size:120;not null"`
	Code             string `gorm:"size:50;not null;unique"`
	BusinessTypeID   uint   `gorm:"not null;index"`
	ParentBusinessID *uint  `gorm:"index"`
	Timezone         string `gorm:"size:40;default:'America/Bogota'"`
	Address          string `gorm:"size:255"`
	Description      string `gorm:"size:500"`

	// Marca blanca
	LogoURL         string  `gorm:"size:255"`
	PrimaryColor    string  `gorm:"size:7;default:'#1f2937'"`
	SecondaryColor  string  `gorm:"size:7;default:'#3b82f6'"`
	TertiaryColor   string  `gorm:"size:7;default:'#10b981'"`
	QuaternaryColor string  `gorm:"size:7;default:'#fbbf24'"`
	NavbarImageURL  string  `gorm:"size:255"`
	CustomDomain    *string `gorm:"size:100;unique"`
	IsActive        bool    `gorm:"default:true"`

	OrderPrefix string `gorm:"size:8;index"`

	// Suscripción
	SubscriptionStatus  string     `gorm:"size:20;default:'active'"`
	SubscriptionEndDate *time.Time

	// Flags de funcionalidades
	EnableDelivery     bool `gorm:"default:false"`
	EnablePickup       bool `gorm:"default:false"`
	EnableReservations bool `gorm:"default:true"`

	BusinessType                BusinessType `gorm:"foreignKey:BusinessTypeID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	ParentBusiness              *Business    `gorm:"foreignKey:ParentBusinessID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	ChildBusinesses             []Business   `gorm:"foreignKey:ParentBusinessID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Staff                       []BusinessStaff
	Users                       []User                       `gorm:"many2many:user_businesses;"`
	BusinessResourcesConfigured []BusinessResourceConfigured `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Integrations                []Integration                `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

// ====================================================================
//  BUSINESS RESOURCE CONFIGURED — Recursos habilitados por business
// ====================================================================

type BusinessResourceConfigured struct {
	gorm.Model
	BusinessID uint `gorm:"not null;index;uniqueIndex:idx_business_resource_config,priority:1"`
	ResourceID uint `gorm:"not null;index;uniqueIndex:idx_business_resource_config,priority:2"`
	Active     bool `gorm:"default:true"`

	Business Business `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Resource Resource `gorm:"foreignKey:ResourceID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

// ====================================================================
//  RESOURCES — Entidades del sistema sobre las que se otorgan permisos
// ====================================================================

type Resource struct {
	gorm.Model
	Name        string `gorm:"size:100;not null;unique"`
	Description string `gorm:"size:500"`

	BusinessTypeID *uint         `gorm:"index"`
	BusinessType   *BusinessType `gorm:"foreignKey:BusinessTypeID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`

	BusinessResourcesConfigured []BusinessResourceConfigured `gorm:"foreignKey:ResourceID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Permissions                 []Permission                 `gorm:"foreignKey:ResourceID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

// ====================================================================
//  ACTIONS — Acciones disponibles (create, read, update, delete, ...)
// ====================================================================

type Action struct {
	gorm.Model
	Name        string `gorm:"size:20;not null;unique"`
	Description string `gorm:"size:255"`

	Permissions []Permission `gorm:"foreignKey:ActionID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
}

// ====================================================================
//  PERMISSIONS — Combinación recurso + acción + scope (+ tipo negocio)
// ====================================================================

type Permission struct {
	gorm.Model
	Name        string `gorm:"size:50;unique"`
	Description string `gorm:"size:500"`
	ResourceID  uint   `gorm:"not null;index"`
	ActionID    uint   `gorm:"not null;index"`
	ScopeID     uint   `gorm:"not null;index"`

	BusinessTypeID *uint         `gorm:"index"`
	BusinessType   *BusinessType `gorm:"foreignKey:BusinessTypeID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`

	Scope    Scope    `gorm:"foreignKey:ScopeID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	Roles    []Role   `gorm:"many2many:role_permissions;"`
	Resource Resource `gorm:"foreignKey:ResourceID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Action   Action   `gorm:"foreignKey:ActionID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
}

// ====================================================================
//  ROLES — Agrupan permisos. Pertenecen a un scope y opcionalmente a un
//  tipo de negocio.
// ====================================================================

type Role struct {
	gorm.Model
	Name        string `gorm:"size:50;not null;unique"`
	Description string `gorm:"size:255"`
	Level       int    `gorm:"not null;default:1"` // 1=super, 2=admin, 3=manager, 4=staff
	IsSystem    bool   `gorm:"default:false"`

	ScopeID uint  `gorm:"not null;index"`
	Scope   Scope `gorm:"foreignKey:ScopeID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`

	BusinessTypeID *uint         `gorm:"index"`
	BusinessType   *BusinessType `gorm:"foreignKey:BusinessTypeID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`

	Permissions []Permission `gorm:"many2many:role_permissions;"`
	Users       []User       `gorm:"many2many:user_roles;"`
}

// ====================================================================
//  USERS — Usuarios del sistema
// ====================================================================

type User struct {
	gorm.Model
	Name        string `gorm:"size:255;not null"`
	Email       string `gorm:"size:255;not null;unique"`
	Password    string `gorm:"size:255;not null"`
	Phone       string `gorm:"size:20"`
	AvatarURL   string `gorm:"size:255"`
	IsActive    bool   `gorm:"default:true"`
	LastLoginAt *time.Time

	ScopeID *uint  `gorm:"index"`
	Scope   *Scope `gorm:"foreignKey:ScopeID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`

	Businesses []Business `gorm:"many2many:user_businesses;"`
	Roles      []Role     `gorm:"many2many:user_roles;"`
	StaffOf    []BusinessStaff
}

// ====================================================================
//  BUSINESS STAFF — Relación usuario ↔ negocio ↔ rol
// ====================================================================

type BusinessStaff struct {
	gorm.Model
	UserID     uint  `gorm:"not null;index;uniqueIndex:idx_user_business,priority:1"`
	BusinessID *uint `gorm:"index;uniqueIndex:idx_user_business,priority:2"`
	RoleID     *uint `gorm:"index"`

	User     User     `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Business Business `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Role     Role     `gorm:"foreignKey:RoleID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
}

// ====================================================================
//  API KEYS — Claves para integraciones programáticas
// ====================================================================

type APIKey struct {
	gorm.Model
	UserID      uint   `gorm:"not null;index"`
	BusinessID  uint   `gorm:"not null;index"`
	CreatedByID uint   `gorm:"not null;index"`
	Name        string `gorm:"size:255;not null"`
	KeyHash     string `gorm:"size:255;not null"`
	Description string `gorm:"size:500"`

	LastUsedAt *time.Time `gorm:"index"`
	Revoked    bool       `gorm:"default:false;index"`
	RevokedAt  *time.Time

	RateLimit   int    `gorm:"default:1000"`
	IPWhitelist string `gorm:"size:1000"`

	User      User     `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Business  Business `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	CreatedBy User     `gorm:"foreignKey:CreatedByID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
}

// ====================================================================
//  INTEGRATION — Versión mínima, solo lo usado por services/auth/bussines.
//  Suficiente para que el repositorio cree la "integración plataforma"
//  por defecto al crear un business. Los detalles completos (types,
//  categorías, schemas, notificaciones) se agregan cuando se construya
//  el módulo real de integraciones.
// ====================================================================

type Integration struct {
	gorm.Model
	Name              string `gorm:"size:100;not null"`
	Code              string `gorm:"size:50;not null;unique"`
	Category          string `gorm:"size:50;not null;index"`
	IntegrationTypeID uint   `gorm:"not null;index"`
	BusinessID        *uint  `gorm:"index"`
	IsActive          bool   `gorm:"default:true;index"`
	CreatedByID       uint   `gorm:"index"`

	Business *Business `gorm:"foreignKey:BusinessID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

func (Integration) TableName() string { return "integrations" }
