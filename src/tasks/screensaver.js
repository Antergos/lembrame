const Gio = imports.gi.Gio;
const Lang = imports.lang;

const Task = imports.task.Task;

const ScreensaverTask = new Lang.Class({
	Name: 'ScreensaverTask',
	Extends: Task,

	_init: function() {
		this.parent();

		this._schemaID = 'org.gnome.desktop.screensaver';
		this._schema = this._getSchema();

		// Create screensaver folder in destination
		this._createFolder('screensaver');

		this._sync();
	},

	_sync: function() {
		this._screensaver = this._getScreensaver();
		this._screensaverName = this._getScreensaverName();

		this._screensaver.copy(Gio.file_new_for_path(this.tmpFolder + 'screensaver/' + this._screensaverName), 1, null, null);

		log('Copied Screensaver. Moving on.');
	},

	_getScreensaver: function() {
		return Gio.file_new_for_uri(this._schema.get_string('picture-uri'));
	},

	_getScreensaverName: function() {
		const screensaverPath = this._screensaver.get_parse_name().split('/');
		return screensaverPath[screensaverPath.length-1];
	}
});
