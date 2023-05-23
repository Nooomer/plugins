/**
 * @name Nekos
 * @author Nooomer
 * @authorId 441166966250536962
 * @version 1.3.0
 * @description Adds a slash command to send a neko GIF.
 * @source https://github.com/Nooomer/Plugins
 * @updateUrl https://raw.githubusercontent.com/Nooomer/Plugins/master/Nekos.plugin.js
 */
module.exports = (() => {
  const config = {
    info: {
      name: "Nekos",
      authors: [
        {
          name: "Nooomer",
          discord_id: "441166966250536962",
          github_username: "Nooomer",
        },
      ],
      version: "1.3.0",
      description: "Adds a slash command to send a random(or with emotions) neko GIF.",
      github: "https://github.com/Nooomer/Plugins",
      github_raw:
        "https://raw.githubusercontent.com/Nooomer/Plugins/master/Nekos.plugin.js",
    },
    changelog: [
      {
        title: "v0.0.1",
        items: ["Idea in mind"],
      },
      {
        title: "v0.0.5",
        items: ["Base Model"],
      },
      {
        title: "Initial Release v1.0.0",
        items: [
          "This is the initial release of the plugin :)",
          "I know why you want nekos (⊙x⊙;)",
        ],
      },
      {
        title: "v1.1.1",
        items: ["Corrected text."],
      },
      {
        title: "v1.3.0",
        items: ["Add emotions command."],
      },
      {
        title: "v1.3.1",
        items: ["Change random for first 5 pic"],
      },
    ],
    main: "Nekos.plugin.js",
  };
   const RequiredLibs = [{
    window: "ZeresPluginLibrary",
    filename: "0PluginLibrary.plugin.js",
    external: "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
    downloadUrl: "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js"
  },
  {
    window: "BunnyLib",
    filename: "1BunnyLib.plugin.js",
    external: "https://github.com/Tharki-God/BetterDiscordPlugins",
    downloadUrl: "https://tharki-god.github.io/BetterDiscordPlugins/1BunnyLib.plugin.js"
  },
  ];
  class handleMissingLibrarys {
    load() {
      for (const Lib of RequiredLibs.filter(lib =>  !window.hasOwnProperty(lib.window)))
        BdApi.showConfirmationModal(
          "Library Missing",
          `The library plugin (${Lib.window}) needed for ${config.info.name} is missing. Please click Download Now to install it.`,
          {
            confirmText: "Download Now",
            cancelText: "Cancel",
            onConfirm: () => this.downloadLib(Lib),
          }
        );
    }
    async downloadLib(Lib) {
      const fs = require("fs");
      const path = require("path");
      const { Plugins } = BdApi;
      const LibFetch = await fetch(
        Lib.downloadUrl
      );
      if (!LibFetch.ok) return this.errorDownloadLib(Lib);
      const LibContent = await LibFetch.text();
      try {
        await fs.writeFile(
          path.join(Plugins.folder, Lib.filename),
          LibContent,
          (err) => {
            if (err) return this.errorDownloadLib(Lib);
          }
        );
      } catch (err) {
        return this.errorDownloadLib(Lib);
      }
    }
    errorDownloadZLib(Lib) {
      const { shell } = require("electron");
      BdApi.showConfirmationModal(
        "Error Downloading",
        [
          `${Lib.window} download failed. Manually install plugin library from the link below.`,
        ],
        {
          confirmText: "Download",
          cancelText: "Cancel",
          onConfirm: () => {
            shell.openExternal(
              Lib.external
            );
          },
        }
      );
    }
    start() { }
    stop() { }
  }
  return RequiredLibs.some(m => !window.hasOwnProperty(m.window))
    ? handleMissingLibrarys
    : (([Plugin, ZLibrary]) => {
      const {
        PluginUpdater,
        Logger,
        DiscordModules: { MessageActions },
      } = ZLibrary;
      const { LibraryUtils, ApplicationCommandAPI } = BunnyLib.build(config);
      return class Nekos extends Plugin {
        checkForUpdates() {
          try {
            PluginUpdater.checkForUpdate(
              config.info.name,
              config.info.version,
              config.info.github_raw
            );
          } catch (err) {
            Logger.err("Plugin Updater could not be reached.", err);
          }
        }
        start() {
          this.checkForUpdates();
          this.addCommand();
        }
        addCommand() {
          ApplicationCommandAPI.register(config.info.name, {
            name: "nekos",
            displayName: "nekos",
            displayDescription: "Send a neko GIF.",
            description: "Send a neko GIF.",
            type: 1,
            target: 1,
            execute: async ([send, emotion], { channel }) => {
              try {
                let GIF;
                if(emotion == undefined){
                  GIF = await this.getGif(send.value, undefined);
                }
                else{
                  GIF = await this.getGif(send.value, emotion.value);
                }
                if (!GIF)
                  return MessageActions.receiveMessage(
                    channel.id,
                    LibraryUtils.FakeMessage(
                      channel.id,
                      "Failed to get any neko GIF."
                    )
                  );
                send.value
                  ? MessageActions.sendMessage(
                    channel.id,
                    {
                      content: GIF,
                      tts: false,
                      bottom: true,
                      invalidEmojis: [],
                      validNonShortcutEmojis: [],
                    },
                    undefined,
                    {}
                  )
                  : MessageActions.receiveMessage(
                    channel.id,
                    LibraryUtils.FakeMessage(channel.id, "", [GIF])
                  );
              } catch (err) {
                Logger.err(err);
                MessageActions.receiveMessage(
                  channel.id,
                  LibraryUtils.FakeMessage(
                    channel.id,
                    "Failed to get any neko GIF."
                  )
                );
              }
            },
            options: [
              {
                description: "Whether you want to send this or not.",
                displayDescription: "Whether you want to send this or not.",
                displayName: "Send",
                name: "Send",
                required: true,
                type: 5,
              },
              {
                description: "Emotion.",
                displayDescription: "Emotion.",
                displayName: "Emotion",
                name: "Emotion",
                required: false,
                type: 3,
              },
            ],
          });
        }
        async getGif(send, emotion) {
          console.log(emotion)
          let response;
          if(emotion == undefined){
            response = await fetch(
            `https://tenor.googleapis.com/v2/search?q=nekos&key=AIzaSyDy2fnAUloDkGFCC1IEtRkcqrFxAfLqB_Q&limit=50`
          );
          }
          else{
            response = await fetch(
              `https://tenor.googleapis.com/v2/search?q=nekos ${emotion}&key=AIzaSyDy2fnAUloDkGFCC1IEtRkcqrFxAfLqB_Q&limit=50`
          );
          }
          if (!response.ok){ 
            console.log(response)
            return};
          const data = await response.json();
          const GIF = Object.values(data.results)[LibraryUtils.randomNo(0, 50)];
          return send
            ? GIF.itemurl
            : {
              image: {
                url: GIF.media[0].gif.url,
                proxyURL: GIF.media[0].gif.url,
                width: GIF.media[0].gif.dims[0],
                height: GIF.media[0].gif.dims[1],
              },
            };
        }
        onStop() {
          ApplicationCommandAPI.unregister(config.info.name);
        }
      };
      })(ZLibrary.buildPlugin(config));
})();
/*@end@*/
