package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/secamc93/lerida-comercio/back/migration/shared/models"
	"gorm.io/gorm"
)

type ComerciosHandler struct {
	DB *gorm.DB
}

type comercioInput struct {
	Nombre      string `json:"nombre" binding:"required"`
	CategoriaID uint   `json:"categoria_id" binding:"required"`
	Icon        string `json:"icon"`
	Descripcion string `json:"descripcion"`
	Direccion   string `json:"direccion"`
	Telefono    string `json:"telefono"`
	Horario     string `json:"horario"`
	Rating      int    `json:"rating"`
}

func (h *ComerciosHandler) List(c *gin.Context) {
	var items []models.Comercio
	q := h.DB.Preload("Categoria").Where("activo = ?", true)

	if catID := c.Query("categoria_id"); catID != "" {
		if id, err := strconv.Atoi(catID); err == nil {
			q = q.Where("categoria_id = ?", id)
		}
	}
	if search := c.Query("q"); search != "" {
		like := "%" + search + "%"
		q = q.Where("nombre ILIKE ? OR descripcion ILIKE ?", like, like)
	}

	if err := q.Order("nombre ASC").Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": items, "total": len(items)})
}

func (h *ComerciosHandler) Get(c *gin.Context) {
	id := c.Param("id")
	var item models.Comercio
	if err := h.DB.Preload("Categoria").First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "no encontrado"})
		return
	}
	c.JSON(http.StatusOK, item)
}

func (h *ComerciosHandler) Create(c *gin.Context) {
	var in comercioInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if in.Rating == 0 {
		in.Rating = 5
	}
	item := models.Comercio{
		Nombre:      in.Nombre,
		CategoriaID: in.CategoriaID,
		Icon:        in.Icon,
		Descripcion: in.Descripcion,
		Direccion:   in.Direccion,
		Telefono:    in.Telefono,
		Horario:     in.Horario,
		Rating:      in.Rating,
		Activo:      true,
	}
	if err := h.DB.Create(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	h.DB.Preload("Categoria").First(&item, item.ID)
	c.JSON(http.StatusCreated, item)
}

func (h *ComerciosHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var item models.Comercio
	if err := h.DB.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "no encontrado"})
		return
	}
	var in comercioInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	item.Nombre = in.Nombre
	item.CategoriaID = in.CategoriaID
	item.Icon = in.Icon
	item.Descripcion = in.Descripcion
	item.Direccion = in.Direccion
	item.Telefono = in.Telefono
	item.Horario = in.Horario
	if in.Rating > 0 {
		item.Rating = in.Rating
	}
	if err := h.DB.Save(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	h.DB.Preload("Categoria").First(&item, item.ID)
	c.JSON(http.StatusOK, item)
}

func (h *ComerciosHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.DB.Delete(&models.Comercio{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// Categorías

type CategoriasHandler struct {
	DB *gorm.DB
}

func (h *CategoriasHandler) List(c *gin.Context) {
	var items []models.Categoria
	if err := h.DB.Order("orden ASC, nombre ASC").Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": items})
}
