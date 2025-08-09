export const activityAssignmentServiceContract = [
  {
    "strict": false,
    "type": "function",
    "name": "activityAssignmentService_list",
    "description": "Liste toutes les assignations d'activités avec pagination. Chaque assignation représente l'attribution d'une activité à un membre d'équipe ou une équipe entière, permettant le suivi des performances et du scoring.",
    "parameters": {
      "type": "object",
      "properties": {
        "limit": {
          "type": "integer",
          "description": "Nombre d'assignations à retourner (optionnel, défaut: 10).",
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
    "name": "activityAssignmentService_listBy",
    "description": "Liste les assignations d'activités avec filtres avancés. Essentiel pour tracker les performances par équipe, membre, activité ou statut de validation. Permet d'analyser les contributions individuelles et collectives.",
    "parameters": {
      "type": "object",
      "properties": {
        "conditions": {
          "type": "object",
          "description": "Filtres pour analyser les assignations selon différents critères de performance.",
          "properties": {
            "missionUuid": {
              "type": "string",
              "description": "UUID de la mission - filtre toutes les assignations d'une mission spécifique",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "activityUuid": {
              "type": "string",
              "description": "UUID de l'activité - voir qui a accompli cette activité spécifique",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "teamUuid": {
              "type": "string",
              "description": "UUID de l'équipe - analyser toutes les assignations d'une équipe",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "teamMemberUuid": {
              "type": "string",
              "description": "UUID du membre - voir l'historique personnel d'un participant",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "badgeUuid": {
              "type": "string",
              "description": "UUID du badge - tracker les assignations liées à un badge spécifique",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "issuedByUuid": {
              "type": "string",
              "description": "UUID de l'émetteur - voir qui a assigné quoi (organisateur/système)",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "validatedByUuid": {
              "type": "string",
              "description": "UUID du validateur - voir les assignations validées par un organisateur",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "status": {
              "type": "string",
              "enum": ["pending", "approved", "cancelled", "contested", "archived"],
              "description": "Statut de l'assignation: pending=en attente validation, approved=validé et comptabilisé, cancelled=annulé, contested=contesté par le participant, archived=archivé"
            },
            "origin": {
              "type": "string",
              "enum": ["system", "manual"],
              "description": "Origine de l'assignation: system=automatique (ex: présence), manual=assigné manuellement par un organisateur"
            },
            "activityCategory": {
              "type": "string",
              "description": "Catégorie d'activité (ex: 'presence', 'challenge', 'bonus') pour filtrer par type de contribution"
            }
          },
          "additionalProperties": false
        },
        "limit": {
          "type": "integer",
          "description": "Nombre d'assignations à retourner (optionnel, défaut: 10).",
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
    "name": "activityAssignmentService_findBy",
    "description": "Trouve une assignation d'activité unique. Utile pour consulter les détails d'une assignation spécifique, voir son statut, sa géolocalisation, et toutes les métadonnées associées.",
    "parameters": {
      "type": "object",
      "properties": {
        "conditions": {
          "type": "object",
          "description": "Filtres pour identifier l'assignation unique avec tous ses détails.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "Identifiant unique de l'assignation (prioritaire si fourni).",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "activityUuid": {
              "type": "string",
              "description": "UUID de l'activité assignée",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "teamMemberUuid": {
              "type": "string",
              "description": "UUID du membre d'équipe concerné",
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
    "name": "activityAssignmentService_assignToMember",
    "description": "Assigne une activité spécifique à un membre d'équipe individuel. Crée une assignation en statut 'pending' qui devra être validée. Utilisé pour récompenser ou pénaliser des actions individuelles.",
    "parameters": {
      "type": "object",
      "properties": {
        "assignment": {
          "type": "object",
          "description": "Détails de l'assignation individuelle à créer.",
          "properties": {
            "missionUuid": {
              "type": "string",
              "description": "UUID de la mission dans laquelle s'inscrit cette assignation.",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "activityUuid": {
              "type": "string",
              "description": "UUID de l'activité à assigner (définit le score et l'impact).",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "teamUuid": {
              "type": "string",
              "description": "UUID de l'équipe du membre concerné.",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "teamMemberUuid": {
              "type": "string",
              "description": "UUID du membre d'équipe qui reçoit l'assignation.",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "comment": {
              "type": ["string", "null"],
              "description": "Commentaire expliquant pourquoi cette activité est assignée (optionnel).",
              "maxLength": 1000
            },
            "origin": {
              "type": "string",
              "enum": ["system", "manual"],
              "description": "Origine de l'assignation (system=automatique, manual=par organisateur).",
              "default": "manual"
            }
          },
          "required": ["missionUuid", "activityUuid", "teamUuid", "teamMemberUuid"],
          "additionalProperties": false
        },
        "author": {
          "type": "object",
          "description": "Organisateur qui effectue cette assignation.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "UUID de l'organisateur émetteur",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            }
          },
          "required": ["uuid"],
          "additionalProperties": false
        }
      },
      "required": ["assignment", "author"],
      "additionalProperties": false
    }
  },
  {
    "strict": false,
    "type": "function",
    "name": "activityAssignmentService_assignToTeam",
    "description": "Assigne une activité à une équipe entière (tous les membres). Crée des assignations collectives, utile pour les activités de groupe, les bonus d'équipe ou les pénalités collectives.",
    "parameters": {
      "type": "object",
      "properties": {
        "assignment": {
          "type": "object",
          "description": "Détails de l'assignation collective à créer pour l'équipe.",
          "properties": {
            "missionUuid": {
              "type": "string",
              "description": "UUID de la mission dans laquelle s'inscrit cette assignation collective.",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "activityUuid": {
              "type": "string",
              "description": "UUID de l'activité à assigner à toute l'équipe.",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "teamUuid": {
              "type": "string",
              "description": "UUID de l'équipe qui reçoit l'assignation collective.",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "comment": {
              "type": ["string", "null"],
              "description": "Commentaire expliquant pourquoi cette activité est assignée à l'équipe (optionnel).",
              "maxLength": 1000
            },
            "origin": {
              "type": "string",
              "enum": ["system", "manual"],
              "description": "Origine de l'assignation (system=automatique, manual=par organisateur).",
              "default": "manual"
            }
          },
          "required": ["missionUuid", "activityUuid", "teamUuid"],
          "additionalProperties": false
        },
        "author": {
          "type": "object",
          "description": "Organisateur qui effectue cette assignation collective.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "UUID de l'organisateur émetteur",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            }
          },
          "required": ["uuid"],
          "additionalProperties": false
        }
      },
      "required": ["assignment", "author"],
      "additionalProperties": false
    }
  },
  {
    "strict": false,
    "type": "function",
    "name": "activityAssignmentService_validate",
    "description": "Valide une assignation en attente, la faisant passer du statut 'pending' à 'approved'. Une fois validée, l'assignation compte dans le score de l'équipe/membre et ne peut plus être modifiée facilement.",
    "parameters": {
      "type": "object",
      "properties": {
        "item": {
          "type": "object",
          "description": "L'assignation à valider, identifiée par son UUID.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "UUID de l'assignation à valider.",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            }
          },
          "required": ["uuid"],
          "additionalProperties": false
        },
        "author": {
          "type": "object",
          "description": "Organisateur qui valide cette assignation (doit avoir les droits appropriés).",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "UUID de l'organisateur validateur",
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
    "name": "activityAssignmentService_contest",
    "description": "Permet à un membre d'équipe de contester une assignation qui lui a été attribuée. Change le statut en 'contested' et nécessite une révision par un organisateur.",
    "parameters": {
      "type": "object",
      "properties": {
        "item": {
          "type": "object",
          "description": "L'assignation à contester, identifiée par son UUID.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "UUID de l'assignation à contester.",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            }
          },
          "required": ["uuid"],
          "additionalProperties": false
        },
        "author": {
          "type": "object",
          "description": "Membre d'équipe qui conteste cette assignation (doit être le membre concerné).",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "UUID du membre qui conteste",
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
    "name": "activityAssignmentService_cancel",
    "description": "Annule une assignation (statut 'cancelled'). Seul l'émetteur original peut annuler son assignation. Utile pour corriger des erreurs d'assignation.",
    "parameters": {
      "type": "object",
      "properties": {
        "item": {
          "type": "object",
          "description": "L'assignation à annuler, identifiée par son UUID.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "UUID de l'assignation à annuler.",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            }
          },
          "required": ["uuid"],
          "additionalProperties": false
        },
        "author": {
          "type": "object",
          "description": "Émetteur original de l'assignation (seul autorisé à l'annuler).",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "UUID de l'émetteur original",
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
    "name": "activityAssignmentService_update",
    "description": "Met à jour une assignation existante (métadonnées, commentaires, géolocalisation). Les champs critiques comme le statut doivent utiliser les méthodes spécialisées (validate, contest, cancel).",
    "parameters": {
      "type": "object",
      "properties": {
        "item": {
          "type": "object",
          "description": "L'assignation à mettre à jour, identifiée par son UUID.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "UUID de l'assignation à modifier.",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            }
          },
          "required": ["uuid"],
          "additionalProperties": false
        },
        "data": {
          "type": "object",
          "description": "Champs à mettre à jour (métadonnées, localisation, commentaires).",
          "properties": {
            "comment": {
              "type": ["string", "null"],
              "description": "Commentaire mis à jour sur l'assignation.",
              "maxLength": 1000
            },
            "locationCity": {
              "type": ["string", "null"],
              "description": "Ville où l'activité a été réalisée.",
              "maxLength": 100
            },
            "locationCountry": {
              "type": ["string", "null"],
              "description": "Pays où l'activité a été réalisée.",
              "maxLength": 100
            },
            "locationRegion": {
              "type": ["string", "null"],
              "description": "Région où l'activité a été réalisée.",
              "maxLength": 100
            },
            "locationLatitude": {
              "type": ["number", "null"],
              "description": "Latitude GPS de la réalisation.",
              "minimum": -90,
              "maximum": 90
            },
            "locationLongitude": {
              "type": ["number", "null"],
              "description": "Longitude GPS de la réalisation.",
              "minimum": -180,
              "maximum": 180
            },
            "locationTimezone": {
              "type": ["string", "null"],
              "description": "Fuseau horaire de la réalisation.",
              "maxLength": 50
            },
            "locationPostalCode": {
              "type": ["string", "null"],
              "description": "Code postal de la réalisation.",
              "maxLength": 20
            },
            "userAgent": {
              "type": ["string", "null"],
              "description": "User agent du navigateur utilisé.",
              "maxLength": 500
            },
            "device": {
              "type": ["string", "null"],
              "description": "Type d'appareil utilisé.",
              "maxLength": 100
            },
            "platform": {
              "type": ["string", "null"],
              "description": "Plateforme système utilisée.",
              "maxLength": 100
            }
          },
          "additionalProperties": false,
          "minProperties": 1
        },
        "author": {
          "type": "object",
          "description": "Utilisateur qui modifie l'assignation.",
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
    "name": "activityAssignmentService_delete",
    "description": "Supprime définitivement une assignation de la base de données. Action irréversible, à utiliser avec précaution. Préférer l'annulation dans la plupart des cas.",
    "parameters": {
      "type": "object",
      "properties": {
        "item": {
          "type": "object",
          "description": "L'assignation à supprimer définitivement.",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "UUID de l'assignation à supprimer.",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            }
          },
          "required": ["uuid"],
          "additionalProperties": false
        },
        "author": {
          "type": "object",
          "description": "Utilisateur qui supprime l'assignation (droits administrateur requis).",
          "properties": {
            "uuid": {
              "type": "string",
              "description": "UUID de l'administrateur",
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
    "name": "activityAssignmentService_statistics",
    "description": "Génère des statistiques complètes basées sur les assignations : scores par équipe, classements, compteurs d'activités/badges, présences. C'est le cœur du système de scoring et de leaderboard.",
    "parameters": {
      "type": "object",
      "properties": {
        "conditions": {
          "type": "object",
          "description": "Filtres optionnels pour calculer les statistiques sur un sous-ensemble d'assignations.",
          "properties": {
            "missionUuid": {
              "type": "string",
              "description": "UUID de la mission pour les statistiques spécifiques à cette mission",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "teamUuid": {
              "type": "string",
              "description": "UUID d'équipe pour les statistiques spécifiques à cette équipe",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "status": {
              "type": "string",
              "enum": ["pending", "approved", "cancelled", "contested", "archived"],
              "description": "Statut des assignations à inclure dans les statistiques (défaut: toutes)"
            },
            "activityCategory": {
              "type": "string",
              "description": "Catégorie d'activité pour des statistiques par type (ex: 'presence', 'challenge')"
            }
          },
          "additionalProperties": false
        }
      },
      "required": [],
      "additionalProperties": false
    }
  },
  {
    "strict": false,
    "type": "function",
    "name": "activityAssignmentService_count",
    "description": "Compte le nombre total d'assignations selon des critères optionnels. Utile pour des statistiques rapides et la pagination.",
    "parameters": {
      "type": "object",
      "properties": {
        "conditions": {
          "type": "object",
          "description": "Filtres optionnels pour compter seulement certaines assignations.",
          "properties": {
            "missionUuid": {
              "type": "string",
              "description": "Compter seulement les assignations de cette mission",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "teamUuid": {
              "type": "string",
              "description": "Compter seulement les assignations de cette équipe",
              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
            },
            "status": {
              "type": "string",
              "enum": ["pending", "approved", "cancelled", "contested", "archived"],
              "description": "Compter seulement les assignations avec ce statut"
            },
            "origin": {
              "type": "string",
              "enum": ["system", "manual"],
              "description": "Compter seulement les assignations de cette origine"
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