const fs = require("fs").promises;
const path = require("path");
const traits = require("./genyuna").traits;
const combinedData = require("./combined_data.json");

// Calculate entropy for a probability distribution
function calculateEntropy(probabilities) {
    return -probabilities.reduce((sum, p) => {
        if (p === 0) return sum;
        return sum + p * Math.log2(p);
    }, 0);
}

// Calculate trait occurrences and probabilities
function calculateTraitProbabilities() {
    const occurrences = {
        Background: {},
        Body: {},
        Outfit: {},
        Accessories: {},
        Eyewear: {},
    };

    const totalNFTs = combinedData.length;

    // Count occurrences for each trait
    combinedData.forEach(([seed]) => {
        const normalizedSeed = seed % 154440;

        // Calculate trait seeds
        const bgSeed = normalizedSeed % (traits[0].traits.length + 2);
        const bodySeed =
            Math.floor(normalizedSeed / (traits[0].traits.length + 2)) %
            traits[1].traits.length;
        const outfitSeed =
            Math.floor(
                normalizedSeed /
                    ((traits[0].traits.length + 2) * traits[1].traits.length)
            ) % traits[2].traits.length;
        const accessoriesSeed =
            Math.floor(
                normalizedSeed /
                    ((traits[0].traits.length + 2) *
                        traits[1].traits.length *
                        traits[2].traits.length)
            ) %
            (traits[3].traits.length + 1);
        const eyewearSeed =
            Math.floor(
                normalizedSeed /
                    ((traits[0].traits.length + 2) *
                        traits[1].traits.length *
                        traits[2].traits.length *
                        (traits[3].traits.length + 1))
            ) %
            (traits[4].traits.length + 1);

        // Background
        const bgName =
            bgSeed === traits[0].traits.length
                ? "Matrix"
                : bgSeed === traits[0].traits.length + 1
                ? "Orange"
                : traits[0].traits[bgSeed].name;
        occurrences.Background[bgName] =
            (occurrences.Background[bgName] || 0) + 1;

        // Body
        const bodyName = traits[1].traits[bodySeed].name;
        occurrences.Body[bodyName] = (occurrences.Body[bodyName] || 0) + 1;

        // Outfit
        const outfitName = traits[2].traits[outfitSeed].name;
        occurrences.Outfit[outfitName] =
            (occurrences.Outfit[outfitName] || 0) + 1;

        // Accessories
        const accessoryName =
            accessoriesSeed < traits[3].traits.length
                ? traits[3].traits[accessoriesSeed].name
                : "None";
        occurrences.Accessories[accessoryName] =
            (occurrences.Accessories[accessoryName] || 0) + 1;

        // Eyewear
        const eyewearName =
            eyewearSeed < traits[4].traits.length
                ? traits[4].traits[eyewearSeed].name
                : "None";
        occurrences.Eyewear[eyewearName] =
            (occurrences.Eyewear[eyewearName] || 0) + 1;
    });

    // Convert occurrences to probabilities and calculate entropy
    const probabilities = {};
    const entropy = {};

    for (const category in occurrences) {
        probabilities[category] = {};
        const probs = [];

        for (const value in occurrences[category]) {
            const prob = occurrences[category][value] / totalNFTs;
            probabilities[category][value] = prob;
            probs.push(prob);
        }

        // Calculate entropy for this trait category
        entropy[category] = calculateEntropy(probs);
    }

    return { probabilities, entropy, occurrences, totalNFTs };
}

// Calculate OpenRarity score for a single Yuna
function calculateOpenRarityScore(seed, { probabilities, entropy, totalNFTs }) {
    const normalizedSeed = seed % 154440;

    // Calculate trait seeds
    const bgSeed = normalizedSeed % (traits[0].traits.length + 2);
    const bodySeed =
        Math.floor(normalizedSeed / (traits[0].traits.length + 2)) %
        traits[1].traits.length;
    const outfitSeed =
        Math.floor(
            normalizedSeed /
                ((traits[0].traits.length + 2) * traits[1].traits.length)
        ) % traits[2].traits.length;
    const accessoriesSeed =
        Math.floor(
            normalizedSeed /
                ((traits[0].traits.length + 2) *
                    traits[1].traits.length *
                    traits[2].traits.length)
        ) %
        (traits[3].traits.length + 1);
    const eyewearSeed =
        Math.floor(
            normalizedSeed /
                ((traits[0].traits.length + 2) *
                    traits[1].traits.length *
                    traits[2].traits.length *
                    (traits[3].traits.length + 1))
        ) %
        (traits[4].traits.length + 1);

    // Get trait names
    const bgName =
        bgSeed === traits[0].traits.length
            ? "Matrix"
            : bgSeed === traits[0].traits.length + 1
            ? "Orange"
            : traits[0].traits[bgSeed].name;
    const bodyName = traits[1].traits[bodySeed].name;
    const outfitName = traits[2].traits[outfitSeed].name;
    const accessoryName =
        accessoriesSeed < traits[3].traits.length
            ? traits[3].traits[accessoriesSeed].name
            : "None";
    const eyewearName =
        eyewearSeed < traits[4].traits.length
            ? traits[4].traits[eyewearSeed].name
            : "None";

    // Calculate individual trait scores using information entropy
    const traitScores = {
        Background: {
            name: bgName,
            probability: probabilities.Background[bgName],
            score:
                -Math.log2(probabilities.Background[bgName]) /
                entropy.Background,
        },
        Body: {
            name: bodyName,
            probability: probabilities.Body[bodyName],
            score: -Math.log2(probabilities.Body[bodyName]) / entropy.Body,
        },
        Outfit: {
            name: outfitName,
            probability: probabilities.Outfit[outfitName],
            score:
                -Math.log2(probabilities.Outfit[outfitName]) / entropy.Outfit,
        },
        Accessories: {
            name: accessoryName,
            probability: probabilities.Accessories[accessoryName],
            score:
                -Math.log2(probabilities.Accessories[accessoryName]) /
                entropy.Accessories,
        },
        Eyewear: {
            name: eyewearName,
            probability: probabilities.Eyewear[eyewearName],
            score:
                -Math.log2(probabilities.Eyewear[eyewearName]) /
                entropy.Eyewear,
        },
    };

    // Calculate final score as weighted sum of normalized trait scores
    const totalEntropy = Object.values(entropy).reduce((sum, e) => sum + e, 0);
    const score = Object.entries(traitScores).reduce(
        (sum, [category, info]) => {
            return sum + info.score * (entropy[category] / totalEntropy);
        },
        0
    );

    return {
        score,
        traits: traitScores,
    };
}

// Calculate ranks for all Yunas
function calculateAllRanks(scores) {
    // Sort by score (higher is rarer in OpenRarity)
    const sortedScores = [...scores].sort((a, b) => b.score - a.score);

    // Assign ranks (same score = same rank)
    let currentRank = 1;
    let prevScore = sortedScores[0].score;
    const ranks = new Array(scores.length);

    sortedScores.forEach((item, i) => {
        if (item.score !== prevScore) {
            currentRank = i + 1;
            prevScore = item.score;
        }
        ranks[item.index - 1] = {
            rank: currentRank,
            totalCount: scores.length,
        };
    });

    return ranks;
}

async function generateRarityCache() {
    console.log("Calculating trait probabilities...");
    const probabilityInfo = calculateTraitProbabilities();

    console.log("Calculating individual scores...");
    const scores = [];
    const rarityData = [];

    // Calculate scores for all Yunas
    combinedData.forEach(([seed], index) => {
        const rarityInfo = calculateOpenRarityScore(seed, probabilityInfo);
        scores.push({ index: index + 1, score: rarityInfo.score });
        rarityData.push({
            ...rarityInfo,
            seed,
        });
    });

    console.log("Calculating ranks...");
    const ranks = calculateAllRanks(scores);

    // Combine all data
    const finalData = rarityData.map((info, index) => ({
        ...info,
        rank: ranks[index].rank,
        totalCount: ranks[index].totalCount,
        percentile: (
            (ranks[index].rank / ranks[index].totalCount) *
            100
        ).toFixed(2),
    }));

    console.log("Writing cache file...");
    await fs.writeFile(
        path.join(__dirname, "rarity_cache.json"),
        JSON.stringify(finalData, null, 2)
    );

    console.log("Done! Cached rarity data for", finalData.length, "Yunas");
}

// Run the script
generateRarityCache().catch(console.error);
