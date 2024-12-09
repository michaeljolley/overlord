export enum BotEvents {

  OnChatMessage = 'onChatMessage',
  OnCommand = 'onCommand',
  OnCreditRoll = 'onCreditRoll',
  OnJoin = 'onJoin',
  OnPart = 'onPart',
  OnPointRedemption = 'onPointRedemption',

	/* Audio Events */
	OnAudioControl = 'stream:audio',
  OnSoundEffect = 'onSoundEffect',
  OnStop = 'onStop',

  OnSay = 'onSay',
	OnStreamMode = "onStreamMode",

  /* Announcement Events */
  LoadAnnouncements = "onLoadAnnouncements",
  Announcement = "onAnnouncement",

	/* Twitch Events */
  OnCheer = 'twitch:cheer',
	OnDonation = 'twitch:donation',
  OnFollow = 'twitch:follow',
	OnGiftSub = 'twitch:giftsub',
  OnRaid = 'twitch:raid',
  OnSub = 'twitch:sub',

	/* Stream Events */
  OnStreamEnd = 'onStreamEnd',
  OnStreamStart = 'onStreamStart',

	/* ToDo Events */
	OnTodoUpdated = 'onTodoUpdated',

	/* Redemption Events */
	OnParty = 'onParty',

  RequestCreditRoll = 'requestCreditRoll'
}
