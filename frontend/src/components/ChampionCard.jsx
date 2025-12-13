import React from 'react';
import { motion } from 'framer-motion';

const ChampionCard = ({ name, image, onClick, isSelected, isBanned }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 ${isSelected ? 'border-blue-500 shadow-[0_0_20px_rgba(33,150,243,0.5)]' :
                isBanned ? 'border-red-500 grayscale opacity-60' :
                    'border-transparent hover:border-primary hover:shadow-[0_10px_20px_rgba(0,0,0,0.5)]'
                }`}
            onClick={onClick}
        >
            <div className="aspect-[3/4] overflow-hidden bg-gray-800">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/-1.png";
                        // Or a nice placeholder
                        e.target.style.filter = "grayscale(100%)";
                    }}
                />
            </div>
            <div className="absolute bottom-0 w-full bg-black/80 backdrop-blur-sm p-2 text-center">
                <span className="font-bold text-gray-200 text-sm">{name}</span>
            </div>
        </motion.div>
    );
};

export default ChampionCard;
