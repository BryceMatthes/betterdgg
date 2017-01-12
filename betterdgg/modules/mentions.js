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
                        console.error(e.data.response);
                        for (var k = messages.length-1; k > messages.length-4; k--) {
                            var mentionStamp = String(messages[k].date);
                            mentionStamp = mentionStamp.substring(0, mentionStamp.length - 3);
                            DoPush(messages[k].text, messages[k].nick, moment.unix(mentionStamp));
                        }
                        destiny.chat.gui.push(new ChatInfoMessage("polecat.me/mentions"));
                    } else if (e.data.type === 'bdgg_mentions_error') {
                        PushError(e.data.error);
                    }
                };

                window.addEventListener('message', listener);

                var fnHandleCommand = destiny.chat.handleCommand;

                destiny.chat.handleCommand = function(str) {
                    var match;
                    var sendstr = str.trim();
                    if (match = sendstr.match(/^m(?:entions)?(?:\s+(\w+))(?:\s+(\d+))?\s*$/))
                    {
                        var stalkArguments = {};

                        //if no number is specified, default to 3, otherwise take the number but cap it at 50
                        stalkArguments["userName"] = match[1];

                        //the content script will listen to this message and will be able to make the request to the log servers
                        //otherwise this is not easily possbile due to cross origin policy
                        window.postMessage({type: 'bdgg_mentions_request', data: stalkArguments}, '*');


                    } else if (sendstr.match(/^(m|entions)(\s.*?)?$/)) {
                        PushChat("Mentions Format: /mentions username");
                    } else {
                        fnHandleCommand.apply(this, arguments);
                    }
                };
            }
        };
    })();
}(window.BetterDGG = window.BetterDGG || {}));
