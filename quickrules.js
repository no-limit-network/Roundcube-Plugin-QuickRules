/**
 * QuickRules plugin script
 */

function rcmail_quickrules() {
	if (!rcmail.env.uid && (!rcmail.message_list || !rcmail.message_list.get_selection().length))
		return;

	var uids = rcmail.env.uid ? rcmail.env.uid : rcmail.message_list.get_selection().join(',');

	var lock = rcmail.set_busy(true, 'loading');
	rcmail.http_post('plugin.quickrules.add', '_uid='+uids+'&_mbox='+urlencode(rcmail.env.mailbox), lock);
}

function quickrules_add_filter() {
	rcmail.command('plugin.sieverules.add');
}

function rcmail_quickrules_status(command) {
	switch (command) {
		case 'beforedelete':
			if (!rcmail.env.flag_for_deletion && rcmail.env.trash_mailbox &&
				rcmail.env.mailbox != rcmail.env.trash_mailbox &&
				(rcmail.message_list && !rcmail.message_list.shiftkey))
				rcmail.enable_command('plugin.quickrules.create', false);

			break;
		case 'beforemove':
		case 'beforemoveto':
			rcmail.enable_command('plugin.quickrules.create', false);
			break;
		case 'aftermove':
		case 'aftermoveto':
			if (rcmail.env.action == 'show')
				rcmail.enable_command('plugin.quickrules.create', true);

			break;
		case 'afterpurge':
		case 'afterexpunge':
			if (!rcmail.env.messagecount && rcmail.task == 'mail')
				rcmail.enable_command('plugin.quickrules.create', false);

			break;
	}
}

function rcmail_quickrules_init() {
	if (rcmail.env.action == 'plugin.sieverules')
		quickrules_add_filter();

	if (window.rcm_contextmenu_register_command)
		rcm_contextmenu_register_command('quickrules', 'rcmail_quickrules', rcmail.gettext('quickrules.createfilter'), 'moveto', 'after', false);
}

$(document).ready(function() {
	if (window.rcmail) {
		rcmail.addEventListener('init', function(evt) {
			// register command (directly enable in message view mode)
			rcmail.register_command('plugin.quickrules.create', rcmail_quickrules, rcmail.env.uid);

			if (rcmail.message_list && rcmail.env.junk_mailbox) {
				rcmail.message_list.addEventListener('select', function(list) {
					rcmail.enable_command('plugin.quickrules.create', list.get_single_selection() != null);
				});
			}
		});

		rcmail.add_onload('rcmail_quickrules_init()');

		// update button activation after external events
		rcmail.addEventListener('beforedelete', function(props) { rcmail_quickrules_status('beforedelete'); } );
		rcmail.addEventListener('beforemove', function(props) { rcmail_quickrules_status('beforemove'); } );
		rcmail.addEventListener('beforemoveto', function(props) { rcmail_quickrules_status('beforemoveto'); } );
		rcmail.addEventListener('aftermove', function(props) { rcmail_quickrules_status('aftermove'); } );
		rcmail.addEventListener('aftermoveto', function(props) { rcmail_quickrules_status('aftermoveto'); } );
		rcmail.addEventListener('afterpurge', function(props) { rcmail_quickrules_status('afterpurge'); } );
		rcmail.addEventListener('afterexpunge', function(props) { rcmail_quickrules_status('afterexpunge'); } );
	}
});