# Lembrame

<p align="center">
	<img alt="Lembrame logo" src="data/icons/hicolor/512x512/apps/com.antergos.Lembrame.png" width="200">
</p>

Antergos official tool to save your current settings like installed apps, extensions, themes etc,
and allow you to reinstall your system with this data within our installer Cnchi.

### Dependencies

* Gjs (Main language)
* Gnome Shell >= 3.24
* Python >= 3.3 (encryption script)
* Libnacl # python-libnacl # (https://github.com/saltstack/libnacl) (libsodium wrapper - encryption - python library)
* DConf

### What it will begin doing

* Starting just with Gnome in mind. Add more enviroments later.
* *[Done]* Sync your .bashrc
* *[Done]* Sync your org.gnome.schell schema (enabled-extensions, favorite-apps, extension settings)
* *[Done]* Sync your Shell theme
* *[Done]* Sync your icon theme
* *[Done]* Sync your GTK theme
* *[Done]* Sync your desktop background
* *[Done]* Sync your screensaver background (gdm)
* *[Done]* Sync your explicitly installed packages (pacman)
* *[Done]* Zip and encrypt all the previous files (libsodium)
* *[Done]* Generate an unique code
* *[Done]* Upload to a webservice in Antergos servers

### Big TODO's
* Ensure that all tasks are completed as expected
* Do not block the main thread while executing the tasks
* Show a pulsed progress bar for the point before
* ~~Show the last screen with the unique code only when the upload completes and everything is OK~~
* Allow to send your userID and unique code to your email
* Allow to re-do the sync

### What would be the perfect evolution for this

* Creation of an Antergos account where this tool can sync all this content frequently. Everything with client side encryption
* Allow the user to specifically choose which things to sync
* Having a personal account, we could add some private stuff
	* Wifi passwords
	* Name and picture
	* etc
* Cnchi (Antergos installer) would ask you if you want to configure your installation with your Antergos account.
* Modify our login system to allow Antergos account sign in "Windows 10 style" (not sure if 100% possible)
* I guess we would have to charge for this service to pay the servers. At least for some of the features.

### Build the tool
* Run meson
    '''meson . _build'''
* Run ninja
    '''ninja -C _build'''
* Install files with ninja
    '''sudo ninja install -C _build'''
* Run Lembrame
    '''com.antergos.Lembrame'''
* Uninstall with ninja
    '''sudo ninja -C _build uninstall'''

### Resources
* Gnome-Shell extension downloader: https://gist.github.com/thefekete/d0d7195783b216e0d67a6d56f19207ee
