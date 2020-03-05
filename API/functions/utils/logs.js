const request = require('request');

//=======================================================================//
//     	LOGS functions                                                   //
//=======================================================================//

module.exports.initLogs = () => {
  const sendDiscordLog = (type, message) => {
    let msg = '';

    if (config.logs.discord === false) return;

    if (type == 'log') msg += ':loudspeaker: ';
    else if (type == 'info') msg += ':mega: ';
    else if (type == 'error') msg += ':x: ';
    else if (type == 'warn') msg += ':warning: ';

    request.post({
      url: config.logs.discordWebhook,
      json: {
        username: `Pinty API - Logs [${config.env}]`,
        avatar_url: `${config.server.websiteURL}/assets/images/pinty.jpg`,
        content: msg + '`' + message + '`',
      },
    });
  };

  global.__log = str => {
    sendDiscordLog('log', str);
    console.log(str);
    return str;
  };

  global.__logInfo = str => {
    sendDiscordLog('info', str);
    console.info(str);
    return str;
  };

  global.__logError = str => {
    sendDiscordLog('error', str);
    console.error(str);
    return str;
  };

  global.__logWarning = str => {
    sendDiscordLog('warn', str);
    console.warn(str);
    return str;
  };
};
