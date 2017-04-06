(function(bdgg) {
    bdgg.filter = (function() {
        var _filterRe;
        var fnHandleCommand = destiny.chat.handleCommand;

        destiny.chat.handleCommand = function(str) {
            var match, sendstr, iwUpdate;
            sendstr = str.trim();
            var iwList = bdgg.settings.get('bdgg_filter_words').split(',');
            if (iwList.length === 1 && iwList[0] === '') iwList = [];
            if (match = sendstr.match(/^(iw|filter)\s(\w+)/)) {
                iwList.push(match[2]);
                iwUpdate = iwList.join(',');
                bdgg.settings.put('bdgg_filter_words', iwUpdate);
                destiny.chat.gui.push(new ChatInfoMessage('Now filtering: ' +iwList));        
            }
            else if (match = sendstr.match(/^(uniw|unfilter)\s(\w+)/)) {
                iwList.pop(match[2]);
                iwUpdate = iwList.join(',');
                bdgg.settings.put('bdgg_filter_words', iwUpdate);
                destiny.chat.gui.push(new ChatInfoMessage('Now filtering: ' +iwList));        
            }
            else if (match = sendstr.match(/^(iw|filter)/)){

                if (iwList.length < 1)
                    destiny.chat.gui.push(new ChatInfoMessage('Filtered/Ignored words list empty.'));
                else
                    destiny.chat.gui.push(new ChatInfoMessage('Filtered/Ignored words: '+ iwList));

            } else {
                fnHandleCommand.apply(this, arguments);
            }
        };

        function _filterWords(value) {
            var words = value.split(',')
                .map(function(val) {
                    return val.trim().replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
                })
                .reduce(function(prev, curr) {
                    if (curr.length > 0) {
                        prev.push(curr);
                    }
                    return prev;
                }, []);

            if (words.length > 0) {
                _filterRe = new RegExp("(?:^|\\b|\\s)(?:" + words.join("|") + ")(?:$|\\b|\\s)", "i");
            } else {
                _filterRe = null;
            }
        }

        return {
            init: function() {
                _filterWords(bdgg.settings.get('bdgg_filter_words'));
                bdgg.settings.addObserver(function(key, value) {
                    if (key === 'bdgg_filter_words') {
                        _filterWords(value);
                        document.querySelector('#bdgg_filter_words').value = value;
                    }
                });

                var fnGuiPush = destiny.chat.gui.push;
                destiny.chat.gui.push = function(msg) {
                    if (_filterRe !== null && msg instanceof ChatUserMessage) {
                        if (_filterRe.test(msg.message)) {
                            return;
                        }
                    }

                    return fnGuiPush.apply(this, arguments);
                };
            }
        };
    })();
}(window.BetterDGG = window.BetterDGG || {}));
