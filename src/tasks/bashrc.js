const Gio = imports.gi.Gio;
const Lang = imports.lang;

const Task = imports.task.Task;

/**
 * Copy .bashrc located on the user home
 *
 * @type {Lang.Class}
 */
const BashrcTask = new Lang.Class({
    Name: 'BashrcTask',
    Extends: Task,

    _init: function () {
        this.parent();

        this._sync();
    },

    _sync: function () {
        Gio.file_new_for_path(this.userHome + '/.bashrc').copy(Gio.file_new_for_path(this.tmpFolder + '.bashrc'), 1, null, null);

        log('Copied .bashrc. Moving on.');
    }
});
