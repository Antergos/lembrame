const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Params = imports.params;

const Util = imports.util;

const userHome = GLib.get_home_dir();
const cacheFolder = userHome + '/.cache/Lembrame/';
const tmpFolder = cacheFolder + 'tmp/';

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

		let appLogo = Util.loadImageFile('/com/antergos/Lembrame/icons/logo.svg');
		appLogo.get_style_context().add_class('app-logo');

    	// Greeting Text Widget Initialization
		let greetingWidget = new Gtk.Label({
			wrap: true,
			label: _("Through this tool you will be able to save your current account "
			+ "settings in the cloud \nand reuse them in a new installation. \n"
			+ "Click on the next button to save your environment and get your unique code. \n"
			+ "You will then be asked this code in our installer, or you can even share "
			+ "it with other \npeople.\n\n")
		});
		greetingWidget.set_ellipsize(3);
		greetingWidget.set_max_width_chars(70);
		greetingWidget.set_justify(Gtk.Justification.FILL);
		greetingWidget.get_style_context().add_class('greeting-text');

		// Generation code button Initialization
		let generateButton = new Gtk.Button({ label: _('Generate code') });
		generateButton.connect('clicked', Lang.bind(this, this._generateCode));
		generateButton.get_style_context().add_class('suggested-action');

		// Internal separations between greeting text and the button
    	let boxParent = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
    	let boxImgText = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
    	let boxChild = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });

		// Add greeting widget and boxChild to the boxParent
		boxImgText.pack_start(appLogo, false, false, 20);
		boxImgText.pack_start(greetingWidget, false, false, 20);
		boxParent.pack_start(boxImgText, false, false, 0);
		boxParent.pack_start(boxChild, false, false, 0);

		// Add the button widget to the boxChild
		boxChild.pack_start(generateButton, true, false, 0);

		// Add everything to the grid and put it on the Stack
        grid.add(boxParent);
        this.add_named(grid, 'non-generated-view');
    },

    _generateCode: function() {
    	log('Starting generation...');

		this._createInitialFolders();

		// Copy the files to the temporal directory
		// TODO: Refactor this. Create a iterable file and make sure the file cp success and each element should be a class
		// TODO: Are we going to need a progress bar here? Not sure, it should be pretty quick process for this kind of files

		// Copy .bashrc
		Gio.file_new_for_path(userHome + '/.bashrc').copy(Gio.file_new_for_path(tmpFolder + '.bashrc'), 1, null, null);
		log('Copied .bashrc. Moving on.');

		// Copy gnome-shell extension list
		// Done with dconf because I think is easier to dump and load
		let [resShell, outShell, errShell, statusShell] = GLib.spawn_command_line_sync('bash -c "dconf dump /org/gnome/shell/ > ' + tmpFolder + 'dconf_org_gnome_shell"');

        if(statusShell === 0) {
            log('Dumped org.gnome.shell schema. Moving on.');
        } else {
            log('Error trying to get Gnome Shell enabled extensions: ' + errShell);
        }

		// Copy the list of apps installed
		// TODO: I don't see a way of saving just the packages with appdata information in a way that Cnchi knows which package name has to install
		let [resPacman, outPacman, errPacman, statusPacman] = GLib.spawn_command_line_sync('bash -c "/usr/bin/pacman -Qe | cut -f 1 -d \' \' > ' + tmpFolder + 'pacman_package_list"');

        if(statusPacman === 0) {
            log('Dumped the list of explicitly installed packages from pacman. Moving on.');
        } else {
            log('Error trying to dump the explicitly installed packages from pacman: ' + errPacman);
        }

		// Copy desktop background
		const backgroundSchema = Gio.Settings.new('org.gnome.desktop.background');
		const background = Gio.file_new_for_uri(backgroundSchema.get_string('picture-uri'));
		const backgroundPath = background.get_parse_name().split('/');
		const backgroundName = backgroundPath[backgroundPath.length-1];
		background.copy(Gio.file_new_for_path(tmpFolder + 'background/' + backgroundName), 1, null, null);
		log('Copied Background. Moving on.');

		// Copy screensaver background
		const screensaverSchema = Gio.Settings.new('org.gnome.desktop.screensaver');
		const screensaver = Gio.file_new_for_uri(screensaverSchema.get_string('picture-uri'));
		const screensaverPath = screensaver.get_parse_name().split('/');
		const screensaverName = screensaverPath[screensaverPath.length-1];
		screensaver.copy(Gio.file_new_for_path(tmpFolder + 'screensaver/' + screensaverName), 1, null, null);
		log('Copied Screensaver. Moving on.');

		this._zipFolder();
	},

	_createInitialFolders: function() {
		// TODO: Check if we succed and return that value
  		// Load neccessary directories
    	const destFolder = Gio.file_new_for_path(tmpFolder);
    	const backgroundFolder = Gio.file_new_for_path(tmpFolder + '/background');
    	const screensaverFolder = Gio.file_new_for_path(tmpFolder + '/screensaver');

		// Remove the directory if already exists to clean up and create it blank
    	if( destFolder.query_exists(null) ) {
    		log('Temporal Directory already exists, cleaning up...');
    		destFolder.trash(null);
    	}
    	log('Creating temporal directory now with its subdirectories');
    	destFolder.make_directory_with_parents(null);
    	backgroundFolder.make_directory_with_parents(null);
    	screensaverFolder.make_directory_with_parents(null);
	},

	_zipFolder: function() {
		log('bash -c "tar czf ' + cacheFolder + 'export.tar.gz -C ' + tmpFolder + '"');
		let [res, out, err, status] = GLib.spawn_command_line_sync('bash -c "tar czf ' + cacheFolder + 'export.tar.gz -C ' + tmpFolder + ' ."');

        if(status === 0) {
            log('Files compressed. Prepared to upload.');
        } else {
            log('Error compressing the files: ' + err);
        }
	}
});
