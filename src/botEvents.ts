export enum BotEvents {

  OnChatMessage = 'onChatMessage',
  OnCommand = 'onCommand',
	OnTriggerCredits = 'onTriggerCredits',
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
	OnSubGifted = 'twitch:subgifted',
	OnBlazor = 'twitch:blazor',

	/* Stream Events */
  OnStreamEnd = 'onStreamEnd',
  OnStreamStart = 'onStreamStart',

	/* Redemption Events */
	OnParty = 'onParty',

  RequestCreditRoll = 'requestCreditRoll'
}
