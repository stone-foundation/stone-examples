export const activityServiceContract = [
  {
    "strict": false,
    "type": "function",
    "name": "activityService_listBy",
    "description": "Liste les activités en filtrant par conditions (ex: mission, badge, catégorie, impact), et pagination.",
    "parameters": {
      "type": "object",
      "properties": {
        "conditions": {
          "type": "object",
          "description": "Filtres partiels selon le modèle ActivityModel. Exemple : { missionUuid, badgeUuid, category, impact }."
        },
        "limit": {
          "type": "integer",
          "description": "Nombre d’activités à retourner (optionnel)."
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
    "name": "activityService_findBy",
    "description": "Trouve une activité en filtrant par son UUID ou son nom.",
    "parameters": {
      "type": "object",
      "properties": {
        "uuid": {
          "type": "string",
          "description": "Identifiant unique de l'activité (prioritaire si fourni)."
        },
        "name": {
          "type": "string",
          "description": "Nom exact de l'activité."
        }
      },
      "required": [],
      "additionalProperties": false
    }
  },
  {
    "strict": false,
    "type": "function",
    "name": "activityService_create",
    "description": "Crée une nouvelle activité avec les champs requis et optionnels du modèle ActivityModel.",
    "parameters": {
      "type": "object",
      "properties": {
        "name": { "type": "string", "description": "Nom de l'activité." },
        "description": { "type": "string", "description": "Description de l'activité." },
        "category": { "type": "string", "description": "Catégorie de l'activité (ex: 'presence')." },
        "categoryLabel": { "type": "string", "description": "Nom lisible de la catégorie." },
        "impact": {
          "type": "string",
          "enum": ["positive", "negative", "neutral"],
          "description": "Impact de l'activité sur l'équipe ou le membre."
        },
        "score": { "type": "integer", "description": "Nombre de points attribués (positif ou négatif)." },
        "missionUuid": { "type": "string", "description": "UUID de la mission associée." },
        
        "badgeUuid": { "type": "string", "description": "UUID du badge associé (optionnel)." },
        "autoConvertToBadge": { "type": "boolean", "description": "Convertir automatiquement en badge si seuil atteint." },
        "conversionThreshold": { "type": "integer", "description": "Score requis pour la conversion automatique." },
        "conversionWindow": {
          "type": "string",
          "enum": ["team", "member"],
          "description": "Fenêtre de conversion : par équipe ou membre."
        },
        "validityDuration": { "type": "integer", "description": "Durée de validité en ms." }
      },
      "required": [
        "name",
        "description",
        "category",
        "categoryLabel",
        "impact",
        "score",
        "missionUuid"
      ],
      "additionalProperties": false
    }
  },
  {
    "strict": false,
    "type": "function",
    "name": "activityService_update",
    "description": "Met à jour une activité existante. Nécessite son UUID et les champs à modifier.",
    "parameters": {
      "type": "object",
      "properties": {
        "item": {
          "type": "object",
          "description": "L'activité à mettre à jour, identifiée par son UUID.",
          "properties": {
            "uuid": { "type": "string", "description": "Identifiant unique de l'activité à modifier." }
          },
        },
        "data": {
          "type": "object",
          "description": "Champs à mettre à jour. Identiques à ceux du modèle ActivityModel.",
          "properties": {
            "name": { "type": "string" },
            "description": { "type": "string" },
            "category": { "type": "string" },
            "categoryLabel": { "type": "string" },
            "impact": { "type": "string", "enum": ["positive", "negative", "neutral"] },
            "score": { "type": "integer" },
            "missionUuid": { "type": "string" },
            "badgeUuid": { "type": "string" },
            "autoConvertToBadge": { "type": "boolean" },
            "conversionThreshold": { "type": "integer" },
            "conversionWindow": { "type": "string", "enum": ["team", "member"] },
            "validityDuration": { "type": "integer" }
          }
        }
      },
      "required": ["item", "data"],
      "additionalProperties": false
    }
  },
  {
    "strict": false,
    "type": "function",
    "name": "activityService_delete",
    "description": "Supprime une activité existante en utilisant son UUID.",
    "parameters": {
      "type": "object",
      "properties": {
        "item": {
          "type": "object",
          "description": "L'activité à supprimer, identifiée par son UUID.",
          "properties": {
            "uuid": { "type": "string", "description": "Identifiant unique de l'activité à supprimer." }
          }
        }
      },
      "required": ["item"],
      "additionalProperties": false
    }
  },
  {
    "strict": false,
    "type": "function",
    "name": "activityService_count",
    "description": "Retourne le nombre total d'activités.",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": [],
      "additionalProperties": false
    }
  },
]