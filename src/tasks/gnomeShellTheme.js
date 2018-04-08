const Gio = imports.gi.Gio;
const Lang = imports.lang;

const Util = imports.util;
const Task = imports.task.Task;

/**
 * Sync current enabled Theme.
 * If Theme comes from a pacman package, just save the package name.
 * If Themes doesn't come from a pacman package, zip it and include it in the upload.
 * Check for themes in /usr/share/themes and ~/.themes
 *
 * @type {Lang.Class}
 */
const GnomeShellThemeTask = new Lang.Class({
    Name: 'GnomeShellThemeTask',
    Extends: Task,

    _init: function () {
        this.parent();

        this._schemaID = 'org.gnome.shell.extensions.user-theme';
        this._schema = this._getSchema();

        this._userPath = this.userHome + '/.themes/';
        this._systemPath = '/usr/share/themes/';

        // Create folder in destination
        this._destFolder = this._createFolder('gnome-shell-theme');

        this._getThemeName();

        if(this._themeName !== '') {
            this._sync();
        }
    },

    _sync: function () {
        // Search in user home first
        if (Util.dirExists(this._userPath + this._themeName)) {
            log('Theme lives in USER home. ZIP and Save user Theme.');
            this._saveUserTheme();
        } else if (Util.dirExists(this._systemPath + this._themeName)){
            log('Theme lives in SYSTEM. Save which package installed it.');
            this._savePackage();
        } else {
            log("Can't find where Theme lives");
        }
    },

    _getThemeName: function () {
        this._themeName = this._schema.get_string('name');
    },

    _savePackage: function () {
        let name = '';
        let cmd = 'bash -c "export LANG=en_US; pacman -Qo ' + this._systemPath + this._themeName + ' 2>/dev/null | cut -f 5 -d \' \'"';
        let [res, out, err, status] = this._runCommand(cmd);

        if (status === 0) {
            name = out.toString().replace(/\n/gm, '');
            if (name !== '') {
                Util.writeToFile(name, this._destFolder + '/package');
                log('Saved Theme package name. Moving on.');
            } else {
                log("Can't find a package for the current Theme.");
            }
        } else {
            log('Error trying to get Theme package name: ' + err);
        }
    },

    _saveUserTheme: function () {
        let name = '';
        let cmd = 'bash -c "tar czvf ' + this._destFolder + '/theme.tar.gz -C ' + this._userPath + ' ' + this._themeName + '"';
        let [res, out, err, status] = this._runCommand(cmd);

        if (status === 0) {
            log('User Theme saved as ZIP');
        } else {
            log('Error trying to get Theme package name: ' + err);
        }
    }
});
