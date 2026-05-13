package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/secamc93/lerida-comercio/back/migration/shared/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlog "gorm.io/gorm/logger"
)

func main() {
	seedFlag := flag.Bool("seed", false, "Inserta datos iniciales después de migrar")
	flag.Parse()

	_ = godotenv.Load() // .env opcional

	dsn := buildDSN()
	log.Println("→ Conectando a Postgres...")

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormlog.Default.LogMode(gormlog.Warn),
	})
	if err != nil {
		log.Fatalf("❌ Error conectando a Postgres: %v", err)
	}

	sqlDB, _ := db.DB()
	sqlDB.SetMaxOpenConns(10)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)

	log.Println("→ Ejecutando AutoMigrate...")
	if err := db.AutoMigrate(
		&models.Categoria{},
		&models.Comercio{},
		&models.Admin{},
		&models.Equipo{},
		&models.Jugador{},
		&models.Partido{},
		&models.JugadorStats{},
	); err != nil {
		log.Fatalf("❌ AutoMigrate falló: %v", err)
	}

	// Índice compuesto dorsal por equipo
	db.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS uniq_dorsal_equipo
		ON jugadores(equipo_id, dorsal) WHERE deleted_at IS NULL`)

	// Índice único partido por jornada
	db.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS uniq_partido_jornada
		ON partidos(jornada, orden_jornada)`)

	log.Println("✅ Migración completada.")

	if *seedFlag {
		log.Println("→ Insertando seed data...")
		if err := seedData(db); err != nil {
			log.Fatalf("❌ Seed falló: %v", err)
		}
		log.Println("✅ Seed completado.")
	}
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

func seedData(db *gorm.DB) error {
	// ===== Categorías =====
	categorias := []models.Categoria{
		{Slug: "restaurantes", Nombre: "Restaurantes", Icon: "🍽️", Color: "#e53935", Orden: 1},
		{Slug: "tiendas", Nombre: "Tiendas", Icon: "🛒", Color: "#fb8c00", Orden: 2},
		{Slug: "moda", Nombre: "Moda", Icon: "👔", Color: "#8e24aa", Orden: 3},
		{Slug: "salud", Nombre: "Salud", Icon: "💊", Color: "#43a047", Orden: 4},
		{Slug: "educacion", Nombre: "Educación", Icon: "🎓", Color: "#1e88e5", Orden: 5},
		{Slug: "servicios", Nombre: "Servicios", Icon: "🔧", Color: "#5d4037", Orden: 6},
		{Slug: "belleza", Nombre: "Belleza", Icon: "💇", Color: "#d81b60", Orden: 7},
		{Slug: "deportes", Nombre: "Deportes", Icon: "⚽", Color: "#00897b", Orden: 8},
		{Slug: "transporte", Nombre: "Transporte", Icon: "🚗", Color: "#3949ab", Orden: 9},
	}
	for _, c := range categorias {
		if err := db.Where("slug = ?", c.Slug).FirstOrCreate(&c).Error; err != nil {
			return err
		}
	}

	// ===== Admin por defecto =====
	hash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	admin := models.Admin{Username: "admin", PasswordHash: string(hash)}
	if err := db.Where("username = ?", admin.Username).FirstOrCreate(&admin).Error; err != nil {
		return err
	}

	// ===== Comercios de ejemplo =====
	var catRest, catTie, catMo, catSal, catEdu, catSer, catBel, catDep, catTra models.Categoria
	db.Where("slug = ?", "restaurantes").First(&catRest)
	db.Where("slug = ?", "tiendas").First(&catTie)
	db.Where("slug = ?", "moda").First(&catMo)
	db.Where("slug = ?", "salud").First(&catSal)
	db.Where("slug = ?", "educacion").First(&catEdu)
	db.Where("slug = ?", "servicios").First(&catSer)
	db.Where("slug = ?", "belleza").First(&catBel)
	db.Where("slug = ?", "deportes").First(&catDep)
	db.Where("slug = ?", "transporte").First(&catTra)

	comercios := []models.Comercio{
		{Nombre: "Restaurante La Sazón Tolimense", CategoriaID: catRest.ID, Icon: "🍛", Descripcion: "Comida típica tolimense: lechona, tamales y plato montañero. Tradición de más de 20 años.", Direccion: "Cra. 5 #6-23", Telefono: "320 555 1010", Horario: "Lun-Dom 7:00 AM - 9:00 PM", Rating: 5},
		{Nombre: "Panadería El Buen Sabor", CategoriaID: catRest.ID, Icon: "🥖", Descripcion: "Pan fresco, pasteles, almojábanas y café recién pasado todos los días desde las 5 AM.", Direccion: "Cl. 7 #4-18", Telefono: "321 333 4455", Horario: "Lun-Sáb 5:00 AM - 8:00 PM", Rating: 4},
		{Nombre: "Pizzería Don Marco", CategoriaID: catRest.ID, Icon: "🍕", Descripcion: "Pizzas artesanales, hamburguesas y comidas rápidas con servicio a domicilio.", Direccion: "Cra. 6 #8-50", Telefono: "312 678 9012", Horario: "Mar-Dom 4:00 PM - 11:00 PM", Rating: 4},
		{Nombre: "Supermercado El Ahorro", CategoriaID: catTie.ID, Icon: "🛒", Descripcion: "Mercado completo con productos de primera necesidad, frutas y verduras frescas.", Direccion: "Cl. 5 #3-15", Telefono: "300 111 2233", Horario: "Lun-Dom 7:00 AM - 9:00 PM", Rating: 4},
		{Nombre: "Tienda La Esquina", CategoriaID: catTie.ID, Icon: "🏪", Descripcion: "Tienda de barrio con víveres, dulces y bebidas. Atención personalizada.", Direccion: "Cra. 8 #10-22", Telefono: "310 444 5566", Horario: "Lun-Dom 6:00 AM - 10:00 PM", Rating: 4},
		{Nombre: "Almacén La Moda Lérida", CategoriaID: catMo.ID, Icon: "👗", Descripcion: "Ropa para toda la familia, calzado y accesorios. Marcas nacionales e importadas.", Direccion: "Cl. 6 #5-30", Telefono: "315 222 7788", Horario: "Lun-Sáb 9:00 AM - 7:00 PM", Rating: 5},
		{Nombre: "Boutique Estilo Único", CategoriaID: catMo.ID, Icon: "👜", Descripcion: "Ropa femenina exclusiva, bolsos y accesorios de tendencia.", Direccion: "Cra. 5 #7-12", Telefono: "318 999 0011", Horario: "Lun-Sáb 10:00 AM - 7:00 PM", Rating: 4},
		{Nombre: "Farmacia Lérida Salud", CategoriaID: catSal.ID, Icon: "💊", Descripcion: "Medicamentos, productos de aseo personal y atención farmacéutica 24 horas.", Direccion: "Cl. 7 #6-08", Telefono: "300 777 8899", Horario: "Abierto 24 horas", Rating: 5},
		{Nombre: "Centro Médico Vida Sana", CategoriaID: catSal.ID, Icon: "🏥", Descripcion: "Consulta general, odontología, pediatría y laboratorio clínico.", Direccion: "Cra. 7 #9-45", Telefono: "320 111 3344", Horario: "Lun-Sáb 7:00 AM - 6:00 PM", Rating: 5},
		{Nombre: "Instituto Educativo Lérida", CategoriaID: catEdu.ID, Icon: "🏫", Descripcion: "Refuerzo escolar, preparación ICFES y cursos de inglés para todas las edades.", Direccion: "Cl. 8 #4-67", Telefono: "317 555 6677", Horario: "Lun-Vie 2:00 PM - 8:00 PM", Rating: 4},
		{Nombre: "Academia de Sistemas", CategoriaID: catEdu.ID, Icon: "💻", Descripcion: "Cursos de computación, ofimática, diseño gráfico y programación.", Direccion: "Cra. 4 #5-22", Telefono: "312 333 4455", Horario: "Lun-Sáb 8:00 AM - 9:00 PM", Rating: 4},
		{Nombre: "Taller Mecánico Don Pedro", CategoriaID: catSer.ID, Icon: "🔧", Descripcion: "Mecánica general para motos y carros. Servicio de grúa 24 horas.", Direccion: "Cl. 12 #2-90", Telefono: "311 666 7788", Horario: "Lun-Sáb 7:00 AM - 6:00 PM", Rating: 5},
		{Nombre: "Ferretería La Construcción", CategoriaID: catSer.ID, Icon: "🔨", Descripcion: "Materiales de construcción, herramientas, pinturas y artículos eléctricos.", Direccion: "Cra. 9 #11-30", Telefono: "300 222 3344", Horario: "Lun-Sáb 7:00 AM - 6:00 PM", Rating: 4},
		{Nombre: "Peluquería Estilo Único", CategoriaID: catBel.ID, Icon: "💇", Descripcion: "Cortes, tintes, peinados, manicure y pedicure. Atención por cita.", Direccion: "Cl. 6 #7-25", Telefono: "319 888 9900", Horario: "Mar-Sáb 9:00 AM - 7:00 PM", Rating: 5},
		{Nombre: "Spa Bienestar", CategoriaID: catBel.ID, Icon: "💆", Descripcion: "Masajes relajantes, tratamientos faciales y depilación profesional.", Direccion: "Cra. 6 #8-15", Telefono: "314 555 6677", Horario: "Lun-Sáb 10:00 AM - 8:00 PM", Rating: 5},
		{Nombre: "Cancha Sintética El Gol", CategoriaID: catDep.ID, Icon: "⚽", Descripcion: "Alquiler de cancha de fútbol 8 con iluminación nocturna. Sede del torneo local.", Direccion: "Cl. 15 #6-100", Telefono: "300 888 9999", Horario: "Lun-Dom 3:00 PM - 12:00 AM", Rating: 5},
		{Nombre: "Gimnasio Power Fitness", CategoriaID: catDep.ID, Icon: "🏋️", Descripcion: "Máquinas modernas, clases grupales de spinning, zumba y entrenamiento personalizado.", Direccion: "Cra. 8 #10-50", Telefono: "315 444 5566", Horario: "Lun-Sáb 5:00 AM - 10:00 PM", Rating: 4},
		{Nombre: "Mototaxi Lérida Express", CategoriaID: catTra.ID, Icon: "🛵", Descripcion: "Servicio de mototaxi 24 horas. Transporte seguro dentro y fuera del municipio.", Direccion: "Parque Principal", Telefono: "300 333 4455", Horario: "Abierto 24 horas", Rating: 4},
	}
	for _, com := range comercios {
		var existing models.Comercio
		if err := db.Where("nombre = ?", com.Nombre).First(&existing).Error; err == gorm.ErrRecordNotFound {
			if err := db.Create(&com).Error; err != nil {
				return err
			}
		}
	}

	// ===== Equipos =====
	equipos := []models.Equipo{
		{Nombre: "Los Tigres FC", Color: "#e53935"},
		{Nombre: "Águilas Doradas", Color: "#fbc02d"},
		{Nombre: "Real Estrella", Color: "#1e88e5"},
		{Nombre: "Deportivo Halcón", Color: "#43a047"},
		{Nombre: "Sporting Club", Color: "#8e24aa"},
		{Nombre: "Atlético Norte", Color: "#fb8c00"},
		{Nombre: "Unión Central", Color: "#00897b"},
		{Nombre: "Racing Sur", Color: "#3949ab"},
		{Nombre: "Estudiantes FC", Color: "#c0392b"},
		{Nombre: "Defensores", Color: "#5d4037"},
		{Nombre: "San Lorenzo", Color: "#6a1b9a"},
		{Nombre: "Independiente", Color: "#d81b60"},
		{Nombre: "Olímpico FC", Color: "#00acc1"},
		{Nombre: "Juventud Unida", Color: "#7cb342"},
		{Nombre: "Cóndores", Color: "#ef6c00"},
		{Nombre: "Pumas SC", Color: "#455a64"},
	}
	for _, eq := range equipos {
		if err := db.Where("nombre = ?", eq.Nombre).FirstOrCreate(&eq).Error; err != nil {
			return err
		}
	}

	// ===== Generar fixture round-robin =====
	if err := generarFixture(db); err != nil {
		return err
	}

	return nil
}

func generarFixture(db *gorm.DB) error {
	var count int64
	db.Model(&models.Partido{}).Count(&count)
	if count > 0 {
		log.Println("  · Fixture ya existe, omitiendo.")
		return nil
	}

	var equipos []models.Equipo
	if err := db.Order("id ASC").Find(&equipos).Error; err != nil {
		return err
	}
	if len(equipos) != 16 {
		log.Printf("  · Se esperaban 16 equipos, hay %d. Omitiendo fixture.", len(equipos))
		return nil
	}

	ids := make([]uint, len(equipos))
	for i, e := range equipos {
		ids[i] = e.ID
	}
	n := len(ids)
	teams := make([]uint, n)
	copy(teams, ids)

	for r := 0; r < n-1; r++ {
		for i := 0; i < n/2; i++ {
			localID := teams[i]
			visitaID := teams[n-1-i]
			if r%2 == 1 {
				localID, visitaID = visitaID, localID
			}
			p := models.Partido{
				Jornada:        r + 1,
				OrdenJornada:   i + 1,
				LocalEquipoID:  localID,
				VisitaEquipoID: visitaID,
				Jugado:         false,
			}
			if err := db.Create(&p).Error; err != nil {
				return err
			}
		}
		// Rotación: el primero queda fijo, el resto rota
		fixed := teams[0]
		rest := append([]uint{}, teams[1:]...)
		last := rest[len(rest)-1]
		rest = append([]uint{last}, rest[:len(rest)-1]...)
		teams = append([]uint{fixed}, rest...)
	}

	log.Printf("  · %d partidos creados (%d jornadas).", (n/2)*(n-1), n-1)
	return nil
}
