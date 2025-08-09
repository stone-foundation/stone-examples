export const userServiceContract = [
  {
    "strict": false,
    "type": "function",
    "name": "userService_list",
    "description": "Liste tous les utilisateurs avec pagination optionnelle.",
    "parameters": {
      "type": "object",
      "properties": {
        "limit": {
          "type": "integer",
          "description": "Nombre d'utilisateurs à retourner (optionnel, défaut: 10).",
          "minimum": 1,
          "maximum": 100
        },
        "page": {
          "type": ["string", "integer"],
          "description": "Identifiant de page pour la pagination (optionnel)."
        }
      },
      "required": [],
      "additionalProperties": false
    }
  },
  {
    "strict": false,
    "type": "function",
    "name": "userService_listBy",
    "description": "Liste les utilisateurs en filtrant par conditions (ex: nom, téléphone, statut, rôles) avec pagination.",
    "parameters": {
      "type": "object",
      "properties": {
        "conditions": {
          "type": "object",
          "description": "Filtres partiels selon le modèle UserModel.",
          "properties": {
            "fullname": {
              "type": "string",
              "description": "Nom complet de l'utilisateur (recherche partielle possible)"
            },
            "username": {
              "type": "string",
              "description": "Nom d'utilisateur"
            },
            "phone": {
              "type": "string",
              "description": "Numéro de téléphone (sera normalisé automatiquement)"
            },
            "isActive": {
              "type": "boolean",
              "description": "Statut d'activité de l'utilisateur"
            },
            "isOnline": {
              "type": "boolean",
              "description": "Statut de connexion de l'utilisateur"
            },
            "teamUuid": {
              "type": "string",
              "description": "UUID de l'équipe de l'utilisateur",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            }
          },
          "additionalProperties": false
        },
        "limit": {
          "type": "integer",
          "description": "Nombre d'utilisateurs à retourner (optionnel, défaut: 10).",
          "minimum": 1,
          "maximum": 100
        },
        "page": {
          "type": ["string", "integer"],
          "description": "Identifiant de page pour la pagination (optionnel)."
        }
      },
      "required": ["conditions"],
      "additionalProperties": false
    }
  },
  {
    "strict": false,
    "type": "function",
    "name": "userService_findBy",
    "description": "Trouve un utilisateur unique en filtrant par son UUID, nom d'utilisateur ou téléphone.",
    "parameters": {
      "type": "object",
      "properties": {
        "conditions": {
          "type": "object",
          "description": "Filtres pour identifier l'utilisateur unique.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "Identifiant unique de l'utilisateur (prioritaire si fourni).",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "username": {
              "type": "string",
              "description": "Nom d'utilisateur exact"
            },
            "phone": {
              "type": "string",
              "description": "Numéro de téléphone exact (sera normalisé automatiquement)"
            }
          },
          "additionalProperties": false,
          "minProperties": 1
        }
      },
      "required": ["conditions"],
      "additionalProperties": false
    }
  },
  {
    "strict": false,
    "type": "function",
    "name": "userService_create",
    "description": "Crée un nouvel utilisateur avec les champs requis et optionnels du modèle UserModel.",
    "parameters": {
      "type": "object",
      "properties": {
        "user": {
          "type": "object",
          "description": "Objet utilisateur à créer.",
          "properties": {
            "fullname": {
              "type": "string",
              "description": "Nom complet de l'utilisateur.",
              "minLength": 1,
              "maxLength": 255
            },
            "phone": {
              "type": "string",
              "description": "Numéro de téléphone de l'utilisateur (sera normalisé automatiquement).",
              "minLength": 8,
              "maxLength": 20
            },
            "username": {
              "type": "string",
              "description": "Nom d'utilisateur unique (optionnel, généré depuis fullname si non fourni).",
              "minLength": 3,
              "maxLength": 50,
              "pattern": "^[a-zA-Z0-9_-]+$"
            },
            "password": {
              "type": ["string", "null"],
              "description": "Mot de passe de l'utilisateur (optionnel).",
              "minLength": 6
            },
            "avatarUrl": {
              "type": ["string", "null"],
              "description": "URL de l'avatar de l'utilisateur (optionnel).",
              "format": "uri"
            },
            "roles": {
              "type": ["array", "string", "null"],
              "description": "Rôles de l'utilisateur (optionnel). Peut être un tableau ou une chaîne.",
              "items": {
                "type": "string",
                "enum": ["admin", "moderator", "user"]
              }
            }
          },
          "required": [
            "fullname",
            "phone"
          ],
          "additionalProperties": false
        },
        "author": {
          "type": "object",
          "description": "Utilisateur qui crée le nouvel utilisateur.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "UUID de l'utilisateur créateur",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            }
          },
          "required": ["uuid"],
          "additionalProperties": false
        }
      },
      "required": ["user", "author"],
      "additionalProperties": false
    }
  },
  {
    "strict": false,
    "type": "function",
    "name": "userService_update",
    "description": "Met à jour un utilisateur existant. Nécessite son UUID et les champs à modifier.",
    "parameters": {
      "type": "object",
      "properties": {
        "item": {
          "type": "object",
          "description": "L'utilisateur à mettre à jour, identifié par son UUID.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "Identifiant unique de l'utilisateur à modifier.",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            }
          },
          "required": ["uuid"],
          "additionalProperties": false
        },
        "data": {
          "type": "object",
          "description": "Champs à mettre à jour. Au moins un champ doit être fourni.",
          "properties": {
            "fullname": {
              "type": "string",
              "description": "Nom complet mis à jour de l'utilisateur.",
              "minLength": 1,
              "maxLength": 255
            },
            "username": {
              "type": "string",
              "description": "Nom d'utilisateur mis à jour.",
              "minLength": 3,
              "maxLength": 50,
              "pattern": "^[a-zA-Z0-9_-]+$"
            },
            "phone": {
              "type": "string",
              "description": "Numéro de téléphone mis à jour (sera normalisé automatiquement).",
              "minLength": 8,
              "maxLength": 20
            },
            "password": {
              "type": ["string", "null"],
              "description": "Mot de passe mis à jour.",
              "minLength": 6
            },
            "avatarUrl": {
              "type": ["string", "null"],
              "description": "URL mise à jour de l'avatar.",
              "format": "uri"
            },
            "isActive": {
              "type": "boolean",
              "description": "Statut d'activité mis à jour."
            },
            "isOnline": {
              "type": "boolean",
              "description": "Statut de connexion mis à jour."
            },
            "roles": {
              "type": ["array", "string", "null"],
              "description": "Rôles mis à jour de l'utilisateur.",
              "items": {
                "type": "string",
                "enum": ["admin", "moderator", "user"]
              }
            },
            "lastSeen": {
              "type": ["integer", "null"],
              "description": "Timestamp de la dernière connexion.",
              "minimum": 0
            },
            "otp": {
              "type": ["string", "null"],
              "description": "Code OTP pour l'authentification à deux facteurs.",
              "minLength": 4,
              "maxLength": 8
            },
            "otpCount": {
              "type": ["integer", "null"],
              "description": "Nombre de tentatives OTP.",
              "minimum": 0
            },
            "otpExpiresAt": {
              "type": ["integer", "null"],
              "description": "Timestamp d'expiration de l'OTP.",
              "minimum": 0
            }
          },
          "additionalProperties": false,
          "minProperties": 1
        },
        "author": {
          "type": "object",
          "description": "Utilisateur qui modifie l'utilisateur.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "UUID de l'utilisateur modificateur",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            }
          },
          "required": ["uuid"],
          "additionalProperties": false
        }
      },
      "required": ["item", "data", "author"],
      "additionalProperties": false
    }
  },
  {
    "strict": false,
    "type": "function",
    "name": "userService_delete",
    "description": "Supprime un utilisateur existant en utilisant son UUID.",
    "parameters": {
      "type": "object",
      "properties": {
        "item": {
          "type": "object",
          "description": "L'utilisateur à supprimer, identifié par son UUID.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "Identifiant unique de l'utilisateur à supprimer.",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            }
          },
          "required": ["uuid"],
          "additionalProperties": false
        },
        "author": {
          "type": "object",
          "description": "Utilisateur qui supprime l'utilisateur.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "UUID de l'utilisateur supprimant l'utilisateur",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            }
          },
          "required": ["uuid"],
          "additionalProperties": false
        }
      },
      "required": ["item", "author"],
      "additionalProperties": false
    }
  },
  {
    "strict": false,
    "type": "function",
    "name": "userService_count",
    "description": "Retourne le nombre total d'utilisateurs, optionnellement filtré par conditions.",
    "parameters": {
      "type": "object",
      "properties": {
        "conditions": {
          "type": "object",
          "description": "Filtres optionnels pour compter seulement certains utilisateurs.",
          "properties": {
            "isActive": {
              "type": "boolean",
              "description": "Compter seulement les utilisateurs actifs (true) ou inactifs (false)"
            },
            "isOnline": {
              "type": "boolean",
              "description": "Compter seulement les utilisateurs en ligne (true) ou hors ligne (false)"
            },
            "teamUuid": {
              "type": "string",
              "description": "Compter seulement les utilisateurs de cette équipe",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            }
          },
          "additionalProperties": false
        }
      },
      "required": [],
      "additionalProperties": false
    }
  }
]