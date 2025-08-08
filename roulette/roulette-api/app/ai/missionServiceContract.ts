export const missionServiceContract = [
  {
    "strict": false,
    "type": "function",
    "name": "missionService_listBy",
    "description": "Liste les missions en filtrant par conditions (ex: nom, visibilité) et pagination.",
    "parameters": {
      "type": "object",
      "properties": {
        "conditions": {
          "type": "object",
          "description": "Filtres partiels selon le modèle MissionModel. Exemple : { name, visibility }.",
          "properties": {
            "name": { "type": "string" },
            "visibility": { "type": "string", "enum": ["public", "private"] },
            "code": { "type": "string" }
          }
        },
        "limit": {
          "type": "integer",
          "description": "Nombre de missions à retourner (optionnel, défaut: 10)."
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
    "description": "Trouve une mission en filtrant par son UUID, nom ou code.",
    "parameters": {
      "type": "object",
      "properties": {
        "uuid": {
          "type": "string",
          "description": "Identifiant unique de la mission (prioritaire si fourni)."
        },
        "name": {
          "type": "string",
          "description": "Nom exact de la mission."
        },
        "code": {
          "type": "string",
          "description": "Code unique de la mission."
        }
      },
      "required": [],
      "additionalProperties": false
    }
  },
  {
    "strict": false,
    "type": "function",
    "name": "missionService_findActiveMissions",
    "description": "Trouve les missions actives (non terminées) avec pagination.",
    "parameters": {
      "type": "object",
      "properties": {
        "limit": {
          "type": "integer",
          "description": "Nombre de missions à retourner (optionnel, défaut: 10)."
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
    "name": "missionService_existsBy",
    "description": "Vérifie si une mission existe selon les conditions données.",
    "parameters": {
      "type": "object",
      "properties": {
        "conditions": {
          "type": "object",
          "description": "Conditions pour vérifier l'existence de la mission.",
          "properties": {
            "uuid": { "type": "string" },
            "name": { "type": "string" },
            "code": { "type": "string" },
            "visibility": { "type": "string", "enum": ["public", "private"] }
          }
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
            "name": { "type": "string", "description": "Nom de la mission." },
            "description": { "type": "string", "description": "Description de la mission." },
            "visibility": { 
              "type": "string", 
              "enum": ["public", "private"],
              "description": "Visibilité de la mission." 
            },
            "startDate": { 
              "type": "integer", 
              "description": "Date de début en timestamp (optionnel).",
              "nullable": true
            },
            "endDate": { 
              "type": "integer", 
              "description": "Date de fin en timestamp (optionnel).",
              "nullable": true
            },
            "imageUrl": { 
              "type": "string", 
              "description": "URL de l'image de la mission (optionnel).",
              "nullable": true
            }
          },
          "required": ["name", "description", "visibility"],
          "additionalProperties": false
        },
        "author": {
          "type": "object",
          "description": "Acteur qui crée la mission.",
          "properties": {
            "uuid": { "type": "string", "description": "UUID de l'utilisateur créateur" }
          },
          "required": ["uuid"],
          "additionalProperties": false
        }
      },
      "required": ["mission", "author"]
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
              "description": "Identifiant unique de la mission à modifier."
            }
          },
          "required": ["uuid"],
          "additionalProperties": false
        },
        "data": {
          "type": "object",
          "description": "Champs à mettre à jour. Identiques à ceux du modèle MissionModel.",
          "properties": {
            "name": { "type": "string", "description": "Nom mis à jour de la mission." },
            "description": { "type": "string", "description": "Description mise à jour de la mission." },
            "visibility": { "type": "string", "enum": ["public", "private"], "description": "Nouvelle visibilité de la mission." },
            "startDate": { "type": "integer", "description": "Nouvelle date de début (timestamp)." },
            "endDate": { "type": "integer", "description": "Nouvelle date de fin (timestamp)." },
            "imageUrl": { "type": "string", "description": "Nouvelle image (URL)." }
          },
          "additionalProperties": false
        },
        "author": {
          "type": "object",
          "description": "Acteur qui modifie la mission.",
          "properties": {
            "uuid": { "type": "string", "description": "UUID de l'utilisateur modificateur" }
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
              "description": "Identifiant unique de la mission à supprimer."
            }
          },
          "required": ["uuid"],
          "additionalProperties": false
        },
        "author": {
          "type": "object",
          "description": "Acteur qui supprime la mission.",
          "properties": {
            "uuid": { "type": "string", "description": "UUID de l'utilisateur supprimant la mission" }
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
    "description": "Retourne le nombre total de missions.",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": [],
      "additionalProperties": false
    }
  },
  {
    "strict": false,
    "type": "function",
    "name": "missionService_isActive",
    "description": "Vérifie si une mission est active (dans sa période de validité).",
    "parameters": {
      "type": "object",
      "properties": {
        "mission": {
          "type": "object",
          "description": "La mission à vérifier.",
          "properties": {
            "uuid": { "type": "string" },
            "startDate": { "type": "integer" },
            "endDate": { "type": "integer" }
          },
          "required": ["uuid"]
        }
      },
      "required": ["mission"],
      "additionalProperties": false
    }
  },
  {
    "strict": false,
    "type": "function",
    "name": "missionService_getDuration",
    "description": "Calcule la durée d'une mission en millisecondes.",
    "parameters": {
      "type": "object",
      "properties": {
        "mission": {
          "type": "object",
          "description": "La mission dont calculer la durée.",
          "properties": {
            "uuid": { "type": "string" },
            "startDate": { "type": "integer" },
            "endDate": { "type": "integer" }
          },
          "required": ["uuid"]
        }
      },
      "required": ["mission"],
      "additionalProperties": false
    }
  }
]