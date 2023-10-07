import { ApplicationCommandOptionType, MessageFlags, type CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashOption } from 'discordx';

const docsDomain = 'https://docs.immich.app/docs';

const linkCommands: Record<string, string> = {
  'reverse proxy': `${docsDomain}/administration/reverse-proxy`,
  database: `${docsDomain}/guides/database-queries`,
  upgrade: `${docsDomain}/install/docker-compose#step-4---upgrading`,
  libraries: `${docsDomain}/features/libraries`,
  sidecar: `${docsDomain}/features/xmp-sidecars`,
  docker: `${docsDomain}/guides/docker-help`,
  backup: `${docsDomain}/administration/backup-and-restore`,
  github: 'https://github.com/immich-app/immich',
  cli: `${docsDomain}/features/bulk-upload`,
};
const helpTexts: Record<string, string> = {
  'help ticket':
    'Please open a <#1049703391762321418> ticket with more information and we can help you troubleshoot the issue.',
  'reverse proxy': `This sounds like it could be a reverse proxy issue. Here's a link to the relevant documentation page: ${docsDomain}/administration/reverse-proxy.`,
  'feature request':
    "For ideas or features you'd like Immich to have, feel free to [open a feature request in the Github discussions](https://github.com/immich-app/immich/discussions/new?category=feature-request). However, please make sure to search for similar requests first to avoid duplicates. ",
};

const _star_history: Record<string, number | undefined> = {};
const _fork_history: Record<string, number | undefined> = {};

@Discord()
export class Commands {
  @Slash({ description: 'Links to Immich pages' })
  link(
    @SlashChoice(...Object.keys(linkCommands))
    @SlashOption({
      description: 'Which docs do you need?',
      name: 'type',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    name: string,
    @SlashOption({
      description: 'Text that will be prepended before the link',
      name: 'text',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    message: string | null,
    interaction: CommandInteraction,
  ): void {
    interaction.reply({
      content: message ? `${message}: ${linkCommands[name]}` : linkCommands[name],
      flags: [MessageFlags.SuppressEmbeds],
    });
  }

  @Slash({ description: 'Text blocks for reoccurring questions' })
  messages(
    @SlashChoice(...Object.keys(helpTexts))
    @SlashOption({
      description: 'Which message do you need',
      name: 'type',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    name: string,
    interaction: CommandInteraction,
  ) {
    interaction.reply({
      content: helpTexts[name],
      flags: [MessageFlags.SuppressEmbeds],
    });
  }

  @Slash({ description: 'Immich stars' })
  async stars(interaction: CommandInteraction) {
    const lastStarsCount = _star_history[interaction.channelId];

    try {
      const response = await (await fetch('https://api.github.com/repos/immich-app/immich')).json();
      const starsCount = response['stargazers_count'] as number;
      const delta = lastStarsCount && starsCount - lastStarsCount;
      const formattedDelta = delta && Intl.NumberFormat(undefined, { signDisplay: 'always' }).format(delta);

      interaction.reply(
        `Stars ⭐: ${response['stargazers_count']}${
          formattedDelta ? ` (${formattedDelta} stars since the last call in this channel)` : ''
        }`,
      );

      _star_history[interaction.channelId] = starsCount;
    } catch (error) {
      interaction.reply("Couldn't fetch stars count from github api");
    }
  }

  @Slash({ description: 'Immich forks' })
  async forks(interaction: CommandInteraction) {
    const lastForksCount = _fork_history[interaction.channelId];

    try {
      const response = await (await fetch('https://api.github.com/repos/immich-app/immich')).json();
      const forksCount = response['forks_count'] as number;
      const delta = lastForksCount && forksCount - lastForksCount;
      const formattedDelta = delta && Intl.NumberFormat(undefined, { signDisplay: 'always' }).format(delta);

      interaction.reply(
        `Forks: ${response['forks_count']}${
          formattedDelta ? ` (${formattedDelta} forks since the last call in this channel)` : ''
        }`,
      );

      _fork_history[interaction.channelId] = forksCount;
    } catch (error) {
      interaction.reply("Couldn't fetch forks count from github api");
    }
  }
}
