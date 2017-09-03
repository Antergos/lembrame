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

        this.cmd = 'bash -c "/usr/bin/pacman -Qe | cut -f 1 -d \' \' > ' + this.tmpFolder + 'pacman_package_list"';

        this._sync();
    },

    _sync: function () {
        let [res, out, err, status] = this._runCommand(this.cmd);

        if (status === 0) {
            log('Dumped the list of explicitly installed packages from pacman. Moving on.');
        } else {
            log('Error trying to dump the explicitly installed packages from pacman: ' + err);
        }
    }
});
