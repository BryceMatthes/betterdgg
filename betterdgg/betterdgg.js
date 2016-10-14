// Load settings module before everything else
window.BetterDGG.settings.init();

for (var module in window.BetterDGG) {
    if (module !== 'settings' && module !== 'backlog' && window.BetterDGG[module].init) {
        try {
            window.BetterDGG[module].init();
        }
        catch (e) {
            console.error(e);
        }
    }
}

// Load backlog module last
window.BetterDGG.backlog.init();


