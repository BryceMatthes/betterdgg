(function(bdgg) {
    bdgg.mentions = (function() {
        return {
            init: function() {
                var gui = window.destiny.chat.gui;

                gui.lines.on('mousedown', 'div.user-msg a.user', function() {
                    if (bdgg.settings.get('bdgg_highlight_selected_mentions')) {
                        var username = $(this).text();
                        var users = [$(this).parents().parents().find(".chat-user:contains(" + username + ")")];
                        for (var i = 0; i < $(users)[0].length - 1; i++) {
                            window.destiny.chat.gui.stylesheet.insertRule('.user-msg[data-username="' + ($($(users)[0].parent().parent()[i]).find(".user").text().toLowerCase()) + '"]{opacity:1 !important;}', window.destiny.chat.gui.stylesheet.cssRules.length);
                            window.destiny.chat.gui.focusedUsers.push(($($(users)[0].parent().parent()[i]).find(".user").text().toLowerCase()));
                        }
                    }
                    return false;
                });
            }
        };
    })();
}(window.BetterDGG = window.BetterDGG || {}));
