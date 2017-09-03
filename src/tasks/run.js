const Gio = imports.gi.Gio;
const Lang = imports.lang;

const Task = imports.task.Task;

// Import tasks
const BackgroundTask = imports.tasks.background.BackgroundTask;
const ScreensaverTask = imports.tasks.screensaver.ScreensaverTask;
const BashrcTask = imports.tasks.bashrc.BashrcTask;
const GnomeShellTask = imports.tasks.gnomeShell.GnomeShellTask;
const PacmanTask = imports.tasks.pacman.PacmanTask;

const RunTask = new Lang.Class({
	Name: 'RunTask',
	Extends: Task,

	_init: function() {
		this.parent();

		this._createInitialFolders();

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

	_createInitialFolders: function() {
  		// Load destination folder
    	const destFolder = Gio.file_new_for_path(this.tmpFolder);

		// Remove the directory if already exists to clean up and create it blank
    	if( destFolder.query_exists(null) ) {
    		log('Temporal Directory already exists, cleaning up...');
    		destFolder.trash(null);
    	}
    	log('Creating temporal directory now with its subdirectories');
    	destFolder.make_directory_with_parents(null);
	},

	_zipFolder: function() {
		let [res, out, err, status] = this._runCommand('bash -c "tar czf ' + this.cacheFolder + 'export.tar.gz -C ' + this.tmpFolder + ' ."');

        if(status === 0) {
            log('Files compressed. Prepared to upload.');
        } else {
            log('Error compressing the files: ' + err);
        }
	}
});
