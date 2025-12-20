// Sound Manager for X1 Manager
// Centralizes all audio playback

// Assets from CommunityDragon (LoL Assets)
const SOUND_ASSETS = {
    // User confirmed Lock works (likely standard path)
    LOCK: "https://raw.communitydragon.org/15.24/plugins/rcp-fe-lol-champ-select/global/default/sounds/sfx-cs-lockin-button-click.ogg",
    // User reported others failed in 13.24, trying 15.24 standard + specific Ban fix
    HOVER: "https://raw.communitydragon.org/15.24/plugins/rcp-fe-lol-champ-select/global/default/sounds/sfx-cs-lockin-button-hover.ogg", // Updated per user
    CLICK: "https://raw.communitydragon.org/15.24/plugins/rcp-fe-lol-champ-select/global/default/sounds/sfx-cs-button-swap-click.ogg", // Updated per user
    BAN: "https://raw.communitydragon.org/15.24/plugins/rcp-fe-lol-champ-select/global/default/sounds/sfx-cs-draft-ban-button-click.ogg", // Updated per user
    DRAFT_COMPLETE: "https://raw.communitydragon.org/15.24/plugins/rcp-fe-lol-champ-select/global/default/sounds/music-cs-draft-finalization-01.ogg"  // Updated per user
};

let audioContext = null;
const audioCache = {};
let championIdMap = {};

// Initialize Audio Context (must be triggered by user interaction ideally, but we prep it)
const getAudioContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
};

// Preload critical sounds
export const initializeSounds = async () => {
    Object.keys(SOUND_ASSETS).forEach(key => {
        const audio = new Audio();
        audio.src = SOUND_ASSETS[key];
        audio.preload = "auto";
        audio.volume = 0.4;
        audioCache[key] = audio;
    });

    // Load champion data for voices
    try {
        const response = await fetch("https://ddragon.leagueoflegends.com/cdn/15.24.1/data/pt_BR/champion.json");
        const data = await response.json();
        Object.values(data.data).forEach(champ => {
            championIdMap[champ.name] = champ.key;
            championIdMap[champ.id] = champ.key;
            if (champ.id === "MonkeyKing") championIdMap["Wukong"] = champ.key;
        });
    } catch (e) {
        console.warn("Failed to load champion voice map", e);
    }
};

const playSound = (key, volume = 0.4) => {
    try {
        if (audioCache[key]) {
            const sound = audioCache[key].cloneNode();
            sound.volume = volume;
            sound.play().catch(() => { });
        }
    } catch (e) {
        // Ignore play errors (autoplay policy)
    }
};

export const playLockSound = () => playSound('LOCK', 0.5);
export const playBanSound = () => playSound('BAN', 0.4);
export const playHoverSound = () => playSound('HOVER', 0.25); // Increased from 0.1
export const playClickSound = () => playSound('CLICK', 0.4); // Increased from 0.3
export const playDraftCompleteSound = () => playSound('DRAFT_COMPLETE', 0.6);

export const playChampionVoice = (championName) => {
    try {
        const champId = championIdMap[championName];
        if (!champId) {
            playLockSound();
            return;
        }

        const voiceUrl = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/pt_br/v1/champion-choose-vo/${champId}.ogg`;
        const audio = new Audio(voiceUrl);
        audio.volume = 0.6;
        audio.play().catch(() => {
            // Fallback to English if BR voice missing
            const fallbackUrl = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-choose-vo/${champId}.ogg`;
            new Audio(fallbackUrl).play().catch(() => playLockSound());
        });
    } catch (e) {
        playLockSound();
    }
};

export default {
    initializeSounds,
    playLockSound,
    playBanSound,
    playHoverSound,
    playClickSound,
    playDraftCompleteSound,
    playChampionVoice
};
