import fs from 'fs';
import path from 'path';
import { generateOpenApiSchema } from './schemas';

// Generate a simpler, valid OpenAPI specification
const generateValidOpenApiSpec = () => {
  return {
    "openapi": "3.0.3",
    "info": {
      "title": "ChatterRealm API",
      "description": "API for ChatterRealm - A multiplayer emoji-based game world",
      "version": "1.0.0"
    },
    "servers": [
      {
        "url": "http://localhost:3001/api/v1",
        "description": "Development server"
      },
      {
        "url": "https://api.chatterrealm.com/api/v1",
        "description": "Production server"
      }
    ],
    "paths": {
      "/world": {
        "get": {
          "tags": ["World"],
          "summary": "Get current game world state",
          "description": "Retrieves the complete game world including players, NPCs, and items",
          "responses": {
            "200": {
              "description": "Successful response",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/GameWorld"
                  }
                }
              }
            },
            "404": {
              "description": "World not found",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ApiError"
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ApiError"
                  }
                }
              }
            }
          }
        }
      },
      "/players": {
        "get": {
          "tags": ["Players"],
          "summary": "Get all players",
          "description": "Retrieves all active players in the game world",
          "responses": {
            "200": {
              "description": "Successful response",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/Player"
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ApiError"
                  }
                }
              }
            }
          }
        },
        "post": {
          "tags": ["Players"],
          "summary": "Create a new player",
          "description": "Creates a new player in the game world",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreatePlayerRequest"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Player created successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Player"
                  }
                }
              }
            },
            "400": {
              "description": "Invalid request data",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ApiError"
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ApiError"
                  }
                }
              }
            }
          }
        }
      },
      "/players/{playerId}": {
        "get": {
          "tags": ["Players"],
          "summary": "Get specific player",
          "description": "Retrieves a specific player by ID",
          "parameters": [
            {
              "name": "playerId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Successful response",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Player"
                  }
                }
              }
            },
            "404": {
              "description": "Player not found",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ApiError"
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ApiError"
                  }
                }
              }
            }
          }
        },
        "put": {
          "tags": ["Players"],
          "summary": "Update player",
          "description": "Updates an existing player",
          "parameters": [
            {
              "name": "playerId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdatePlayerRequest"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Player updated successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Player"
                  }
                }
              }
            },
            "400": {
              "description": "Invalid request data",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ApiError"
                  }
                }
              }
            },
            "404": {
              "description": "Player not found",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ApiError"
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ApiError"
                  }
                }
              }
            }
          }
        }
      },
      "/game/command": {
        "post": {
          "tags": ["Game"],
          "summary": "Execute game command",
          "description": "Executes a game command for a player",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/GameCommandRequest"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Command executed successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean"
                      },
                      "message": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid command",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ApiError"
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ApiError"
                  }
                }
              }
            }
          }
        }
      },
      "/ai-proxy": {
        "post": {
          "tags": ["AI"],
          "summary": "AI proxy service",
          "description": "Handles AI-related requests",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AIProxyRequest"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "AI response",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "response": {
                        "type": "string"
                      },
                      "model": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid request",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ApiError"
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ApiError"
                  }
                }
              }
            }
          }
        }
      },
      "/emoji": {
        "get": {
          "tags": ["Assets"],
          "summary": "Get emoji SVG",
          "description": "Retrieves an emoji as SVG",
          "parameters": [
            {
              "name": "char",
              "in": "query",
              "required": true,
              "schema": {
                "type": "string",
                "minLength": 1,
                "maxLength": 10
              }
            },
            {
              "name": "rough",
              "in": "query",
              "required": false,
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "roughness",
              "in": "query",
              "required": false,
              "schema": {
                "type": "number",
                "minimum": 0,
                "maximum": 10
              }
            },
            {
              "name": "bowing",
              "in": "query",
              "required": false,
              "schema": {
                "type": "number",
                "minimum": 0,
                "maximum": 10
              }
            }
          ],
          "responses": {
            "200": {
              "description": "SVG image",
              "content": {
                "image/svg+xml": {
                  "schema": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            },
            "400": {
              "description": "Invalid emoji request",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ApiError"
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ApiError"
                  }
                }
              }
            }
          }
        }
      }
    },
    "components": {
      "schemas": {
        "Vector2": {
          "type": "object",
          "properties": {
            "x": {
              "type": "number",
              "description": "X coordinate"
            },
            "y": {
              "type": "number",
              "description": "Y coordinate"
            }
          },
          "required": ["x", "y"]
        },
        "Color": {
          "type": "object",
          "properties": {
            "r": {
              "type": "number",
              "description": "Red component",
              "minimum": 0,
              "maximum": 255
            },
            "g": {
              "type": "number",
              "description": "Green component",
              "minimum": 0,
              "maximum": 255
            },
            "b": {
              "type": "number",
              "description": "Blue component",
              "minimum": 0,
              "maximum": 255
            },
            "a": {
              "type": "number",
              "description": "Alpha component",
              "minimum": 0,
              "maximum": 1
            }
          },
          "required": ["r", "g", "b"]
        },
        "Player": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "format": "uuid",
              "description": "Unique player identifier"
            },
            "name": {
              "type": "string",
              "minLength": 1,
              "maxLength": 32,
              "description": "Player name"
            },
            "emoji": {
              "type": "string",
              "minLength": 1,
              "maxLength": 4,
              "description": "Player emoji representation"
            },
            "position": {
              "$ref": "#/components/schemas/Vector2"
            },
            "color": {
              "$ref": "#/components/schemas/Color"
            },
            "class": {
              "type": "string",
              "enum": ["warrior", "mage", "rogue", "cleric", "ranger", "paladin", "druid", "bard"],
              "description": "Player character class"
            },
            "health": {
              "type": "number",
              "description": "Current health",
              "minimum": 0,
              "maximum": 100
            },
            "maxHealth": {
              "type": "number",
              "description": "Maximum health",
              "minimum": 1,
              "maximum": 200
            },
            "experience": {
              "type": "number",
              "description": "Experience points",
              "minimum": 0
            },
            "level": {
              "type": "number",
              "description": "Player level",
              "minimum": 1
            },
            "inventory": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "Player inventory items"
            },
            "statusEffects": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "Active status effects"
            },
            "lastActive": {
              "type": "string",
              "format": "date-time",
              "description": "Last activity timestamp"
            },
            "isHandDrawn": {
              "type": "boolean",
              "default": false,
              "description": "Use hand-drawn emoji"
            },
            "combatStyle": {
              "type": "string",
              "description": "Combat style preference"
            },
            "lootPreferences": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "Loot preferences"
            },
            "createdAt": {
              "type": "string",
              "format": "date-time",
              "description": "Player creation timestamp"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time",
              "description": "Last update timestamp"
            }
          },
          "required": ["id", "name", "emoji", "position", "color", "class", "health", "maxHealth", "experience", "level", "inventory", "statusEffects", "lastActive"]
        },
        "NPC": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "format": "uuid",
              "description": "Unique NPC identifier"
            },
            "name": {
              "type": "string",
              "minLength": 1,
              "maxLength": 64,
              "description": "NPC name"
            },
            "emoji": {
              "type": "string",
              "minLength": 1,
              "maxLength": 4,
              "description": "NPC emoji representation"
            },
            "position": {
              "$ref": "#/components/schemas/Vector2"
            },
            "type": {
              "type": "string",
              "minLength": 1,
              "description": "NPC type"
            },
            "health": {
              "type": "number",
              "description": "NPC health",
              "minimum": 0
            },
            "behavior": {
              "type": "string",
              "description": "NPC behavior pattern"
            },
            "dialogue": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "Available dialogue options"
            }
          },
          "required": ["id", "name", "emoji", "position", "type", "health", "behavior", "dialogue"]
        },
        "Item": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "format": "uuid",
              "description": "Unique item identifier"
            },
            "name": {
              "type": "string",
              "minLength": 1,
              "maxLength": 64,
              "description": "Item name"
            },
            "emoji": {
              "type": "string",
              "minLength": 1,
              "maxLength": 4,
              "description": "Item emoji representation"
            },
            "position": {
              "$ref": "#/components/schemas/Vector2"
            },
            "type": {
              "type": "string",
              "minLength": 1,
              "description": "Item type"
            },
            "value": {
              "type": "number",
              "description": "Item value",
              "minimum": 0
            },
            "rarity": {
              "type": "string",
              "description": "Item rarity"
            }
          },
          "required": ["id", "name", "emoji", "position", "type", "value", "rarity"]
        },
        "WorldState": {
          "type": "object",
          "properties": {
            "phase": {
              "type": "string",
              "enum": ["peace", "cataclysm", "recovery"],
              "description": "Current game phase"
            },
            "time": {
              "type": "number",
              "description": "Current world time",
              "minimum": 0
            },
            "cataclysmProgress": {
              "type": "number",
              "description": "Cataclysm progress percentage",
              "minimum": 0,
              "maximum": 100
            },
            "corruptionLevel": {
              "type": "number",
              "description": "World corruption level",
              "minimum": 0,
              "maximum": 1
            },
            "lastCataclysm": {
              "type": "string",
              "format": "date-time",
              "nullable": true,
              "description": "Last cataclysm timestamp"
            }
          },
          "required": ["phase", "time", "cataclysmProgress", "corruptionLevel", "lastCataclysm"]
        },
        "GameWorld": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "format": "uuid",
              "description": "World identifier"
            },
            "name": {
              "type": "string",
              "minLength": 1,
              "description": "World name"
            },
            "width": {
              "type": "number",
              "description": "World width",
              "minimum": 1
            },
            "height": {
              "type": "number",
              "description": "World height",
              "minimum": 1
            },
            "players": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/Player"
              },
              "description": "Active players"
            },
            "npcs": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/NPC"
              },
              "description": "Active NPCs"
            },
            "items": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/Item"
              },
              "description": "World items"
            },
            "state": {
              "$ref": "#/components/schemas/WorldState"
            },
            "createdAt": {
              "type": "string",
              "format": "date-time",
              "description": "World creation timestamp"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time",
              "description": "Last world update"
            }
          },
          "required": ["id", "name", "width", "height", "players", "npcs", "items", "state", "createdAt", "updatedAt"]
        },
        "Message": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "format": "uuid",
              "description": "Message identifier"
            },
            "sender": {
              "type": "string",
              "minLength": 1,
              "description": "Message sender"
            },
            "content": {
              "type": "string",
              "minLength": 1,
              "maxLength": 512,
              "description": "Message content"
            },
            "timestamp": {
              "type": "string",
              "format": "date-time",
              "description": "Message timestamp"
            },
            "emoji": {
              "type": "string",
              "minLength": 1,
              "maxLength": 4,
              "description": "Sender emoji"
            },
            "type": {
              "type": "string",
              "enum": ["chat", "system", "combat", "loot"],
              "description": "Message type"
            }
          },
          "required": ["id", "sender", "content", "timestamp"]
        },
        "ApiError": {
          "type": "object",
          "properties": {
            "error": {
              "type": "string",
              "description": "Error message"
            },
            "code": {
              "type": "string",
              "description": "Error code"
            },
            "details": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "Error details"
            }
          },
          "required": ["error"]
        },
        "CreatePlayerRequest": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "minLength": 1,
              "maxLength": 32,
              "description": "Player name"
            },
            "emoji": {
              "type": "string",
              "minLength": 1,
              "maxLength": 4,
              "description": "Player emoji"
            },
            "class": {
              "type": "string",
              "enum": ["warrior", "mage", "rogue", "cleric", "ranger", "paladin", "druid", "bard"],
              "description": "Character class"
            },
            "color": {
              "$ref": "#/components/schemas/Color"
            },
            "isHandDrawn": {
              "type": "boolean",
              "default": false,
              "description": "Use hand-drawn emoji"
            }
          },
          "required": ["name", "emoji", "class", "color"]
        },
        "UpdatePlayerRequest": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "format": "uuid",
              "description": "Player identifier"
            },
            "name": {
              "type": "string",
              "minLength": 1,
              "maxLength": 32,
              "description": "Player name"
            },
            "emoji": {
              "type": "string",
              "minLength": 1,
              "maxLength": 4,
              "description": "Player emoji"
            },
            "class": {
              "type": "string",
              "enum": ["warrior", "mage", "rogue", "cleric", "ranger", "paladin", "druid", "bard"],
              "description": "Character class"
            },
            "color": {
              "$ref": "#/components/schemas/Color"
            },
            "isHandDrawn": {
              "type": "boolean",
              "description": "Use hand-drawn emoji"
            }
          },
          "required": ["id"]
        },
        "GameCommandRequest": {
          "type": "object",
          "properties": {
            "playerId": {
              "type": "string",
              "format": "uuid",
              "description": "Player identifier"
            },
            "command": {
              "type": "string",
              "minLength": 1,
              "description": "Game command"
            },
            "args": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "Command arguments"
            }
          },
          "required": ["playerId", "command"]
        },
        "AIProxyRequest": {
          "type": "object",
          "properties": {
            "prompt": {
              "type": "string",
              "minLength": 1,
              "description": "AI prompt"
            },
            "context": {
              "type": "string",
              "description": "Additional context"
            },
            "model": {
              "type": "string",
              "description": "AI model"
            }
          },
          "required": ["prompt"]
        }
      }
    }
  };
};

const outputPath = path.join(__dirname, 'openapi.json');
fs.writeFileSync(outputPath, JSON.stringify(generateValidOpenApiSpec(), null, 2));

console.log('✅ OpenAPI specification generated successfully');
console.log(`📄 Saved to: ${outputPath}`);