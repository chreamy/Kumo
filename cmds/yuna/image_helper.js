const path = require('path');

function getLocalImagePath(traitType, traitName) {
    // Convert trait name to filename format (lowercase, spaces to underscores)
    const filename = traitName.toLowerCase().replace(/\s+/g, '_') + '.png';
    return path.join(__dirname, 'assets', traitType.toLowerCase(), filename);
}

function getTraitName(traits, category, id) {
    if (id === "matrix") return "Matrix";
    if (id === "orange") return "Orange";
    
    const traitCategory = traits.find(t => t.name === category);
    if (!traitCategory) return "None";
    
    return traitCategory.traits.find(t => t.id === id)?.name || "None";
}

module.exports = { getLocalImagePath, getTraitName };
