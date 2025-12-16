import os

file_path = 'Teste de Campeões.txt'

lanes = ["TOP", "JUNGLE", "MID", "ADC", "SUP"]
champion_lists = {lane: [] for lane in lanes}

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Skip header
data_lines = lines[1:]

for line in data_lines:
    if not line.strip():
        continue
    
    # Split by tab since names can have spaces
    parts = line.strip().split('\t')
    
    # Clean up empty strings if any
    parts = [p for p in parts if p]
    
    if len(parts) < 6:
        continue
        
    name = parts[0]
    # Scores are effectively the last 5 elements if splitting by tab worked well
    # or specifically index 1 to 5
    
    try:
        # Helper to parse float with comma
        def parse_score(s):
            return float(s.replace(',', '.').strip())
            
        scores = [parse_score(parts[i]) for i in range(1, 6)]
        
        for i, score in enumerate(scores):
            if score > 68:
                champion_lists[lanes[i]].append((name, score))
                
    except ValueError:
        continue

# Sort and Write Dictionary to File
lane_mapping = {
    "TOP": "Top",
    "JUNGLE": "Jungle",
    "MID": "Mid",
    "ADC": "ADC",
    "SUP": "Support"
}

with open('champions_dict.py', 'w', encoding='utf-8') as outfile:
    outfile.write("LANE_CHAMPIONS = {\n")
    
    # Process lanes in specific order
    ordered_lanes = ["TOP", "JUNGLE", "MID", "ADC", "SUP"]
    
    for i, lane in enumerate(ordered_lanes):
        display_name = lane_mapping[lane]
        
        # Get names only, remove duplicates if any (though set logic implies unique per lane), sort alphabetically
        # The user's request implies alphabetical order in the list example provided
        champ_names = sorted([item[0] for item in champion_lists[lane]])
        
        # Formatting the list string
        # To match the style: multiline with indentation or single line if short?
        # The user's example has multiline. I'll format it nicely and wrap text at 100 chars approx.
        
        outfile.write(f'    "{display_name}": [\n')
        
        # Helper to maintain indentation and wrapping
        current_line = "        "
        for j, name in enumerate(champ_names):
            # Quotes around name
            entry = f'"{name}"'
            
            # Add comma if not last item
            if j < len(champ_names) - 1:
                entry += ", "
            
            if len(current_line) + len(entry) > 100:
                outfile.write(current_line + "\n")
                current_line = "        " + entry
            else:
                current_line += entry
        
        if current_line.strip():
             outfile.write(current_line + "\n")
             
        outfile.write("    ]")
        
        if i < len(ordered_lanes) - 1:
            outfile.write(",\n")
        else:
            outfile.write("\n")
            
    outfile.write("}\n")
