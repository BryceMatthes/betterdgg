(function(bdgg) {
    bdgg.mentions = (function() {
        function BDGGChatStalkMessage(message, user, timestamp) {
            ChatUserMessage.call(this, message, user, timestamp);
            this.timestampformat = 'YYYY MMM DD HH:mm:ss';
        }

        function PushChat(string) {
            destiny.chat.gui.push(new ChatInfoMessage(string));
        }

        function PushError(string) {
            destiny.chat.gui.push(new ChatErrorMessage(string));
        }

        function DoPush(msg, nick, time) {
            var user = destiny.chat.users[nick];
            if (!user) {
                user = new ChatUser({ nick: nick });
            }

            destiny.chat.gui.push(new BDGGChatStalkMessage(msg, user, time));
        }
        return {
            init: function() {

                BDGGChatStalkMessage.prototype = Object.create(ChatUserMessage.prototype);
                BDGGChatStalkMessage.prototype.constructor = BDGGChatStalkMessage;

                BDGGChatStalkMessage.prototype.wrap = function(html, css) {
                    var elem = $(ChatUserMessage.prototype.wrap.call(this, html, css));
                    elem.addClass('bdgg-stalk-msg');
                    return elem[0].outerHTML;
                };

                BDGGChatStalkMessage.prototype.addonHtml = function() {
                    return this.html();
                };

                var gui = window.destiny.chat.gui;
                var messageCount = 3;

                gui.lines.on('mousedown', 'div.user-msg a.user', function() {
                    if (bdgg.settings.get('bdgg_highlight_selected_mentions')) {
                        var username = $(this).text();
                        gui.lines.find(':contains(' + username + ')').addClass('focused');
                    }

                    return false;
                });
        
                var listener = function(e) {
                    if (window !== e.source) {
                        return;
                    }

                    if (e.data.type === 'bdgg_mentions_reply') {
                        var messages = e.data.response;
                        var mentionStamp;
                        if (messages.length){
                            if (messages.length-messageCount < 0)
                                messageCount = messages.length;
                            for (var i = messages.length-messageCount; i < messages.length; i++) {
                                mentionStamp = String(messages[i].date);
                                mentionStamp = mentionStamp.substring(0, mentionStamp.length - 3);
                                DoPush(messages[i].text, messages[i].nick, moment.unix(mentionStamp));
                            }
                            PushChat("polecat.me/mentions");
                        }
                        else
                            PushChat("No mentions DaFeels polecat.me/mentions");
                    } else if (e.data.type === 'bdgg_mentions_error') {
                        PushError(e.data.error);
                    }
                };

                window.addEventListener('message', listener);

                var fnHandleCommand = destiny.chat.handleCommand;

                destiny.chat.handleCommand = function(str) {
                    var match;
                    var mentionsArguments = {};
                    var sendstr = str.trim();
                    if (match = sendstr.match(/^m(?:entions)?(?:\s+(\w+))(?:\s+(\d+))?\s*$/)) {

                        mentionsArguments = {};

                        //if the user types '/mentions #' it will instead use the first argument as a count on their username.
                        if (Number(match[1])){
                            mentionsArguments = {};
                            mentionsArguments["userName"] = destiny.chat.user.username;
                            messageCount = Math.min(Number(match[1]) || 3, 50);
                            mentionsArguments["size"] = messageCount;   
                        } else {
                            mentionsArguments["userName"] = match[1];

                            //if no number is specified, default to 3, otherwise take the number but cap it at 50
                            messageCount = Math.min(Number(match[2]) || 3, 50);
                            mentionsArguments["size"] = messageCount;
                        }
                        
                        //the content script will listen to this message and will be able to make the request to the mentions servers
                        //otherwise this is not easily possbile due to cross origin policy
                        window.postMessage({type: 'bdgg_mentions_request', data: mentionsArguments}, '*');

                    } else if (sendstr.match(/^(mentions)/)) {
                        mentionsArguments = {};
                        messageCount = 3;
                        mentionsArguments["userName"] = destiny.chat.user.username;
                        mentionsArguments["size"] = messageCount;
                        window.postMessage({type: 'bdgg_mentions_request', data: mentionsArguments}, '*');
                    } else {
                        fnHandleCommand.apply(this, arguments);
                    }
                };
            }
        };
    })();
}(window.BetterDGG = window.BetterDGG || {}));
