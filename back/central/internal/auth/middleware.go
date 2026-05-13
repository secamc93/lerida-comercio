package auth

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

const CtxKeyClaims = "auth_claims"

// RequireAuth valida JWT y guarda los claims en el contexto.
func RequireAuth(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		h := c.GetHeader("Authorization")
		if h == "" || !strings.HasPrefix(h, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing bearer token"})
			return
		}
		raw := strings.TrimPrefix(h, "Bearer ")
		claims, err := Parse(secret, raw)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}
		c.Set(CtxKeyClaims, claims)
		c.Next()
	}
}

// RequireRole valida que el rol esté en la lista permitida.
func RequireRole(roles ...string) gin.HandlerFunc {
	allowed := map[string]bool{}
	for _, r := range roles {
		allowed[r] = true
	}
	return func(c *gin.Context) {
		v, ok := c.Get(CtxKeyClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "no auth"})
			return
		}
		claims := v.(*Claims)
		if !allowed[claims.Role] {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "rol no autorizado"})
			return
		}
		c.Next()
	}
}

func GetClaims(c *gin.Context) (*Claims, bool) {
	v, ok := c.Get(CtxKeyClaims)
	if !ok {
		return nil, false
	}
	return v.(*Claims), true
}
