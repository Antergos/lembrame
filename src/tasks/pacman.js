const Gio = imports.gi.Gio;
const Lang = imports.lang;

const Task = imports.task.Task;

/**
 * Dump explicitly installed packages.
 *
 * I don't see a way of saving just the packages with appdata information in a way
 * that Cnchi knows which package name has to install.
 *
 * @type {Lang.Class}
 */
const PacmanTask = new Lang.Class({
    Name: 'PacmanTask',
    Extends: Task,

    _init: function () {
        this.parent();

        this._sync();
    },

    _sync: function () {
        // We're going to need both the installed packages and the pacman config because user could have custom repos
        this._savePackageList();
        this._saveAURPackageList();
        this._savePacmanConfig();
    },

    _savePackageList: function () {
        let cmd = 'bash -c "/usr/bin/pacman -Qqttn > ' + this.tmpFolder + 'pacman_package_list"';
        let [res, out, err, status] = this._runCommand(cmd);

        if (status === 0) {
            log('Dumped the list of explicitly installed packages from pacman. Moving on.');
        } else {
            log('Error trying to dump the explicitly installed packages from pacman: ' + err);
        }
    },

    _saveAURPackageList: function () {
        let cmd = 'bash -c "/usr/bin/pacman -Qqm > ' + this.tmpFolder + 'aur_package_list"';
        let [res, out, err, status] = this._runCommand(cmd);

        if (status === 0) {
            log('Dumped the list of AUR installed packages. Moving on.');
        } else {
            log('Error trying to dump the AUR installed packages: ' + err);
        }
    },

    _savePacmanConfig: function () {
        this._getConfigFile().copy(Gio.file_new_for_path(this.tmpFolder + 'pacman.conf'), 1, null, null);

        log('Copied Pacman Config. Moving on.');
    },

    _getConfigFile: function () {
        let configPath = '/etc/pacman.conf';
        return Gio.file_new_for_path(configPath);
    },
});
