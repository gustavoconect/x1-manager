// Sound utility for X1 Manager
// Uses lazy loading to prevent lag

// Lock sound URL (LoL Champion Select)
const LOCK_SOUND_URL = "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/sounds/sfx-cs-lockin-button-click.ogg";

// Champion ID mapping (name -> numeric id) for voice lookup
let championIdMap = {};

// Audio cache
const audioCache = {};
let audioContext = null;

// Get or create audio context for beep sounds
const getAudioContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
};

// Generate a beep sound using Web Audio API
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
        // Silently fail
    }
};

// Preload lock sound
const preloadLockSound = () => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = LOCK_SOUND_URL;
    audio.volume = 0.5;
    audio.load();
    audioCache.lock = audio;
};

// Play ban sound (low-pitched beep)
export const playBanSound = () => {
    playBeep(300, 0.2, 0.3);
};

// Play lock-in sound (from LoL)
export const playLockSound = () => {
    try {
        if (audioCache.lock) {
            const sound = audioCache.lock.cloneNode();
            sound.volume = 0.5;
            sound.play().catch(() => { });
        }
    } catch (e) {
        // Silently fail
    }
};

// Fetch champion data to get IDs for voice lookup
const loadChampionIds = async () => {
    try {
        const response = await fetch("https://ddragon.leagueoflegends.com/cdn/13.24.1/data/pt_BR/champion.json");
        const data = await response.json();
        Object.values(data.data).forEach(champ => {
            championIdMap[champ.id] = champ.key; // id is name, key is numeric ID
        });
    } catch (e) {
        // Silently fail - champion voices will fallback to lock sound
    }
};

// Play champion voice line on pick
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
            // Try English fallback
            const fallbackUrl = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-choose-vo/${champId}.ogg`;
            const fallback = new Audio(fallbackUrl);
            fallback.volume = 0.6;
            fallback.play().catch(() => playLockSound());
        });
    } catch (e) {
        playLockSound();
    }
};

// Initialize sounds on app load
export const initializeSounds = () => {
    preloadLockSound();
    loadChampionIds();
};

