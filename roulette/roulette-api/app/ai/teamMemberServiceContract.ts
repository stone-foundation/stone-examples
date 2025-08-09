export const teamMemberServiceContract = [
  {
    "strict": false,
    "type": "function",
    "name": "teamMemberService_list",
    "description": "Liste tous les membres d'équipe avec pagination optionnelle.",
    "parameters": {
      "type": "object",
      "properties": {
        "limit": {
          "type": "integer",
          "description": "Nombre de membres d'équipe à retourner (optionnel, défaut: 10).",
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
    "name": "teamMemberService_listBy",
    "description": "Liste les membres d'équipe en filtrant par conditions (ex: équipe, utilisateur, mission, rôle, statut) avec pagination.",
    "parameters": {
      "type": "object",
      "properties": {
        "conditions": {
          "type": "object",
          "description": "Filtres partiels selon le modèle TeamMemberModel.",
          "properties": {
            "name": {
              "type": "string",
              "description": "Nom du membre dans l'équipe (recherche partielle possible)"
            },
            "userUuid": {
              "type": "string",
              "description": "UUID de l'utilisateur",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "teamUuid": {
              "type": "string",
              "description": "UUID de l'équipe",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "missionUuid": {
              "type": "string",
              "description": "UUID de la mission",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "role": {
              "type": "string",
              "enum": ["member", "captain", "admin"],
              "description": "Rôle du membre dans l'équipe"
            },
            "isActive": {
              "type": "boolean",
              "description": "Statut d'activité du membre (true = actif, false = inactif)"
            },
            "isPresent": {
              "type": "boolean",
              "description": "Statut de présence du membre (true = présent, false = absent)"
            },
            "isLate": {
              "type": "boolean",
              "description": "Statut de retard du membre (true = en retard, false = à l'heure)"
            }
          },
          "additionalProperties": false
        },
        "limit": {
          "type": "integer",
          "description": "Nombre de membres d'équipe à retourner (optionnel, défaut: 10).",
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
    "name": "teamMemberService_findBy",
    "description": "Trouve un membre d'équipe unique en filtrant par son UUID, nom, utilisateur ou équipe.",
    "parameters": {
      "type": "object",
      "properties": {
        "conditions": {
          "type": "object",
          "description": "Filtres pour identifier le membre d'équipe unique.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "Identifiant unique du membre d'équipe (prioritaire si fourni).",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "name": {
              "type": "string",
              "description": "Nom exact du membre dans l'équipe"
            },
            "userUuid": {
              "type": "string",
              "description": "UUID exact de l'utilisateur",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "teamUuid": {
              "type": "string",
              "description": "UUID exact de l'équipe (peut retourner plusieurs résultats, utiliser avec d'autres filtres)",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
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
    "name": "teamMemberService_count",
    "description": "Retourne le nombre total de membres d'équipe, optionnellement filtré par conditions.",
    "parameters": {
      "type": "object",
      "properties": {
        "conditions": {
          "type": "object",
          "description": "Filtres optionnels pour compter seulement certains membres d'équipe.",
          "properties": {
            "teamUuid": {
              "type": "string",
              "description": "Compter seulement les membres de cette équipe",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "missionUuid": {
              "type": "string",
              "description": "Compter seulement les membres de cette mission",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "role": {
              "type": "string",
              "enum": ["member", "captain", "admin"],
              "description": "Compter seulement les membres avec ce rôle"
            },
            "isActive": {
              "type": "boolean",
              "description": "Compter seulement les membres actifs (true) ou inactifs (false)"
            },
            "isPresent": {
              "type": "boolean",
              "description": "Compter seulement les membres présents (true) ou absents (false)"
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