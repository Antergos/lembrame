# Lembrame
Antergos official tool to save your current settings like installed apps, extensions, themes etc,
and allow you to reinstall your system with this data within our installer Cnchi.

### What it will begin doing

* Starting just with Gnome in mind. Add more enviroments later.
* Sync your .bashrc
* Sync your org.gnome.schell schema (enabled-extensions, favorite-apps, extension settings)
* Sync your Shell theme
* Sync your icon theme
* Sync your desktop background
* Sync your screensaver background (gdm)
* Sync your explicitly installed packages (pacman)
* Zip and encrypt all the previous files (libsodium?)
* Generate an unique code
* Upload to a webservice in Antergos servers

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

### Resources
* Gnome-Shell extension downloader: https://gist.github.com/thefekete/d0d7195783b216e0d67a6d56f19207ee
