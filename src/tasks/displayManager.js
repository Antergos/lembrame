const Gio = imports.gi.Gio;
const Lang = imports.lang;

const Util = imports.util;
const Task = imports.task.Task;

/**
 * Extract the name of the currently used Display Manager.
 *
 * @type {Lang.Class}
 */
const DisplayManagerTask = new Lang.Class({
    Name: 'DisplayManagerTask',
    Extends: Task,

    _init: function () {
        this.parent();

        this._destFolder = this.tmpFolder;

        this._sync();
    },

    _sync: function () {
        this._detectDM();
        this._saveDM();
    },

    _detectDM: function () {
        let cmd = 'bash -c "cat /etc/systemd/system/display-manager.service | grep \"^ExecStart=\""';
        let [res, out, err, status] = this._runCommand(cmd);

        if (status === 0) {
            let cmdOutput = out.toString().replace(/\n/gm, '').split('/');
            if (cmdOutput.length > 0) {
                this.detectedDM = cmdOutput[cmdOutput.length-1]
                log(`Display manager detected: ${this.detectedDM}`);
            }
        } else {
            log('Error reading display manager service file: ' + err);
        }
    },

    _saveDM: function () {
        Util.writeToFile(this.detectedDM, this._destFolder + '/display_manager');
    },
});
