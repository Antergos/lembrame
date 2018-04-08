const Gio = imports.gi.Gio;
const Lang = imports.lang;

const Util = imports.util;
const Task = imports.task.Task;

/**
 * Sync current enabled GTK Theme.
 * If GTK Theme comes from a pacman package, just save the package name.
 * If GTK Theme doesn't come from a pacman package, zip it and include it in the upload.
 * Check for GTK Themes in /usr/share/themes and ~/.themes
 *
 * @type {Lang.Class}
 */
const GtkThemeTask = new Lang.Class({
    Name: 'GtkThemeTask',
    Extends: Task,

    _init: function () {
        this.parent();

        this._schemaID = 'org.gnome.desktop.interface';
        this._schema = this._getSchema();

        this._userPath = this.userHome + '/.themes/';
        this._systemPath = '/usr/share/themes/';

        // Create folder in destination
        this._destFolder = this._createFolder('gtk-theme');

        this._getThemeName();
        this._sync();
    },

    _sync: function () {
        // Search in user home first
        if (Util.dirExists(this._userPath + this._themeName)) {
            log('GTK Theme lives in USER home. ZIP and Save user Theme.');
            this._saveUserTheme();
        } else if (Util.dirExists(this._systemPath + this._themeName)){
            log('GTK Theme lives in SYSTEM. Save which package installed it.');
            this._savePackage();
        } else {
            log("Can't find where GTK Theme lives");
        }
    },

    _getThemeName: function () {
        this._themeName = this._schema.get_string('gtk-theme');
    },

    _savePackage: function () {
        let name = '';
        let cmd = 'bash -c "export LANG=en_US; pacman -Qo ' + this._systemPath + this._themeName + ' 2>/dev/null | cut -f 5 -d \' \'"';
        let [res, out, err, status] = this._runCommand(cmd);

        if (status === 0) {
            name = out.toString().replace(/\n/gm, '');
            if (name !== '') {
                Util.writeToFile(name, this._destFolder + '/package');
                log('Saved GTK Theme package name. Moving on.');
            } else {
                log("Can't find a package for the current GTK Theme.");
            }
        } else {
            log('Error trying to get GTK Theme package name: ' + err);
        }
    },

    _saveUserTheme: function () {
        let name = '';
        let cmd = 'bash -c "tar czvf ' + this._destFolder + '/theme.tar.gz -C ' + this._userPath + ' ' + this._themeName + '"';
        let [res, out, err, status] = this._runCommand(cmd);

        if (status === 0) {
            log('User GTK Theme saved as ZIP');
        } else {
            log('Error trying to get GTK Theme package name: ' + err);
        }
    }
});
