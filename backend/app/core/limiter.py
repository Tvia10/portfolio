from slowapi import Limiter
from slowapi.util import get_remote_address

# Detras de Traefik la IP real llega en X-Forwarded-For; slowapi la usa si esta presente.
limiter = Limiter(key_func=get_remote_address)
