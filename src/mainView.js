const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Params = imports.params;

const Util = imports.util;

// Import Initial Task
const RunTask = imports.tasks.run.RunTask;

/**
 * Main view of the application.
 *
 * @type {Lang.Class}
 */
const MainView = new Lang.Class({
    Name: 'MainView',
    Extends: Gtk.Stack,

    _init: function (params) {
        params = Params.fill(params, {
            hexpand: true,
            vexpand: true
        });
        this.parent(params);

        this._settings = Util.getSettings(pkg.name);

        // Check if we have an User ID already. Generate it otherwise.
        this.userID = this._checkUserID();

        // Load app pages
        this._generatorPage();
        this.codeHolder = this._yourCodePage();

        // Set visible the correct page on start
        this._setView();

    },

    _checkUserID: function () {
    	let userID = null;

    	if (this._settings.get_string('id-generated') === '') {
    		log('User ID not found. Generating now.');
            userID = Util.generateUserID();
        } else {
        	log('User ID found. Keep going.');
            userID = this._settings.get_string('id-generated')
        }

        return userID;
    },

    _setView: function () {
        /**
         * Check if the unique code was already generated and
         * load the appropiate view.
         */
        if (this._settings.get_string('code-generated') === '') {
            this.visible_child_name = 'non_generated_view';
        } else {
            this.codeHolder.set_label(this._settings.get_string('code-generated'));
            this.visible_child_name = 'yourcode_view';
        }
    },

    _generatorPage: function () {
        // Page Grid Initialization
        let grid = new Gtk.Grid({
            orientation: Gtk.Orientation.VERTICAL,
            halign: Gtk.Align.CENTER,
            valign: Gtk.Align.CENTER
        });

        let appLogo = Util.loadImageFile('/com/antergos/Lembrame/icons/logo.svg');
        appLogo.get_style_context().add_class('app-logo');

        // Greeting Text Widget Initialization
        let greetingWidget = new Gtk.Label({
            wrap: true,
            label: _("Through this tool you will be able to save your current account "
                + "settings in the cloud \nand reuse them in a new installation. \n"
                + "Click on the next button to save your environment and get your userID and unique code. \n"
                + "You will then be asked this parameters in our installer, or you can even share "
                + "it with \nother people.\n\n")
        });
        greetingWidget.set_ellipsize(3);
        greetingWidget.set_max_width_chars(70);
        greetingWidget.set_justify(Gtk.Justification.FILL);
        greetingWidget.get_style_context().add_class('greeting-text');

        // Generation code button Initialization
        let generateButton = new Gtk.Button({label: _('Generate code')});
        generateButton.connect('clicked', Lang.bind(this, this._generateCode));
        generateButton.get_style_context().add_class('suggested-action');

        // Internal separations between greeting text and the button
        let boxParent = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL});
        let boxImgText = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL});
        let boxChild = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL});

        // Add greeting widget and boxChild to the boxParent
        boxImgText.pack_start(appLogo, false, false, 20);
        boxImgText.pack_start(greetingWidget, false, false, 20);
        boxParent.pack_start(boxImgText, false, false, 0);
        boxParent.pack_start(boxChild, false, false, 0);

        // Add the button widget to the boxChild
        boxChild.pack_start(generateButton, true, false, 0);

        // Add everything to the grid and put it on the Stack
        grid.add(boxParent);
        grid.show_all();

        this.add_named(grid, 'non_generated_view');
    },

    _generateCode: function () {
        log('Starting generation...');

        let runTask = new RunTask();

        this.codeHolder.set_label(this._settings.get_string('code-generated'));
        this.visible_child_name = 'yourcode_view';
    },

    _yourCodePage: function () {
        // Page Grid Initialization
        let grid = new Gtk.Grid({
            orientation: Gtk.Orientation.VERTICAL,
            halign: Gtk.Align.CENTER,
            valign: Gtk.Align.CENTER
        });

        let yourIDMessageWidget = new Gtk.Label({
            wrap: true,
            label: _('Your UserID:')
        });
        yourIDMessageWidget.set_ellipsize(3);
        yourIDMessageWidget.set_max_width_chars(70);
        yourIDMessageWidget.set_justify(Gtk.Justification.FILL);

        let yourIDWidget = new Gtk.Label({
            wrap: true,
            label: this._settings.get_string('id-generated')
        });
        yourIDWidget.set_ellipsize(3);
        yourIDWidget.set_selectable(true);
        yourIDWidget.set_max_width_chars(70);
        yourIDWidget.set_justify(Gtk.Justification.FILL);
        yourIDWidget.get_style_context().add_class('yourcode-text');


        let yourCodeMessageWidget = new Gtk.Label({
            wrap: true,
            label: _('Your upload code:')
        });
        yourCodeMessageWidget.set_ellipsize(3);
        yourCodeMessageWidget.set_max_width_chars(70);
        yourCodeMessageWidget.set_justify(Gtk.Justification.FILL);

        let yourCodeWidget = new Gtk.Label({
            wrap: true,
            label: ''
        });
        yourCodeWidget.set_ellipsize(3);
        yourCodeWidget.set_selectable(true);
        yourCodeWidget.set_max_width_chars(70);
        yourCodeWidget.set_justify(Gtk.Justification.FILL);
        yourCodeWidget.get_style_context().add_class('yourcode-text');

		grid.add(yourIDMessageWidget);
		grid.add(yourIDWidget);
        grid.add(yourCodeMessageWidget);
        grid.add(yourCodeWidget);
        grid.show_all();

        this.add_named(grid, 'yourcode_view');
        return yourCodeWidget;
    }
});
