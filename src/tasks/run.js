const Gio = imports.gi.Gio;
const Lang = imports.lang;

const Task = imports.task.Task;
const Util = imports.util;
const Upload = imports.upload.Upload;

// Import tasks
const BackgroundTask = imports.tasks.background.BackgroundTask;
const ScreensaverTask = imports.tasks.screensaver.ScreensaverTask;
const BashrcTask = imports.tasks.bashrc.BashrcTask;
const GnomeShellTask = imports.tasks.gnomeShell.GnomeShellTask;
const PacmanTask = imports.tasks.pacman.PacmanTask;


/**
 * Task manager run when user generates the code.
 * Creates the initial folder and manage to zip the result to send it to
 * the webservice
 *
 * @type {Lang.Class}
 */
const RunTask = new Lang.Class({
    Name: 'RunTask',
    Extends: Task,

    _init: function () {
        this.parent();

        this._settings = Util.getSettings(pkg.name);

        this._createInitialFolders();

        // TODO: read from config file, which tasks to run to clean up code
        // Copy .bashrc
        let bashrcTask = new BashrcTask();

        // Copy gnome-shell schema dump
        let gnomeShellTask = new GnomeShellTask();

        // Copy the list of apps installed
        let pacmanTask = new PacmanTask();

        // Copy desktop background
        let backgroundTask = new BackgroundTask();

        // Copy screensaver background
        let screensaverTask = new ScreensaverTask();

        this._zipFolder();
    },

    _createInitialFolders: function () {
        this._cleanup();

        // Load destination folder
        const destFolder = Gio.file_new_for_path(this.tmpFolder);

        log('Creating temporal directory now with its subdirectories');
        destFolder.make_directory_with_parents(null);
    },

    _zipFolder: function () {
        let cmd = 'bash -c "tar czf ' + this.cacheFolder + 'export.tar.gz -C ' + this.tmpFolder + ' ."';
        let [res, out, err, status] = this._runCommand(cmd);

        if (status === 0) {
            log('Files compressed. Moving on.');
            // Encrypt now
            this._encrypt();
        } else {
            log('Error compressing the files: ' + err);
        }
    },

    _encrypt: function () {
        let cmd = 'bash -c "lembrame-libnacl.py ' + this.cacheFolder + 'export.tar.gz ' + this.cacheFolder + 'export.tar.gz.encrypted"';
        let [res, out, err, status] = this._runCommand(cmd);

        if (status === 0 && err.toString() === '') {
            this._saveUniqueCode(out.toString().replace(/\n/gm, ''));
            log('Files encrypted. Prepared to upload.');

            // Upload now.
            this._upload();
        } else {
            log('Error encrypting the files: ' + err);
        }
    },

    _saveUniqueCode: function (uniqueCode) {
        // TODO: Commenting this line for developing purposes
        this._settings.set_string('code-generated', uniqueCode);
        log('Unique code saved: ' + uniqueCode);
    },

    _upload: function () {
    	let uploadResult = new Upload(this.cacheFolder + 'export.tar.gz.encrypted');
    },

    _cleanup: function () {
        // Load cache folder
        const cacheFolder = Gio.file_new_for_path(this.cacheFolder);

        // Remove the directory if already exists to clean up and create it blank
        if (cacheFolder.query_exists(null)) {
            log('Cleaning up.');
            cacheFolder.trash(null);
        }
    }
});
