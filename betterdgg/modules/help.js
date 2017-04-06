(function(bdgg) {
    bdgg.help = (function() {
        return {
            init: function() {
                // hook into help command
                var fnHandleCommand = destiny.chat.handleCommand;
                destiny.chat.handleCommand = function(str) {
                    fnHandleCommand.apply(this, arguments);
                    if (/^help ?/.test(str)) {
                        this.gui.push(new ChatInfoMessage("Better Better Destiny.gg: "
                            + "/stalk /mentions /strims /ps /unps /iu /uniu /iw /uniw /ps /unps /tag /untag. "+
                            "Additional information on commands can be found here: https://github.com/BryceMatthes/betterdgg/wiki"));
                    }
                };
            }
        };
    })();
}(window.BetterDGG = window.BetterDGG || {}));
