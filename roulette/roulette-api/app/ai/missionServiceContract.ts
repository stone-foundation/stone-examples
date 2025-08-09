export const missionServiceContract = [
  {
    "strict": false,
    "type": "function",
    "name": "missionService_list",
    "description": "Liste toutes les missions avec pagination optionnelle.",
    "parameters": {
      "type": "object",
      "properties": {
        "limit": {
          "type": "integer",
          "description": "Nombre de missions à retourner (optionnel, défaut: 10).",
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
    "name": "missionService_listBy",
    "description": "Liste les missions en filtrant par conditions (ex: nom, code, visibilité) avec pagination.",
    "parameters": {
      "type": "object",
      "properties": {
        "conditions": {
          "type": "object",
          "description": "Filtres partiels selon le modèle MissionModel.",
          "properties": {
            "name": { 
              "type": "string",
              "description": "Nom de la mission (recherche partielle possible)"
            },
            "code": { 
              "type": "string",
              "description": "Code de la mission"
            },
            "visibility": {
              "type": "string",
              "enum": ["public", "private"],
              "description": "Visibilité de la mission"
            },
            "authorUuid": {
              "type": "string",
              "description": "UUID de l'auteur de la mission"
            }
          },
          "additionalProperties": false
        },
        "limit": {
          "type": "integer",
          "description": "Nombre de missions à retourner (optionnel, défaut: 10).",
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
    "name": "missionService_findBy",
    "description": "Trouve une mission unique en filtrant par son UUID, nom ou code.",
    "parameters": {
      "type": "object",
      "properties": {
        "conditions": {
          "type": "object",
          "description": "Filtres pour identifier la mission unique.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "Identifiant unique de la mission (prioritaire si fourni).",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "name": { 
              "type": "string",
              "description": "Nom exact de la mission"
            },
            "code": { 
              "type": "string",
              "description": "Code exact de la mission"
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
    "name": "missionService_create",
    "description": "Crée une nouvelle mission avec les champs requis et l'utilisateur qui la crée.",
    "parameters": {
      "type": "object",
      "properties": {
        "mission": {
          "type": "object",
          "description": "Objet mission à créer.",
          "properties": {
            "name": { 
              "type": "string", 
              "description": "Nom de la mission.",
              "minLength": 1,
              "maxLength": 255
            },
            "description": { 
              "type": "string", 
              "description": "Description de la mission.",
              "minLength": 1,
              "maxLength": 2000
            },
            "visibility": { 
              "type": "string", 
              "enum": ["public", "private"],
              "description": "Visibilité de la mission." 
            },
            "startDate": { 
              "type": ["integer", "null"], 
              "description": "Date de début en timestamp Unix (optionnel).",
              "minimum": 0
            },
            "endDate": { 
              "type": ["integer", "null"], 
              "description": "Date de fin en timestamp Unix (optionnel).",
              "minimum": 0
            },
            "imageUrl": { 
              "type": ["string", "null"], 
              "description": "URL de l'image de la mission (optionnel).",
              "format": "uri"
            }
          },
          "required": ["name", "description", "visibility"],
          "additionalProperties": false
        },
        "author": {
          "type": "object",
          "description": "Utilisateur qui crée la mission.",
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
      "required": ["mission", "author"],
      "additionalProperties": false
    }
  },
  {
    "strict": false,
    "type": "function",
    "name": "missionService_update",
    "description": "Met à jour une mission existante. Nécessite son UUID et les champs à modifier.",
    "parameters": {
      "type": "object",
      "properties": {
        "item": {
          "type": "object",
          "description": "La mission à mettre à jour, identifiée par son UUID.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "Identifiant unique de la mission à modifier.",
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
              "description": "Nom mis à jour de la mission.",
              "minLength": 1,
              "maxLength": 255
            },
            "description": { 
              "type": "string", 
              "description": "Description mise à jour de la mission.",
              "minLength": 1,
              "maxLength": 2000
            },
            "visibility": { 
              "type": "string", 
              "enum": ["public", "private"], 
              "description": "Nouvelle visibilité de la mission." 
            },
            "startDate": { 
              "type": ["integer", "null"], 
              "description": "Nouvelle date de début en timestamp Unix.",
              "minimum": 0
            },
            "endDate": { 
              "type": ["integer", "null"], 
              "description": "Nouvelle date de fin en timestamp Unix.",
              "minimum": 0
            },
            "imageUrl": { 
              "type": ["string", "null"], 
              "description": "Nouvelle image (URL).",
              "format": "uri"
            }
          },
          "additionalProperties": false,
          "minProperties": 1
        },
        "author": {
          "type": "object",
          "description": "Utilisateur qui modifie la mission.",
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
    "name": "missionService_delete",
    "description": "Supprime une mission existante en utilisant son UUID.",
    "parameters": {
      "type": "object",
      "properties": {
        "item": {
          "type": "object",
          "description": "La mission à supprimer, identifiée par son UUID.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "Identifiant unique de la mission à supprimer.",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            }
          },
          "required": ["uuid"],
          "additionalProperties": false
        },
        "author": {
          "type": "object",
          "description": "Utilisateur qui supprime la mission.",
          "properties": {
            "uuid": { 
              "type": "string", 
              "description": "UUID de l'utilisateur supprimant la mission",
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
    "name": "missionService_count",
    "description": "Retourne le nombre total de missions, optionnellement filtré par conditions.",
    "parameters": {
      "type": "object",
      "properties": {
        "conditions": {
          "type": "object",
          "description": "Filtres optionnels pour compter seulement certaines missions.",
          "properties": {
            "visibility": {
              "type": "string",
              "enum": ["public", "private"],
              "description": "Compter seulement les missions avec cette visibilité"
            },
            "authorUuid": {
              "type": "string",
              "description": "Compter seulement les missions de cet auteur"
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