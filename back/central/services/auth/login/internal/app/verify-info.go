package app

import (
	"context"
	"fmt"
)

// GetVerifyInfo devuelve el email y la lista de roles del usuario indicado.
// Pensado para enriquecer la respuesta de /auth/verify cuando los claims del
// token no contienen estos campos (caso actual del JWT unificado).
func (uc *AuthUseCase) GetVerifyInfo(ctx context.Context, userID uint) (string, []string, error) {
	if userID == 0 {
		return "", nil, fmt.Errorf("user_id requerido")
	}

	user, err := uc.repository.GetUserByID(ctx, userID)
	if err != nil {
		return "", nil, fmt.Errorf("usuario no encontrado: %w", err)
	}
	if user == nil {
		return "", nil, fmt.Errorf("usuario no encontrado")
	}

	roles, err := uc.repository.GetUserRoles(ctx, userID)
	if err != nil {
		// Roles son no críticos: devolver email aunque la query falle.
		uc.log.Warn().Err(err).Uint("user_id", userID).Msg("Error al obtener roles para verify")
		return user.Email, nil, nil
	}
	names := make([]string, len(roles))
	for i, r := range roles {
		names[i] = r.Name
	}
	return user.Email, names, nil
}
