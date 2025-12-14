// Sound utility for X1 Manager
// Uses lazy loading to prevent lag

// Lock sound URL (this one works!)
const LOCK_SOUND_URL = "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/sounds/sfx-cs-lockin-button-click.ogg";

// Champion ID mapping (name -> id) for voice lookup
let championIdMap = {};

// Audio cache
const audioCache = {};
let audioContext = null;

// Get or create audio context
const getAudioContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
};

// Generate a simple beep sound using Web Audio API
const playBeep = (frequency = 800, duration = 0.1, volume = 0.3) => {
    try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
        console.log("Audio error:", e);
    }
};

// Preload lock sound
export const preloadUISounds = () => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = LOCK_SOUND_URL;
    audio.volume = 0.5;
    audio.load();
    audioCache.lock = audio;
    console.log("Lock sound preloaded");
};

// Play click sound (generated beep)
export const playClickSound = () => {
    playBeep(1000, 0.08, 0.2); // High-pitched short click
};

// Play ban sound (generated beep)
export const playBanSound = () => {
    playBeep(300, 0.2, 0.3); // Low-pitched ban sound
};

// Play lock-in sound (from Community Dragon - works!)
export const playLockSound = () => {
    try {
        if (audioCache.lock) {
            const sound = audioCache.lock.cloneNode();
            sound.volume = 0.5;
            sound.play().catch(() => { });
        }
    } catch (e) {
        console.log("Lock sound error:", e);
    }
};

// Play hover sound (debounced)
let hoverDebounce = null;
export const playHoverSound = () => {
    if (hoverDebounce) return;
    hoverDebounce = setTimeout(() => { hoverDebounce = null; }, 50);
    playBeep(1200, 0.03, 0.1); // Subtle beep for hover
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
            playLockSound(); // Fallback
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
                playLockSound(); // Final fallback
            });
        });
    } catch (e) {
        console.log("Voice error:", e);
        playLockSound();
    }
};

// Initialize sounds on app load
export const initializeSounds = () => {
    preloadUISounds();
    loadChampionIds();
};

export default {
    playHoverSound,
    playClickSound,
    playBanSound,
    playLockSound,
    playChampionVoice,
    initializeSounds
};
