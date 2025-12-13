# Elo Hierarchy (Higher value = Higher Rank)
ELO_HIERARCHY = {
    "Ferro IV": 100, "Ferro III": 110, "Ferro II": 120, "Ferro I": 130,
    "Bronze IV": 200, "Bronze III": 210, "Bronze II": 220, "Bronze I": 230,
    "Prata IV": 300, "Prata III": 310, "Prata II": 320, "Prata I": 330,
    "Ouro IV": 400, "Ouro III": 410, "Ouro II": 420, "Ouro I": 430,
    "Platina IV": 500, "Platina III": 510, "Platina II": 520, "Platina I": 530,
    "Esmeralda IV": 600, "Esmeralda III": 610, "Esmeralda II": 620, "Esmeralda I": 630,
    "Diamante IV": 700, "Diamante III": 710, "Diamante II": 720, "Diamante I": 730,
    "Mestre": 800,
    "Grão-Mestre": 900,
    "Desafiante": 1000
}

# Lanes
LANES = ["Top", "Jungle", "Mid", "ADC", "Support"]

# Champion Lane Mapping (Season 14/15 Meta)
LANE_CHAMPIONS = {
    "Top": [
        "Aatrox", "Akali", "Ambessa", "Aurora", "Camille", "Cho'Gath", "Darius", "Dr. Mundo", "Fiora", "Gangplank", 
        "Garen", "Gnar", "Gragas", "Gwen", "Heimerdinger", "Illaoi", "Irelia", "Jax", "Jayce", "K'Sante", "Kayle", 
        "Kennen", "Kled", "Malphite", "Maokai", "Mel", "Mordekaiser", "Nasus", "Olaf", "Ornn", "Pantheon", "Poppy", 
        "Quinn", "Renekton", "Riven", "Rumble", "Sett", "Shen", "Singed", "Sion", "Tahm Kench", "Teemo", 
        "Tryndamere", "Urgot", "Vayne", "Volibear", "Warwick", "Wukong", "Yasuo", "Yone", "Yorick", "Zaahen"
    ],
    "Jungle": [
        "Amumu", "Bel'Veth", "Briar", "Diana", "Ekko", "Elise", "Evelynn", "Fiddlesticks", "Graves", "Hecarim", 
        "Ivern", "Jarvan IV", "Karthus", "Kayn", "Kha'Zix", "Kindred", "Lee Sin", "Lillia", "Master Yi", "Nidalee", 
        "Nocturne", "Nunu & Willump", "Rammus", "Rek'Sai", "Rengar", "Sejuani", "Shaco", "Shyvana", "Skarner", 
        "Taliyah", "Trundle", "Udyr", "Vi", "Viego", "Volibear", "Warwick", "Xin Zhao", "Zac", "Zed"
    ],
    "Mid": [
        "Ahri", "Akali", "Akshan", "Anivia", "Annie", "Aurelion Sol", "Aurora", "Azir", "Cassiopeia", "Corki", 
        "Diana", "Ekko", "Fizz", "Galio", "Hwei", "Irelia", "Jayce", "Kassadin", "Katarina", "LeBlanc", "Lissandra", 
        "Lux", "Malzahar", "Mel", "Naafiri", "Neeko", "Orianna", "Qiyana", "Ryze", "Smolder", "Sylas", "Syndra", 
        "Taliyah", "Talon", "Twisted Fate", "Veigar", "Vex", "Viktor", "Vladimir", "Xerath", "Yasuo", "Yone", 
        "Zed", "Ziggs", "Zoe"
    ],
    "ADC": [
        "Aphelios", "Ashe", "Caitlyn", "Draven", "Ezreal", "Jhin", "Jinx", "Kai'Sa", "Kalista", "Kog'Maw", 
        "Lucian", "Miss Fortune", "Nilah", "Samira", "Sivir", "Smolder", "Tristana", "Twitch", "Varus", "Vayne", 
        "Xayah", "Yunara", "Zeri", "Ziggs", "Seraphine", "Swain", "Yasuo"
    ],
    "Support": [
        "Alistar", "Bard", "Blitzcrank", "Brand", "Braum", "Janna", "Karma", "Leona", "Lulu", "Lux", 
        "Maokai", "Mel", "Milio", "Morgana", "Nami", "Nautilus", "Pyke", "Rakan", "Rell", "Renata Glasc", "Senna", 
        "Seraphine", "Sona", "Soraka", "Swain", "Tahm Kench", "Taric", "Thresh", "Vel'Koz", "Xerath", "Yuumi", 
        "Zilean", "Zyra", "Camille", "Poppy"
    ]
}
