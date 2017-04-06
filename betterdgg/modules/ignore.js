(function(bdgg) {
    bdgg.ignore = (function() {
        var style, cssBody, template;
        cssBody = '{display:none;}';
        template = '.user-msg[data-username="{}"]';

        var fnHandleCommand = destiny.chat.handleCommand;

        destiny.chat.handleCommand = function(str) {
            var match, sendstr, iuUpdate;
            sendstr = str.trim();
            var iuList = bdgg.settings.get('bdgg_user_ignore').split(',');
            if (iuList.length === 1 && iuList[0] === '') iuList = [];
            if (match = sendstr.match(/^(iu|ignoreuser)\s(\w+)/)) {
                iuList.push(match[2]);
                iuUpdate = iuList.join(',');
                bdgg.settings.put('bdgg_user_ignore', iuUpdate);
                destiny.chat.gui.push(new ChatInfoMessage('BBDGG ignore list updated: ' +iuList));        
            }
            else if (match = sendstr.match(/^(uniu|unignoreuser)\s(\w+)/)) {
                iuList.pop(match[2]);
                iuUpdate = iuList.join(',');
                bdgg.settings.put('bdgg_user_ignore', iuUpdate);
                destiny.chat.gui.push(new ChatInfoMessage('BBDGG ignore list updated: ' +iuList));        
            }
            else if (match = sendstr.match(/^(iu|ignoreuser)/)){

                if (iuList.length < 1)
                    destiny.chat.gui.push(new ChatInfoMessage('BBDGG ignore list empty.')); 
                else
                    destiny.chat.gui.push(new ChatInfoMessage('BBDGG ignored users: '+ iuList));

            } else {
                fnHandleCommand.apply(this, arguments);
            }
        };

        return {
            init: function() {
                bdgg.ignore.chatLines();
                style = document.createElement('style');
                style.type = 'text/css';
                document.head.appendChild(style);
                bdgg.settings.addObserver(function(key, val) {
                    if (key === 'bdgg_user_ignore') {
                        bdgg.ignore.update(val);
                        document.querySelector('#bdgg_user_ignore').value = val;
                    }
                });
                bdgg.ignore.update(bdgg.settings.get('bdgg_user_ignore'));
            },
            update: function(userList) {
                var res = '';
                if (userList.length) {
                    userList = userList.toLowerCase().split(' ').join('').split(',');
                }
                for (var i = 0; i < userList.length; i++)
                    res += template.replace('{}', userList[i]) + ',';
                res = res.substring(0, res.length - 1);
                if (style.styleSheet) {
                    style.styleSheet.cssText = res + cssBody;
                }
                else {
                    style.innerHTML = '';
                    style.appendChild(document.createTextNode(res + cssBody));
                }
            },

            chatLines: function() {

                var chatoptions = localStorage.getItem('chatoptions');
                if (chatoptions === null){
                    /**
                     * If the user never changed any destiny.gg settings, the options are null.
                     * Work around this by setting it to an empty JSON string which we can operate on.
                     */
                    chatoptions = "{}";
                }

                var setting = JSON.parse(chatoptions);
                if (setting.maxlines) {
                    if (setting.maxlines < 200) {
                        setting.maxlines = 600;
                        setting = JSON.stringify(setting);
                        localStorage.setItem('chatoptions', setting);
                    }
                }
                else {
                    setting.maxlines = 600;
                    setting = JSON.stringify(setting);
                    localStorage.setItem('chatoptions', setting);
                }
            }
        };
    })();
}(window.BetterDGG = window.BetterDGG || {}));
