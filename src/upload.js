const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Soup = imports.gi.Soup;
const Signals = imports.signals;

const Util = imports.util;

const apiURL = 'http://www.mocky.io/v2/59ab731b1000000401f9c191';

const _session = new Soup.SessionAsync();

/**
 * Upload the encrypted file to Antergos Cloud
 *
 * @type {Lang.Class}
 */
const Upload = new Lang.Class({
    Name: 'Upload',

    _init: function (filename) {
        this._settings = Util.getSettings(pkg.name);
        this._filename = filename;

        this._upload();
    },

    _getPostMessage: function (filename, callback) {
        let file = Gio.File.new_for_path(this._filename);

        file.load_contents_async(null, Lang.bind(this, function (f, res) {
            let contents;

            try {
                [, contents] = f.load_contents_finish(res);
            } catch (e) {
                log("error loading file: " + e.message);
                callback(e, null);
                return;
            }

            let buffer = new Soup.Buffer(contents, contents.length);
            let mimetype = 'application/octet-stream';
            let multipart = new Soup.Multipart(Soup.FORM_MIME_TYPE_MULTIPART);

            // Add file and userID to request
            multipart.append_form_file('syncData', filename, mimetype, buffer);
            multipart.append_form_string('userID', this._settings.get_string('id-generated'));

            let message = Soup.form_request_new_from_multipart(apiURL, multipart);

            // message.request_headers.append(
            //     "Authorization", ""
            // );

            callback(null, message);
        }), null);
    },

    _upload: function () {
        this._getPostMessage(this._filename, Lang.bind(this, function (error, message) {
            let total = message.request_body.length;
            let uploaded = 0;

            if (error) {
                this.emit("error", error);
                return;
            }

            let signalProgress = message.connect(
                "wrote-body-data",
                Lang.bind(this, function (message, buffer) {
                    uploaded += buffer.length;
                    this.emit("progress", uploaded, total);
                })
            );

			log('Uploading now.');
            Soup.Session.prototype.add_feature.call(
                _session, new Soup.ProxyResolverDefault()
            );
            _session.queue_message(message,
                Lang.bind(this, function (session, {status_code, response_body}) {
                    if (status_code === 200) {
                        log('Finished Uploading. Letting the progress view know.');
                        this.emit('done', response_body.data);
                    } else {
                        log('getJSON error status code: ' + status_code);
                        log('getJSON error response: ' + response_body.data);

                        let errorMessage;

                        try {
                            errorMessage = response_body.data;
                        } catch (e) {
                            log("failed to parse error message " + e);
                            errorMessage = response_body.data
                        }

                        log("HTTP " + status_code + " - " + errorMessage);
                    }

                    message.disconnect(signalProgress);
                }));
        }));
    }
});

Signals.addSignalMethods(Upload.prototype);
