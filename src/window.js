// -*- Mode: js; indent-tabs-mode: nil; c-basic-offset: 4; tab-width: 4 -*-
//
// Copyright (c) 2013 Giovanni Campagna <scampa.giovanni@gmail.com>
//
// Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//   * Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//   * Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//   * Neither the name of the GNOME Foundation nor the
//     names of its contributors may be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE LIABLE FOR ANY
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;
const Params = imports.params;

const Util = imports.util;

const MainView = imports.mainView.MainView;

/**
 * General window and dialogs like About
 *
 * @type {Lang.Class}
 */
const MainWindow = new Lang.Class({
    Name: 'MainWindow',
    Extends: Gtk.ApplicationWindow,
    Template: 'resource:///com/antergos/Lembrame/main.ui',
    Children: ['main-grid'],

    _init: function (params) {
        params = Params.fill(params, {
            title: GLib.get_application_name(),
            default_width: 955,
            default_height: 335
        });
        this.parent(params);

        Util.initActions(this,
            [{
                name: 'about',
                activate: this._about
            }]);

        this._view = new MainView();
        this.main_grid.add(this._view);
        this.main_grid.show_all();

    },

    _about: function () {
        let aboutDialog = new Gtk.AboutDialog(
            {
                authors: [
                    'Alexandre Filgueira <alexfilgueira@antergos.com>'
                ],
                artists: [
                    'Logo based on the work of <a href="https://www.flaticon.com/authors/pixel-perfect">pixel-perfect</a> from Flaticon',
                    'Alexandre Filgueira <alexfilgueira@antergos.com>'
                ],
                program_name: _("Lembrame"),
                comments: _("Antergos official tool to synchronize settings"),
                copyright: 'Copyright 2018 - Antergos',
                license_type: Gtk.License.GPL_2_0,
                logo_icon_name: 'com.antergos.Lembrame',
                version: pkg.version,
                website: 'https://antergos.com/',
                wrap_license: true,
                modal: true,
                transient_for: this
            });

        aboutDialog.show();
        aboutDialog.connect('response', function () {
            aboutDialog.destroy();
        });
    },
});

