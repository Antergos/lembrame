const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Lang = imports.lang;

const Task = new Lang.Class({
	Name: 'Task',

	_init: function() {
		// Configure used folder path's to be used
		this.userHome = GLib.get_home_dir();
		this.cacheFolder = this.userHome + '/.cache/Lembrame/';
		this.tmpFolder = this.cacheFolder + 'tmp/';
	},

	_createFolder: function(folderName) {
		const folder = Gio.file_new_for_path(this.tmpFolder + folderName);
		folder.make_directory_with_parents(null);
	},

	_getSchema: function() {
		return Gio.Settings.new(this._schemaID);
	},

	_runCommand: function(cmd) {
		if(typeof this.cmd === 'undefined') {
			this.cmd = cmd;
		}

		return GLib.spawn_command_line_sync(this.cmd);
	}
});
