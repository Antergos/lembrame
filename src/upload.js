const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Soup = imports.gi.Soup;
const Signals = imports.signals;

const Util = imports.util;

const apiPolicyURL = 'https://lz6fjo9m5d.execute-api.us-west-2.amazonaws.com/dev/request-policy';

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
        this._policy = '';

        this._requestPolicy();
    },

    _getPostMessagePolicy: function (callback) {
        let params = {};
        let uid = Util.checkUserID();
        let request = Soup.Message.new('POST', apiPolicyURL);

        // Add current UID to request if found
        if(uid !== '') {
            params.uid = uid
        }

        request.set_request('application/json', Soup.MemoryUse.COPY, JSON.stringify(params), JSON.stringify(params).length);

        // message.request_headers.append(
        //     "Authorization", ""
        // );

        callback(null, request);
    },

    _getPostMessageUpload: function (filename, callback) {
        const file = Gio.File.new_for_path(this._filename);
        const fileTypeQuery = file.query_info('standard::content-type', 0, null);
        const fileMimeType = fileTypeQuery.get_content_type();

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
            let multipart = new Soup.Multipart(Soup.FORM_MIME_TYPE_MULTIPART);

            // Add file and userID to request
            multipart.append_form_string('key', this._policy.fields.key);
            multipart.append_form_string('Content-Type', fileMimeType);
            multipart.append_form_string('x-amz-credential', this._policy.fields['x-amz-credential']);
            multipart.append_form_string('x-amz-algorithm', this._policy.fields['x-amz-algorithm']);
            multipart.append_form_string('x-amz-date', this._policy.fields['x-amz-date']);
            multipart.append_form_string('policy', this._policy.fields.policy);
            multipart.append_form_string('x-amz-signature', this._policy.fields['x-amz-signature']);
            multipart.append_form_file('file', filename, fileMimeType, buffer);

            let message = Soup.form_request_new_from_multipart(this._policy.host, multipart);

            // message.request_headers.append(
            //     "Authorization", ""
            // );

            callback(null, message);
        }), null);
    },

    _requestPolicy: function () {
        this._getPostMessagePolicy(Lang.bind(this, function (error, message) {
            log('Requesting for a S3 POST Policy');
            Soup.Session.prototype.add_feature.call(
                _session, new Soup.ProxyResolverDefault()
            );
            _session.queue_message(message,
                Lang.bind(this, function (session, {status_code, response_body}) {
                    if (status_code === 200) {
                        let response = JSON.parse(response_body.data);
                        log('We have a reponse from the Policy generator.');

                        log('Saving UID and starting upload with received POST Policy');
                        Util.saveUserID(response.UID);
                        this._policy = response.policy;
                        this._upload();
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
                }));
        }));
    },

    _upload: function () {
        this._getPostMessageUpload(this._filename, Lang.bind(this, function (error, message) {
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
                    if (status_code === 204) {
                        log('Finished Uploading. Letting the progress view know.');
                        this.emit('done', Util.checkUserID());
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
