const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  MessageFlags,
} = require("discord.js");
const NftVerification = require("../schemas/nftVerification");
const { fetchOpenSeaAccount, countCollectionNfts } = require("./opensea");
const config = require("./yunarhVerifyConfig");
const { isDbReady } = require("./db");

const PANEL_FOOTER = "Yuna Verify Panel";
const BTN_BEGIN = "yuna_verify_begin";
const MODAL_SUBMIT = "yuna_verify_submit";

let verifyPanelMessageId = null;

function isVerifyChannel(guildId, channelId) {
  return (
    guildId === config.VERIFY_GUILD_ID &&
    channelId === config.VERIFY_CHANNEL_ID
  );
}

function isVerifyPanelMessage(message) {
  if (message.author?.id !== message.client?.user?.id) return false;
  const footer = message.embeds?.[0]?.footer?.text;
  return footer === PANEL_FOOTER || message.id === verifyPanelMessageId;
}

function parseOpenSeaUsername(content) {
  const text = (content || "").trim();
  if (!text) return null;

  const urlMatch = text.match(
    /opensea\.io\/(?:account\/)?([A-Za-z0-9_-]+)/i
  );
  if (urlMatch) return urlMatch[1];

  const token = text.split(/\s+/)[0].replace(/^@/, "");
  if (/^[A-Za-z0-9_-]{2,42}$/.test(token) && !token.startsWith("0x")) {
    return token;
  }
  return null;
}

function discordNameVariants(user, member) {
  const names = new Set();
  if (user.username) names.add(user.username.toLowerCase());
  if (user.globalName) names.add(user.globalName.toLowerCase());
  if (member?.displayName) names.add(member.displayName.toLowerCase());
  if (user.discriminator && user.discriminator !== "0") {
    names.add(`${user.username}#${user.discriminator}`.toLowerCase());
  }
  return [...names].filter(Boolean);
}

function normalizeBioText(text) {
  return (text || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function requiredBioPhrases(user, member) {
  return discordNameVariants(user, member).map(
    (name) => `verifying my account ${name} on discord`
  );
}

function formatBioExample(user, member) {
  const name = user.username || member?.displayName || "yourusername";
  return `Verifying my account ${name} on discord`;
}

function bioMatchesVerificationPhrase(bio, user, member) {
  const haystack = normalizeBioText(bio);
  if (!haystack) return false;
  return requiredBioPhrases(user, member).some((phrase) =>
    haystack.includes(phrase)
  );
}

function buildVerifyPanelEmbed() {
  return new EmbedBuilder()
    .setColor(0xfca8ff)
    .setTitle("Yuna holder verification")
    .setDescription(
      "Link your Discord to your OpenSea wallet and get the holder role if you own a Yuna NFT."
    )
    .addFields(
      {
        name: "Step 1 — OpenSea bio",
        value:
          "Set your [OpenSea profile](https://opensea.io/settings/profile) **bio** to exactly:\n" +
          "`Verifying my account <your Discord username> on discord`",
      },
      {
        name: "Step 2 — Verify",
        value: "Click **Verify** below and enter your OpenSea username.",
      },
      {
        name: "What we check",
        value:
          "• Bio matches that phrase with your Discord name\n" +
          "• Wallet linked to that OpenSea profile\n" +
          "• At least 1 [Yuna NFT](https://opensea.io/collection/yunarh) in that wallet",
      }
    )
    .setURL(config.OPENSEA_COLLECTION_URL)
    .setFooter({ text: PANEL_FOOTER });
}

function buildVerifyButton() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(BTN_BEGIN)
      .setLabel("Verify")
      .setStyle(ButtonStyle.Success)
  );
}

function buildOpenSeaModal() {
  return new ModalBuilder()
    .setCustomId(MODAL_SUBMIT)
    .setTitle("Yuna OpenSea verification")
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("opensea_username")
          .setLabel("OpenSea username")
          .setPlaceholder("hugh-jazz")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(64)
      )
    );
}

async function grantRole(guild, member, roleId, auditReason) {
  const role = guild.roles.cache.get(roleId);
  if (!role) {
    return { ok: false, reason: "ROLE_NOT_FOUND", roleId };
  }

  const me = guild.members.me;
  if (!me?.permissions.has("ManageRoles")) {
    return { ok: false, reason: "BOT_MISSING_MANAGE_ROLES" };
  }
  if (role.position >= me.roles.highest.position) {
    return { ok: false, reason: "ROLE_HIERARCHY", roleId };
  }

  if (member.roles.cache.has(roleId)) {
    return { ok: true, alreadyHad: true, roleId };
  }

  await member.roles.add(role, auditReason);
  return { ok: true, alreadyHad: false, roleId };
}

function roleErrorMessage(result) {
  const reasons = {
    HOLDER_ROLE_NOT_FOUND: "Holder role was not found on this server.",
    ROLE_NOT_FOUND: `Role \`${result?.roleId}\` was not found on this server.`,
    BOT_MISSING_MANAGE_ROLES: "I need the **Manage Roles** permission.",
    ROLE_HIERARCHY:
      "My highest role must be above the verification roles in Server Settings → Roles.",
  };
  return reasons[result?.reason] || "Could not assign role.";
}

async function runVerification({ guild, member, user, openseaUsername, reply }) {
  const send = (embed) => reply({ embeds: [embed] });

  const parsed = parseOpenSeaUsername(openseaUsername);
  if (!parsed) {
    return send(
      new EmbedBuilder()
        .setColor(0xe74c3c)
        .setDescription("Invalid OpenSea username.")
    );
  }

  if (isDbReady()) {
    const existingByUser = await NftVerification.findOne({
      userId: user.id,
    }).catch(() => null);
    if (
      existingByUser?.openseaUsername &&
      existingByUser.openseaUsername !== parsed.toLowerCase()
    ) {
      return send(
        new EmbedBuilder()
          .setColor(0xe74c3c)
          .setDescription(
            `This Discord account is already linked to OpenSea \`${existingByUser.openseaUsername}\`. Contact an admin to reset.`
          )
      );
    }

    const existingByOs = await NftVerification.findOne({
      openseaUsername: parsed.toLowerCase(),
    }).catch(() => null);
    if (existingByOs && existingByOs.userId !== user.id) {
      return send(
        new EmbedBuilder()
          .setColor(0xe74c3c)
          .setDescription(
            "That OpenSea profile is already linked to another Discord account."
          )
      );
    }
  }

  let account;
  try {
    account = await fetchOpenSeaAccount(parsed);
  } catch (error) {
    if (error.code === "MISSING_OPENSEA_KEY") {
      return send(
        new EmbedBuilder()
          .setColor(0xe74c3c)
          .setDescription(
            "OpenSea API key is not configured on the bot (`OPENSEA_API_KEY`)."
          )
      );
    }
    console.error("OpenSea account fetch error:", error);
    return send(
      new EmbedBuilder()
        .setColor(0xe74c3c)
        .setDescription(
          `Could not load OpenSea profile \`${parsed}\`: ${error.message || "Unknown error"}`
        )
    );
  }

  const wallet = (account.address || "").toLowerCase();
  if (wallet && isDbReady()) {
    const existingByWallet = await NftVerification.findOne({
      wallet,
    }).catch(() => null);
    if (existingByWallet && existingByWallet.userId !== user.id) {
      return send(
        new EmbedBuilder()
          .setColor(0xe74c3c)
          .setDescription(
            "That wallet is already linked to another Discord account."
          )
      );
    }
  }

  const bioText = account.bio ? String(account.bio) : "";
  if (!bioMatchesVerificationPhrase(bioText, user, member)) {
    const example = formatBioExample(user, member);
    const shownBio =
      bioText.trim().length > 0 ? `\`${bioText}\`` : "*empty in API*";
    return send(
      new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle("Bio check failed")
        .setDescription(
          `Your OpenSea **bio** must be exactly (with your Discord username):\n\`${example}\`\n\nProfile: https://opensea.io/${account.username || parsed}\nCurrent bio: ${shownBio}\n\nIf you just edited your bio, OpenSea can take **up to ~3 minutes** to update — then try again.\n\nUse your real OpenSea username in the form (e.g. \`hugh-jazz\`).`
        )
    );
  }

  let ownership;
  try {
    ownership = await countCollectionNfts(
      config.CHAIN,
      account.address,
      config.COLLECTION_SLUG,
      config.WHALE_HOLDER_MIN_NFTS
    );
  } catch (error) {
    console.error("OpenSea NFT check error:", error);
    return send(
      new EmbedBuilder()
        .setColor(0xe74c3c)
        .setDescription(
          `Could not check Yuna holdings: ${error.message || "Unknown error"}`
        )
    );
  }

  if (!ownership.owns) {
    return send(
      new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle("No Yuna found")
        .setDescription(
          `No **yunarh** NFTs found for \`${account.username || parsed}\` (\`${wallet}\`).\n\n${config.OPENSEA_COLLECTION_URL}`
        )
    );
  }

  const roleResult = await grantRole(
    guild,
    member,
    config.HOLDER_ROLE_ID,
    "Yuna OpenSea holder verification"
  );
  if (!roleResult.ok) {
    return send(
      new EmbedBuilder()
        .setColor(0xe74c3c)
        .setDescription(roleErrorMessage(roleResult))
    );
  }

  const qualifiesWhale =
    ownership.count >= config.WHALE_HOLDER_MIN_NFTS;
  let whaleRoleResult = null;
  if (qualifiesWhale) {
    whaleRoleResult = await grantRole(
      guild,
      member,
      config.WHALE_HOLDER_ROLE_ID,
      "Yuna 25+ holder verification"
    );
    if (!whaleRoleResult.ok) {
      return send(
        new EmbedBuilder()
          .setColor(0xe74c3c)
          .setDescription(
            `Holder role granted, but 25+ role failed: ${roleErrorMessage(whaleRoleResult)}`
          )
      );
    }
  }

  const countLabel = ownership.reachedStopAt
    ? `${config.WHALE_HOLDER_MIN_NFTS}+`
    : String(ownership.count);

  let dbSaved = true;
  if (isDbReady()) {
    await NftVerification.findOneAndUpdate(
      { userId: user.id },
      {
        userId: user.id,
        openseaUsername: (account.username || parsed).toLowerCase(),
        wallet,
        guildId: guild.id,
        verifiedAt: new Date(),
      },
      { upsert: true, new: true }
    ).catch((err) => {
      console.error("NftVerification save error:", err);
      dbSaved = false;
    });
  } else {
    dbSaved = false;
  }

  const dbNote = dbSaved
    ? ""
    : "\n\n_Note: verification link was not saved — database is offline._";

  const whaleNote = qualifiesWhale
    ? whaleRoleResult?.alreadyHad
      ? `\n25+ holder role confirmed (**${countLabel}** Yuna).`
      : `\n25+ holder role granted (**${countLabel}** Yuna).`
    : "";

  return send(
    new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle("Verified")
      .setDescription(
        (roleResult.alreadyHad
          ? `Already verified.\n**Discord** ↔ **EVM** \`${wallet}\`\nOpenSea: **${account.username || parsed}** (${countLabel} Yuna)`
          : `Linked **Discord** ↔ **EVM** \`${wallet}\` and granted the holder role.\nOpenSea: **${account.username || parsed}** (${countLabel} Yuna)`) +
        whaleNote +
        dbNote
      )
      .setURL(config.OPENSEA_COLLECTION_URL)
  );
}

async function ensureVerifyPanel(client, { forceNew = false } = {}) {
  const channel = await client.channels
    .fetch(config.VERIFY_CHANNEL_ID)
    .catch(() => null);
  if (!channel?.isTextBased()) {
    console.warn("Verify channel not found or not text-based");
    return;
  }

  if (!forceNew && verifyPanelMessageId) {
    const existing = await channel.messages
      .fetch(verifyPanelMessageId)
      .catch(() => null);
    if (existing) {
      await existing
        .edit({
          embeds: [buildVerifyPanelEmbed()],
          components: [buildVerifyButton()],
        })
        .catch(() => null);
      return existing;
    }
  }

  if (!forceNew) {
    const recent = await channel.messages.fetch({ limit: 25 }).catch(() => null);
    if (recent) {
      const found = recent.find(
        (m) => m.author.id === client.user.id && isVerifyPanelMessage(m)
      );
      if (found) {
        verifyPanelMessageId = found.id;
        await found
          .edit({
            embeds: [buildVerifyPanelEmbed()],
            components: [buildVerifyButton()],
          })
          .catch(() => null);
        return found;
      }
    }
  }

  const sent = await channel.send({
    embeds: [buildVerifyPanelEmbed()],
    components: [buildVerifyButton()],
  });
  verifyPanelMessageId = sent.id;
  return sent;
}

async function onVerifyInteraction(interaction) {
  if (interaction.isButton() && interaction.customId === BTN_BEGIN) {
    if (!isVerifyChannel(interaction.guildId, interaction.channelId)) {
      return interaction.reply({
        content: `Please verify in <#${config.VERIFY_CHANNEL_ID}>.`,
        flags: MessageFlags.Ephemeral,
      });
    }
    return interaction.showModal(buildOpenSeaModal());
  }

  if (interaction.isModalSubmit() && interaction.customId === MODAL_SUBMIT) {
    if (!isVerifyChannel(interaction.guildId, interaction.channelId)) {
      return interaction.reply({
        content: `Please verify in <#${config.VERIFY_CHANNEL_ID}>.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const raw = interaction.fields.getTextInputValue("opensea_username");
    const member =
      interaction.member ||
      (await interaction.guild.members
        .fetch(interaction.user.id)
        .catch(() => null));

    if (!member) {
      return interaction.editReply({
        content: "Could not resolve your server membership.",
      });
    }

    await runVerification({
      guild: interaction.guild,
      member,
      user: interaction.user,
      openseaUsername: raw,
      reply: (payload) => interaction.editReply(payload),
    });
  }
}

function buildHelpEmbed(user) {
  const example = formatBioExample(user, null);
  return new EmbedBuilder()
    .setColor(0xfca8ff)
    .setTitle("Yuna holder verification")
    .setDescription(
      `Use the verification panel in <#${config.VERIFY_CHANNEL_ID}>.\n\nOpenSea bio:\n\`${example}\``
    )
    .setURL(config.OPENSEA_COLLECTION_URL);
}

module.exports = {
  isVerifyChannel,
  ensureVerifyPanel,
  onVerifyInteraction,
  buildHelpEmbed,
};
