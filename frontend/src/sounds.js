// Sound utility for X1 Manager
// Uses lazy loading to prevent lag

// UI Sound Effects - using reliable LoL champion select sounds
const UI_SOUNDS = {
    // Using champion select sounds that are known to exist
    hover: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/sounds/sfx-cs-timer-tick.ogg",
    click: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/sounds/sfx-cs-confirm-choice.ogg",
    lock: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/sounds/sfx-cs-lockin-button-click.ogg",
    ban: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/sounds/sfx-cs-draft-ban.ogg",
    reveal: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/sounds/sfx-cs-draft-pick.ogg",
    phase: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/sounds/sfx-cs-draft-turn-notification.ogg"
};

// Champion ID mapping (name -> id) for voice lookup
let championIdMap = {};

// Audio cache to prevent reloading
const audioCache = {};
let soundsLoaded = false;

// Preload common UI sounds
export const preloadUISounds = () => {
    if (soundsLoaded) return;

    Object.entries(UI_SOUNDS).forEach(([key, url]) => {
        const audio = new Audio();
        audio.preload = "auto";
        audio.src = url;
        audio.volume = 0.4;
        audio.load(); // Force load
        audioCache[key] = audio;
    });

    soundsLoaded = true;
    console.log("Sounds preloaded");
};

// Play a cached UI sound
export const playUISound = (soundName) => {
    try {
        if (audioCache[soundName]) {
            // Clone to allow overlapping sounds
            const sound = audioCache[soundName].cloneNode();
            sound.volume = 0.3;
            sound.play().catch(() => { }); // Ignore autoplay errors
        }
    } catch (e) {
        console.log("Sound error:", e);
    }
};

// Play hover sound (debounced)
let hoverDebounce = null;
export const playHoverSound = () => {
    if (hoverDebounce) return;
    hoverDebounce = setTimeout(() => { hoverDebounce = null; }, 50);
    playUISound("hover");
};

// Play click sound
export const playClickSound = () => {
    playUISound("click");
};

// Play lane ban sound
export const playBanSound = () => {
    playUISound("ban");
};

// Play lock-in sound
export const playLockSound = () => {
    playUISound("lock");
};

// Fetch champion data to get IDs
export const loadChampionIds = async () => {
    try {
        const response = await fetch("https://ddragon.leagueoflegends.com/cdn/13.24.1/data/pt_BR/champion.json");
        const data = await response.json();
        Object.values(data.data).forEach(champ => {
            championIdMap[champ.id] = champ.key; // id is name, key is numeric ID
        });
    } catch (e) {
        console.log("Could not load champion IDs:", e);
    }
};

// Play champion voice line on pick
export const playChampionVoice = (championName) => {
    try {
        const champId = championIdMap[championName];
        if (!champId) {
            console.log("Champion ID not found for:", championName);
            playUISound("reveal"); // Fallback to reveal sound
            return;
        }

        // Community Dragon champion pick voice URL
        // Format: sfx-cs-{champId}-pick.ogg (not always available)
        // Alternative: champion ban quote which is more reliable
        const voiceUrl = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/pt_br/v1/champion-choose-vo/${champId}.ogg`;

        const audio = new Audio(voiceUrl);
        audio.volume = 0.6;
        audio.play().catch(() => {
            // If Portuguese voice not available, try default
            const fallbackUrl = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-choose-vo/${champId}.ogg`;
            const fallback = new Audio(fallbackUrl);
            fallback.volume = 0.6;
            fallback.play().catch(() => {
                playUISound("reveal"); // Final fallback
            });
        });
    } catch (e) {
        console.log("Voice error:", e);
        playUISound("reveal");
    }
};

// Initialize sounds on app load
export const initializeSounds = () => {
    preloadUISounds();
    loadChampionIds();
};

export default {
    playUISound,
    playHoverSound,
    playClickSound,
    playBanSound,
    playLockSound,
    playChampionVoice,
    initializeSounds
};
