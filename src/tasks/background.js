const Gio = imports.gi.Gio;
const Lang = imports.lang;

const Task = imports.task.Task;

const BackgroundTask = new Lang.Class({
    Name: 'BackgroundTask',
    Extends: Task,

    _init: function () {
        this.parent();

        this._schemaID = 'org.gnome.desktop.background';
        this._schema = this._getSchema();

        // Create background folder in destination
        this._createFolder('background');

        this._sync();
    },

    _sync: function () {
        this._background = this._getBackground();
        this._backgroundName = this._getBackgroundName();

        this._background.copy(Gio.file_new_for_path(this.tmpFolder + 'background/' + this._backgroundName), 1, null, null);

        log('Copied Background. Moving on.');
    },

    _getBackground: function () {
        return Gio.file_new_for_uri(this._schema.get_string('picture-uri'));
    },

    _getBackgroundName: function () {
        const backgroundPath = this._background.get_parse_name().split('/');
        return backgroundPath[backgroundPath.length - 1];
    }
});
