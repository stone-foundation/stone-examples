export const teamServiceContract = [
  {
    "strict": false,
    "type": "function",
    "name": "teamService_list",
    "description": "Liste toutes les équipes avec pagination optionnelle.",
    "parameters": {
      "type": "object",
      "properties": {
        "limit": {
          "type": "integer",
          "description": "Nombre d'équipes à retourner (optionnel, défaut: 10).",
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
    "name": "teamService_listBy",
    "description": "Liste les équipes en filtrant par conditions (ex: nom, couleur, mission, rang) avec pagination.",
    "parameters": {
      "type": "object",
      "properties": {
        "conditions": {
          "type": "object",
          "description": "Filtres partiels selon le modèle TeamModel.",
          "properties": {
            "name": {
              "type": "string",
              "description": "Nom de l'équipe (recherche partielle possible)"
            },
            "color": {
              "type": "string",
              "description": "Couleur de l'équipe"
            },
            "rank": {
              "type": "integer",
              "description": "Rang de l'équipe",
              "minimum": 1
            },
            "missionUuid": {
              "type": "string",
              "description": "UUID de la mission associée",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "captainUuid": {
              "type": "string",
              "description": "UUID du capitaine de l'équipe",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            }
          },
          "additionalProperties": false
        },
        "limit": {
          "type": "integer",
          "description": "Nombre d'équipes à retourner (optionnel, défaut: 10).",
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
    "name": "teamService_findBy",
    "description": "Trouve une équipe unique en filtrant par son UUID, nom ou couleur.",
    "parameters": {
      "type": "object",
      "properties": {
        "conditions": {
          "type": "object",
          "description": "Filtres pour identifier l'équipe unique.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "Identifiant unique de l'équipe (prioritaire si fourni).",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "name": {
              "type": "string",
              "description": "Nom exact de l'équipe"
            },
            "color": {
              "type": "string",
              "description": "Couleur exacte de l'équipe"
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
    "name": "teamService_create",
    "description": "Crée une nouvelle équipe avec les champs requis et optionnels du modèle TeamModel.",
    "parameters": {
      "type": "object",
      "properties": {
        "team": {
          "type": "object",
          "description": "Objet équipe à créer.",
          "properties": {
            "name": {
              "type": "string",
              "description": "Nom de l'équipe.",
              "minLength": 1,
              "maxLength": 255
            },
            "rank": {
              "type": "integer",
              "description": "Rang de l'équipe.",
              "minimum": 1
            },
            "score": {
              "type": "integer",
              "description": "Score initial de l'équipe.",
              "minimum": 0,
              "default": 0
            },
            "missionUuid": {
              "type": "string",
              "description": "UUID de la mission associée.",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "totalMembers": {
              "type": "integer",
              "description": "Nombre total de membres autorisés dans l'équipe (optionnel).",
              "minimum": 1,
              "maximum": 100
            },
            "color": {
              "type": ["string", "null"],
              "description": "Couleur de l'équipe (optionnel).",
              "minLength": 1,
              "maxLength": 50
            },
            "motto": {
              "type": ["string", "null"],
              "description": "Devise de l'équipe (optionnel).",
              "maxLength": 500
            },
            "rules": {
              "type": ["string", "null"],
              "description": "Règles de l'équipe (optionnel).",
              "maxLength": 2000
            },
            "slogan": {
              "type": ["string", "null"],
              "description": "Slogan de l'équipe (optionnel).",
              "maxLength": 255
            },
            "description": {
              "type": ["string", "null"],
              "description": "Description de l'équipe (optionnel).",
              "maxLength": 2000
            },
            "logoUrl": {
              "type": ["string", "null"],
              "description": "URL du logo de l'équipe (optionnel).",
              "format": "uri"
            },
            "bannerUrl": {
              "type": ["string", "null"],
              "description": "URL de la bannière de l'équipe (optionnel).",
              "format": "uri"
            },
            "chatLink": {
              "type": ["string", "null"],
              "description": "Lien vers le chat de l'équipe (optionnel).",
              "format": "uri"
            },
            "captainUuid": {
              "type": ["string", "null"],
              "description": "UUID du capitaine de l'équipe (optionnel).",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            }
          },
          "required": [
            "name",
            "rank",
            "missionUuid"
          ],
          "additionalProperties": false
        },
        "author": {
          "type": "object",
          "description": "Utilisateur qui crée l'équipe.",
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
      "required": ["team", "author"],
      "additionalProperties": false
    }
  },
  {
    "strict": false,
    "type": "function",
    "name": "teamService_update",
    "description": "Met à jour une équipe existante. Nécessite son UUID et les champs à modifier.",
    "parameters": {
      "type": "object",
      "properties": {
        "item": {
          "type": "object",
          "description": "L'équipe à mettre à jour, identifiée par son UUID.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "Identifiant unique de l'équipe à modifier.",
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
            "name": {
              "type": "string",
              "description": "Nom mis à jour de l'équipe.",
              "minLength": 1,
              "maxLength": 255
            },
            "rank": {
              "type": "integer",
              "description": "Rang mis à jour de l'équipe.",
              "minimum": 1
            },
            "score": {
              "type": "integer",
              "description": "Score mis à jour de l'équipe.",
              "minimum": 0
            },
            "totalMembers": {
              "type": "integer",
              "description": "Nombre total de membres mis à jour.",
              "minimum": 1,
              "maximum": 100
            },
            "color": {
              "type": ["string", "null"],
              "description": "Couleur mise à jour de l'équipe.",
              "minLength": 1,
              "maxLength": 50
            },
            "motto": {
              "type": ["string", "null"],
              "description": "Devise mise à jour de l'équipe.",
              "maxLength": 500
            },
            "rules": {
              "type": ["string", "null"],
              "description": "Règles mises à jour de l'équipe.",
              "maxLength": 2000
            },
            "slogan": {
              "type": ["string", "null"],
              "description": "Slogan mis à jour de l'équipe.",
              "maxLength": 255
            },
            "description": {
              "type": ["string", "null"],
              "description": "Description mise à jour de l'équipe.",
              "maxLength": 2000
            },
            "logoUrl": {
              "type": ["string", "null"],
              "description": "URL mise à jour du logo de l'équipe.",
              "format": "uri"
            },
            "bannerUrl": {
              "type": ["string", "null"],
              "description": "URL mise à jour de la bannière de l'équipe.",
              "format": "uri"
            },
            "chatLink": {
              "type": ["string", "null"],
              "description": "Lien mis à jour vers le chat de l'équipe.",
              "format": "uri"
            },
            "captainUuid": {
              "type": ["string", "null"],
              "description": "UUID mis à jour du capitaine de l'équipe.",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "missionUuid": {
              "type": "string",
              "description": "UUID mis à jour de la mission associée.",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "scorePercentage": {
              "type": ["number", "null"],
              "description": "Pourcentage de score mis à jour.",
              "minimum": 0,
              "maximum": 100
            }
          },
          "additionalProperties": false,
          "minProperties": 1
        },
        "author": {
          "type": "object",
          "description": "Utilisateur qui modifie l'équipe.",
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
    "name": "teamService_delete",
    "description": "Supprime une équipe existante en utilisant son UUID.",
    "parameters": {
      "type": "object",
      "properties": {
        "item": {
          "type": "object",
          "description": "L'équipe à supprimer, identifiée par son UUID.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "Identifiant unique de l'équipe à supprimer.",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            }
          },
          "required": ["uuid"],
          "additionalProperties": false
        },
        "author": {
          "type": "object",
          "description": "Utilisateur qui supprime l'équipe.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "UUID de l'utilisateur supprimant l'équipe",
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
    "name": "teamService_count",
    "description": "Retourne le nombre total d'équipes, optionnellement filtré par conditions.",
    "parameters": {
      "type": "object",
      "properties": {
        "conditions": {
          "type": "object",
          "description": "Filtres optionnels pour compter seulement certaines équipes.",
          "properties": {
            "color": {
              "type": "string",
              "description": "Compter seulement les équipes de cette couleur"
            },
            "missionUuid": {
              "type": "string",
              "description": "Compter seulement les équipes de cette mission",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "captainUuid": {
              "type": "string",
              "description": "Compter seulement les équipes avec ce capitaine",
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