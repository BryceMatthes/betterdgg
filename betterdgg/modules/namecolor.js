(function(bdgg) {
    bdgg.namecolor = (function() {
        var CSS, Commands;
        var pushChat, pushError, updateNameColor, deleteNameColor, getNameColor;

        pushChat = function(string) {
            destiny.chat.gui.push(new ChatInfoMessage(string));
        };
        pushError = function(string) {
            destiny.chat.gui.push(new ChatErrorMessage(string));
        };
        updateNameColor = function(name, color) {
            var nameColor = bdgg.settings.get('bdgg_name_color');
            var jNameColor = JSON.parse(nameColor);
            jNameColor[name] = color;
            bdgg.settings.put('bdgg_name_color', JSON.stringify(jNameColor));
        };
        deleteNameColor = function(name) {
            var nameColor = bdgg.settings.get('bdgg_name_color');
            var jNameColor = JSON.parse(nameColor);
            delete jNameColor[name];
            bdgg.settings.put('bdgg_name_color', JSON.stringify(jNameColor));
        };
        getNameColor = function() {
            var nameColor = bdgg.settings.get('bdgg_name_color');
            return JSON.parse(nameColor);
        };

        CSS = {
            colorTemplate: '{ color: {}; }',
            userTemplate: '.user-msg[data-username="{}"]>.user',
            style: undefined,
            init: function() {
                this.style = document.createElement('style');
                this.style.type = 'text/css';
                window.document.head.appendChild(this.style);
                bdgg.settings.addObserver(function(key) {
                    if (key === 'bdgg_name_color') CSS.tagUpdate();
                });
                CSS.tagUpdate();
            },
            tagUpdate: function() {
                var nameColorKeys = [];
                var jNameColor = getNameColor();
                var res = '';
                for(var k in jNameColor) nameColorKeys.push(k);
                document.querySelector('#bdgg_name_color').value = JSON.stringify(jNameColor);
                for (var i = 0; i < nameColorKeys.length; i++) {
                    res += this.userTemplate.replace('{}', nameColorKeys[i]) + this.colorTemplate.replace('{}', jNameColor[nameColorKeys[i]]);
                }
                if (this.style.styleSheet)
                    this.style.styleSheet.cssText = res;
                else {
                    this.style.innerHTML = '';
                    this.style.appendChild(document.createTextNode(res));
                }
                pushChat('Your taglist has been updated');
            }
        };

        Commands = {
            fnHandleCommand: undefined,
            init: function() {
                Commands.injectTag();
            },
            injectTag: function() {
                this.fnHandleCommand = destiny.chat.handleCommand;
                destiny.chat.handleCommand = function(string) {
                    var match,jNameColor;
                    string = string.trim();
                    if (match = string.match(/^(tag)\s(\S+)\s(\S+)/)) {
                        Commands.tagUpdate(match[2].toLowerCase(), match[3].toLowerCase());
                    } else if (match = string.match(/^(untag)\s(\S+)$/)) {
                        if (match[2].toLowerCase() in getNameColor())
                            deleteNameColor(match[2].toLowerCase());
                        else
                            pushError('User: '+match[2]+' was not found in tag JSON.');
                    } else if (match = string.match(/^tag\s(\w+)$/)) {
                        jNameColor = getNameColor();
                        if (match[1].toLowerCase() in jNameColor)
                            pushChat('User '+match[1]+' is tagged with: '+jNameColor[match[1].toLowerCase()]);
                        else
                            pushChat('User '+match[1]+' is not tagged. Use /tag username color');
                    } else if (match = string.match(/^tag$/)) {
                        var nameColorKeys = [];
                        jNameColor = getNameColor();
                        for(var k in jNameColor) nameColorKeys.push(k);
                        pushChat('Tagged uers: '+nameColorKeys.toString());
                    } else {
                        Commands.fnHandleCommand.apply(this, arguments);
                    }
                };
            },
            tagUpdate: function(user, color) {
                updateNameColor(user, color);
            }
        };

        return {
            init: function() {
                Commands.init();
                CSS.init();
            }
        };
    })();
}(window.BetterDGG = window.BetterDGG || {}));
