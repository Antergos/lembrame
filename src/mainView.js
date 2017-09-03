const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Params = imports.params;

const Util = imports.util;

// Import Initial Task
const RunTask = imports.tasks.run.RunTask;

const userHome = GLib.get_home_dir();
const cacheFolder = userHome + '/.cache/Lembrame/';
const tmpFolder = cacheFolder + 'tmp/';

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

        /**
         * Check if the unique code was already generated and
         * load the appropiate view.
         */
        if (this._settings.get_string('code-generated') === '') {
            this._generatorPage();
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
                + "Click on the next button to save your environment and get your unique code. \n"
                + "You will then be asked this code in our installer, or you can even share "
                + "it with other \npeople.\n\n")
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
        this.add_named(grid, 'non-generated-view');
    },

    _generateCode: function () {
        log('Starting generation...');

        let runTask = new RunTask();
    }
});
