project('antergos-lembrame', 'c',
  version: '0.1.0',
  meson_version: '>= 0.38.0',
)

app_command = 'antergos-lembrame'
app_id = 'com.antergos.Lembrame'

gnome = import('gnome')
intl = import('i18n')

config_h = configuration_data()
GETTEXT_PACKAGE = app_id
config_h.set_quoted('GETTEXT_PACKAGE', GETTEXT_PACKAGE)
config_h.set_quoted('LOCALEDIR', join_paths(get_option('prefix'), get_option('localedir')))
configure_file(
  output: 'config.h',
  configuration: config_h,
)
add_global_arguments([
  '-DHAVE_CONFIG_H',
  '-I' + meson.build_root(),
], language: 'c')

python_dep = dependency('python3', version : '>= 3.3')

app_configuration = configuration_data()

app_configuration.set('GJS', find_program('gjs').path())
app_configuration.set('PACKAGE_NAME', app_id)
app_configuration.set('PACKAGE_VERSION', meson.project_version())
app_configuration.set('prefix', get_option('prefix'))

bindir = join_paths(get_option('prefix'), get_option('bindir'))
datadir = join_paths(get_option('prefix'), get_option('datadir'))

pkgdatadir = join_paths(get_option('datadir'), app_id)

app_configuration.set('libdir', join_paths(get_option('prefix'), get_option('libdir')))
app_configuration.set('pkgdatadir', pkgdatadir)
app_configuration.set('bindir', bindir)


icondir = join_paths(datadir, 'icons')


subdir('src')
subdir('data')
subdir('po')
subdir('lib')
