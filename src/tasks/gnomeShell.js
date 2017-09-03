const Gio = imports.gi.Gio;
const Lang = imports.lang;

const Task = imports.task.Task;

/**
 * Copy Gnome Shell Schema (enabled-extensions, favorite-apps etc)
 *
 * I did this with dconf terminal command because I think is easier to
 * dump and load this way than reading the actual schema with Gio
 *
 * @type {Lang.Class}
 */
const GnomeShellTask = new Lang.Class({
    Name: 'GnomeShellTask',
    Extends: Task,

    _init: function () {
        this.parent();

        this.cmd = 'bash -c "dconf dump /org/gnome/shell/ > ' + this.tmpFolder + 'dconf_org_gnome_shell"';

        this._sync();
    },

    _sync: function () {
        let [res, out, err, status] = this._runCommand(this.cmd);

        if (status === 0) {
            log('Dumped org.gnome.shell schema. Moving on.');
        } else {
            log('Error trying to get Gnome Shell enabled extensions: ' + err);
        }
    }
});
