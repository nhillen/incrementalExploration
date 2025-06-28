$(function(){
    $('#statsIcon').on('click', function(){
        $('#statsPanel').toggleClass('open');
    });
    $('#settingsIcon').on('click', function(){
        $('#settingsPanel').toggleClass('open');
    });
    $('#drawerToggle').on('click', function(){
        $('#navDrawer').toggleClass('collapsed');
    });
});
