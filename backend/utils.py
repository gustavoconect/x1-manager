import requests

def get_latest_version():
    """Fetch the latest Data Dragon version."""
    try:
        url = "https://ddragon.leagueoflegends.com/api/versions.json"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()[0]
    except Exception as e:
        print(f"Erro ao buscar versão do Data Dragon: {e}")
        return "13.24.1" # Fallback version

def get_champions_data(version):
    """Fetch champion data for the specific version."""
    try:
        url = f"https://ddragon.leagueoflegends.com/cdn/{version}/data/en_US/champion.json"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()["data"]
    except Exception as e:
        print(f"Erro ao buscar dados dos campeões: {e}")
        return {}

def get_champion_id_by_name(champion_name, champions_data):
    """Find the Data Dragon ID (e.g., 'MonkeyKing') for a given name (e.g., 'Wukong')."""
    if champion_name in champions_data:
        return champion_name
    for champ_id, data in champions_data.items():
        if data["name"] == champion_name:
            return champ_id
    for champ_id, data in champions_data.items():
        if data["name"].lower() == champion_name.lower():
            return champ_id
    return champion_name

def get_champion_image_url(champion_name, version, champions_data):
    champ_id = get_champion_id_by_name(champion_name, champions_data)
    return f"https://ddragon.leagueoflegends.com/cdn/{version}/img/champion/{champ_id}.png"
