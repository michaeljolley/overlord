# Chat Service

The chat service is runs as a Node.js app in a Docker container. It is
responsible for:

- Monitoring Twitch chat and dispatching commands to appropriate chat functions
- Sending messages via Twitch chat

## Environment Variables

| Variable             | Description                                           |
| -------------------- | ----------------------------------------------------- |
| TWITCHCLIENTID       | Twitch API Client Id. Found at https://dev.twitch.tv/ |
| TWITCHCLIENTTOKEN    | OAuth token for the Twitch channel (not the bot)      |
| TWITCHCLIENTUSERNAME | Twitch channel login                                  |
| TWITCHCLIENTUSERID   | Twitch's unique identifier for the channel login      |
| TWITCHBOTUSERNAME    | Twitch bot login                                      |
| TWITCHBOTTOKEN       | OAuth token for the Twitch account used as a bot      |

## Release Notes

See [CHANGELOG.md](../CHANGELOG.md)

## Contributing

Want to contribute? Check out our [Code of Conduct](../.github/CODE_OF_CONDUCT.md) and [Contributing](../.github/CONTRIBUTING.md) docs. Contributions of any kind welcome!
