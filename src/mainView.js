const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Params = imports.params;

const Util = imports.util;

const MainView = new Lang.Class({
    Name: 'MainView',
    Extends: Gtk.Stack,

    _init: function(params) {
        params = Params.fill(params, { hexpand: true,
                                       vexpand: true });
        this.parent(params);

        this._settings = Util.getSettings(pkg.name);

		/**
		* Check if the unique code was already generated and
		* load the appropiate view.
		*/
		if (this._settings.get_string('code-generated') === ''){
			this._generatorPage();
		}
    },

    _generatorPage: function() {
    	// Page Grid Initialization
    	let grid = new Gtk.Grid({ orientation: Gtk.Orientation.VERTICAL,
                                  halign: Gtk.Align.CENTER,
                                  valign: Gtk.Align.CENTER });

		let appLogo = Util.loadImageFile('/com/antergos/Lembrame/logo.svg.png');

    	// Greeting Text Widget Initialization
		let greetingWidget = new Gtk.Label({
			wrap: true,
			label: _("Through this tool you will be able to save your current account "
			+ "settings in the cloud and reuse them in a new installation. \n"
			+ "Click on the next button to save your environment and get your unique code. \n"
			+ "You will then be asked this code in our installer, or you can even share "
			+ "it with other people.\n\n")
		});
		greetingWidget.set_max_width_chars(60);
		greetingWidget.set_justify(Gtk.Justification.FILL);
		greetingWidget.get_style_context().add_class('greeting-text');

		// Generation code button Initialization
		let generateButton = new Gtk.Button({ label: _('Generate code') });
		generateButton.connect('clicked', Lang.bind(this, this._generateCode));

		// Internal separations between greeting text and the button
    	let boxParent = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
    	let boxChild = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });

		// Add greeting widget and boxChild to the boxParent
		boxParent.pack_start(appLogo, false, false, 0);
		boxParent.pack_start(greetingWidget, false, false, 0);
		boxParent.pack_start(boxChild, false, false, 0);

		// Add the button widget to the boxChild
		boxChild.pack_start(generateButton, true, false, 0);

		// Add everything to the grid and put it on the Stack
        grid.add(boxParent);
        this.add_named(grid, 'non-generated-view');
    },

    _generateCode: function() {
    	log('Starting generation...');

		// Load tmp directory
    	let destFolder = Gio.file_new_for_path('.cache/Lembrame/tmp');

		// Remove the directory if already exists to clean up and create it blank
    	if( destFolder.query_exists(null) ) {
    		log('Temporal Directory already exists, cleaning up...');
    		destFolder.trash(null);
    	}
    	log('Creating temporal directory now');
    	destFolder.make_directory_with_parents(null);

		// Copy the files to the temporal directory
		// TODO: Refactor this. Create a iterable file and make sure the file cp success
		// TODO: Are we going to need a progress bar here? Not sure, it should be pretty quick process for this kind of files

		// Copy .bashrc
		Gio.file_new_for_path('.bashrc').copy(Gio.file_new_for_path('.cache/Lembrame/tmp/.bashrc'), 1, null, null);

		// Copy gnome-shell extension list
		// Copy the list of apps installed
    }
});
