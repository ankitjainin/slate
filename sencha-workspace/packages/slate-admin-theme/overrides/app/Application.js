Ext.define('SlateAdminTheme.override.app.Application', {
    override: 'Ext.app.Application',

    onBeforeLaunch: function() {
        Ext.setGlyphFontFamily('FontAwesome');
        this.callParent(arguments);
    }
});