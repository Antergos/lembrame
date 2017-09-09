const Gio = imports.gi.Gio;
const Lang = imports.lang;

const Util = imports.util;
const Task = imports.task.Task;

/**
 * Sync current enabled Icons Theme.
 * If Icons Theme comes from a pacman package, just save the package name.
 * If Icons Theme doesn't come from a pacman package, zip it and include it in the upload.
 * Check for Icons Themes in /usr/share/icons and ~/.icons
 *
 * @type {Lang.Class}
 */
const IconsThemeTask = new Lang.Class({
    Name: 'IconsThemeTask',
    Extends: Task,

    _init: function () {
        this.parent();

        this._schemaID = 'org.gnome.desktop.interface';
        this._schema = this._getSchema();

        this._userPath = this.userHome + '/.icons/';
        this._systemPath = '/usr/share/icons/';

        // Create folder in destination
        this._destFolder = this._createFolder('icons-theme');

        this._getThemeName();
        this._sync();
    },

    _sync: function () {
        // Search in user home first
        if (Util.dirExists(this._userPath + this._themeName)) {
            log('Icons Theme lives in USER home. ZIP and Save user Theme.');
            this._saveUserTheme();
        } else if (Util.dirExists(this._systemPath + this._themeName)){
            log('Icons Theme lives in SYSTEM. Save which package installed it.');
            this._savePackage();
        } else {
            log("Can't find where Icons Theme lives");
        }
    },

    _getThemeName: function () {
        this._themeName = this._schema.get_string('icon-theme');
    },

    _savePackage: function () {
        let name = '';
        let cmd = 'bash -c "export LANG=en_US; pacman -Qo ' + this._systemPath + this._themeName + ' 2>/dev/null | cut -f 5 -d \' \'"';
        let [res, out, err, status] = this._runCommand(cmd);

        if (status === 0) {
            name = out.toString().replace(/\n/gm, '');
            if (name !== '') {
                Util.writeToFile(name, this._destFolder + '/package');
                log('Saved Icons Theme package name. Movin on.');
            } else {
                log("Can't find a package for the current Icons Theme.");
            }
        } else {
            log('Error trying to get Icons Theme package name: ' + err);
        }
    },

    _saveUserTheme: function () {
        let name = '';
        let cmd = 'bash -c "tar czvf ' + this._destFolder + '/theme.tar.gz -C ' + this._userPath + ' ' + this._themeName + '"';
        let [res, out, err, status] = this._runCommand(cmd);

        if (status === 0) {
            log('User Icons Theme saved as ZIP');
        } else {
            log('Error trying to get Icons Theme package name: ' + err);
        }
    }
});
