Roundcube Webmail Quickrules
============================
This plugin adds a button to the message list to allow the quick creation of
rules in the SieveRules plugin. Infomration from selected emails is used to
prefile the new rule form.

ATTENTION
---------
This is just a snapshot from the GIT repository and is **NOT A STABLE version
of Quickrules**. It is Intended for use with the **GIT-master** version of
Roundcube and it may not be compatible with older versions. Stable versions of
Quickrules are available from the [Roundcube plugin repository][rcplugrepo]
(for 1.0 and above) or the [releases section][releases] of the GitHub
repository.

Requirements
------------
* [Roundcube SieveRules plugin][rcsr]

License
-------
This plugin is released under the [GNU General Public License Version 3+][gpl].

Even if skins might contain some programming work, they are not considered
as a linked part of the plugin and therefore skins DO NOT fall under the
provisions of the GPL license. See the README file located in the core skins
folder for details on the skin license.

Install
-------
* Place this plugin folder into plugins directory of Roundcube
* Add quickrules to $config['plugins'] in your Roundcube config

**NB:** When downloading the plugin from GitHub you will need to create a
directory called quickrules and place the files in there, ignoring the root
directory in the downloaded archive.

[rcplugrepo]: http://plugins.roundcube.net/packages/johndoh/quickrules
[releases]: http://github.com/JohnDoh/Roundcube-Plugin-QuickRules/releases
[rcsr]: http://github.com/JohnDoh/Roundcube-Plugin-SieveRules-Managesieve/
[gpl]: http://www.gnu.org/licenses/gpl.html