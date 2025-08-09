export const badgeServiceContract = [
  {
    "strict": false,
    "type": "function",
    "name": "badgeService_list",
    "description": "Liste tous les badges avec pagination optionnelle.",
    "parameters": {
      "type": "object",
      "properties": {
        "limit": {
          "type": "integer",
          "description": "Nombre de badges à retourner (optionnel, défaut: 10).",
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
    "name": "badgeService_listBy",
    "description": "Liste les badges en filtrant par conditions (ex: nom, catégorie, mission, visibilité) avec pagination.",
    "parameters": {
      "type": "object",
      "properties": {
        "conditions": {
          "type": "object",
          "description": "Filtres partiels selon le modèle BadgeModel.",
          "properties": {
            "name": {
              "type": "string",
              "description": "Nom du badge (recherche partielle possible)"
            },
            "category": {
              "type": "string",
              "description": "Catégorie du badge"
            },
            "categoryLabel": {
              "type": "string",
              "description": "Nom lisible de la catégorie"
            },
            "color": {
              "type": "string",
              "description": "Couleur du badge"
            },
            "visibility": {
              "type": "string",
              "enum": ["public", "private"],
              "description": "Visibilité du badge"
            },
            "missionUuid": {
              "type": "string",
              "description": "UUID de la mission associée",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            }
          },
          "additionalProperties": false
        },
        "limit": {
          "type": "integer",
          "description": "Nombre de badges à retourner (optionnel, défaut: 10).",
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
    "name": "badgeService_findBy",
    "description": "Trouve un badge unique en filtrant par son UUID, nom ou catégorie.",
    "parameters": {
      "type": "object",
      "properties": {
        "conditions": {
          "type": "object",
          "description": "Filtres pour identifier le badge unique.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "Identifiant unique du badge (prioritaire si fourni).",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "name": {
              "type": "string",
              "description": "Nom exact du badge"
            },
            "category": {
              "type": "string",
              "description": "Catégorie exacte du badge"
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
    "name": "badgeService_create",
    "description": "Crée un nouveau badge avec les champs requis et optionnels du modèle BadgeModel.",
    "parameters": {
      "type": "object",
      "properties": {
        "badge": {
          "type": "object",
          "description": "Objet badge à créer.",
          "properties": {
            "name": {
              "type": "string",
              "description": "Nom du badge.",
              "minLength": 1,
              "maxLength": 255
            },
            "description": {
              "type": "string",
              "description": "Description du badge.",
              "minLength": 1,
              "maxLength": 2000
            },
            "color": {
              "type": "string",
              "description": "Couleur du badge (code couleur ou nom).",
              "minLength": 1,
              "maxLength": 50
            },
            "score": {
              "type": "integer",
              "description": "Nombre de points attribués par le badge.",
              "minimum": 0
            },
            "category": {
              "type": "string",
              "description": "Catégorie du badge.",
              "minLength": 1,
              "maxLength": 100
            },
            "categoryLabel": {
              "type": "string",
              "description": "Nom lisible de la catégorie.",
              "minLength": 1,
              "maxLength": 255
            },
            "missionUuid": {
              "type": "string",
              "description": "UUID de la mission associée.",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "visibility": {
              "type": "string",
              "enum": ["public", "private"],
              "description": "Visibilité du badge."
            },
            "maxAssignments": {
              "type": "integer",
              "description": "Nombre maximum d'attributions du badge.",
              "minimum": 1
            },
            "iconUrl": {
              "type": ["string", "null"],
              "description": "URL de l'icône du badge (optionnel).",
              "format": "uri"
            },
            "expirationDays": {
              "type": ["integer", "null"],
              "description": "Nombre de jours avant expiration du badge (optionnel).",
              "minimum": 1
            }
          },
          "required": [
            "name",
            "description",
            "color",
            "score",
            "category",
            "categoryLabel",
            "missionUuid",
            "visibility",
            "maxAssignments"
          ],
          "additionalProperties": false
        },
        "author": {
          "type": "object",
          "description": "Utilisateur qui crée le badge.",
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
      "required": ["badge", "author"],
      "additionalProperties": false
    }
  },
  {
    "strict": false,
    "type": "function",
    "name": "badgeService_update",
    "description": "Met à jour un badge existant. Nécessite son UUID et les champs à modifier.",
    "parameters": {
      "type": "object",
      "properties": {
        "item": {
          "type": "object",
          "description": "Le badge à mettre à jour, identifié par son UUID.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "Identifiant unique du badge à modifier.",
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
              "description": "Nom mis à jour du badge.",
              "minLength": 1,
              "maxLength": 255
            },
            "description": {
              "type": "string",
              "description": "Description mise à jour du badge.",
              "minLength": 1,
              "maxLength": 2000
            },
            "color": {
              "type": "string",
              "description": "Couleur mise à jour du badge.",
              "minLength": 1,
              "maxLength": 50
            },
            "score": {
              "type": "integer",
              "description": "Score mis à jour du badge.",
              "minimum": 0
            },
            "category": {
              "type": "string",
              "description": "Catégorie mise à jour du badge.",
              "minLength": 1,
              "maxLength": 100
            },
            "categoryLabel": {
              "type": "string",
              "description": "Nom lisible mis à jour de la catégorie.",
              "minLength": 1,
              "maxLength": 255
            },
            "missionUuid": {
              "type": "string",
              "description": "UUID mis à jour de la mission associée.",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "visibility": {
              "type": "string",
              "enum": ["public", "private"],
              "description": "Visibilité mise à jour du badge."
            },
            "maxAssignments": {
              "type": "integer",
              "description": "Nombre maximum d'attributions mis à jour.",
              "minimum": 1
            },
            "iconUrl": {
              "type": ["string", "null"],
              "description": "URL mise à jour de l'icône du badge.",
              "format": "uri"
            },
            "expirationDays": {
              "type": ["integer", "null"],
              "description": "Nombre de jours avant expiration mis à jour.",
              "minimum": 1
            }
          },
          "additionalProperties": false,
          "minProperties": 1
        },
        "author": {
          "type": "object",
          "description": "Utilisateur qui modifie le badge.",
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
    "name": "badgeService_delete",
    "description": "Supprime un badge existant en utilisant son UUID.",
    "parameters": {
      "type": "object",
      "properties": {
        "item": {
          "type": "object",
          "description": "Le badge à supprimer, identifié par son UUID.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "Identifiant unique du badge à supprimer.",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            }
          },
          "required": ["uuid"],
          "additionalProperties": false
        },
        "author": {
          "type": "object",
          "description": "Utilisateur qui supprime le badge.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "UUID de l'utilisateur supprimant le badge",
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
    "name": "badgeService_count",
    "description": "Retourne le nombre total de badges, optionnellement filtré par conditions.",
    "parameters": {
      "type": "object",
      "properties": {
        "conditions": {
          "type": "object",
          "description": "Filtres optionnels pour compter seulement certains badges.",
          "properties": {
            "category": {
              "type": "string",
              "description": "Compter seulement les badges de cette catégorie"
            },
            "visibility": {
              "type": "string",
              "enum": ["public", "private"],
              "description": "Compter seulement les badges avec cette visibilité"
            },
            "missionUuid": {
              "type": "string",
              "description": "Compter seulement les badges de cette mission",
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