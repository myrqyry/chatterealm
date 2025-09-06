"use strict";
// Core Game Types for Chat Grid Chronicles
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = exports.Theme = exports.MovementStyle = exports.ItemRarity = exports.ItemType = exports.PlayerClass = exports.Buff = exports.TerrainType = void 0;
var TerrainType;
(function (TerrainType) {
    TerrainType["WATER"] = "water";
    TerrainType["OCEAN"] = "ocean";
    TerrainType["RIVER"] = "river";
    TerrainType["MOUNTAIN_PEAK"] = "mountain_peak";
    TerrainType["MOUNTAIN"] = "mountain";
    TerrainType["HILLS"] = "hills";
    TerrainType["SNOW"] = "snow";
    TerrainType["ICE"] = "ice";
    TerrainType["SNOWY_HILLS"] = "snowy_hills";
    TerrainType["DUNES"] = "dunes";
    TerrainType["OASIS"] = "oasis";
    TerrainType["SAND"] = "sand";
    TerrainType["DENSE_JUNGLE"] = "dense_jungle";
    TerrainType["JUNGLE"] = "jungle";
    TerrainType["DEEP_WATER"] = "deep_water";
    TerrainType["MARSH"] = "marsh";
    TerrainType["SWAMP"] = "swamp";
    TerrainType["DENSE_FOREST"] = "dense_forest";
    TerrainType["FOREST"] = "forest";
    TerrainType["CLEARING"] = "clearing";
    TerrainType["ROLLING_HILLS"] = "rolling_hills";
    TerrainType["FLOWER_FIELD"] = "flower_field";
    TerrainType["GRASSLAND"] = "grassland";
    TerrainType["ROUGH_TERRAIN"] = "rough_terrain";
    TerrainType["ANCIENT_RUINS"] = "ancient_ruins";
    TerrainType["PLAIN"] = "plain";
})(TerrainType || (exports.TerrainType = TerrainType = {}));
var Buff;
(function (Buff) {
    Buff["HealthRegen"] = "HealthRegen";
    Buff["ManaRegen"] = "ManaRegen";
    Buff["DamageBoost"] = "DamageBoost";
    Buff["SpeedBoost"] = "SpeedBoost";
})(Buff || (exports.Buff = Buff = {}));
var PlayerClass;
(function (PlayerClass) {
    PlayerClass["KNIGHT"] = "knight";
    PlayerClass["ROGUE"] = "rogue";
    PlayerClass["MAGE"] = "mage";
})(PlayerClass || (exports.PlayerClass = PlayerClass = {}));
var ItemType;
(function (ItemType) {
    ItemType["WEAPON"] = "weapon";
    ItemType["ARMOR"] = "armor";
    ItemType["UTILITY"] = "utility";
    ItemType["CONSUMABLE"] = "consumable";
})(ItemType || (exports.ItemType = ItemType = {}));
var ItemRarity;
(function (ItemRarity) {
    ItemRarity["COMMON"] = "common";
    ItemRarity["UNCOMMON"] = "uncommon";
    ItemRarity["RARE"] = "rare";
    ItemRarity["EPIC"] = "epic";
    ItemRarity["LEGENDARY"] = "legendary";
})(ItemRarity || (exports.ItemRarity = ItemRarity = {}));
var MovementStyle;
(function (MovementStyle) {
    MovementStyle["GRID"] = "grid";
    MovementStyle["FREE"] = "free";
    MovementStyle["HYBRID"] = "hybrid";
})(MovementStyle || (exports.MovementStyle = MovementStyle = {}));
var Theme;
(function (Theme) {
    Theme["DARK"] = "dark";
    Theme["LIGHT"] = "light";
    Theme["AUTO"] = "auto";
})(Theme || (exports.Theme = Theme = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["DESKTOP"] = "desktop";
    NotificationType["SOUND"] = "sound";
    NotificationType["INGAME"] = "ingame";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
