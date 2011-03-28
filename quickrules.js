/**
 * QuickRules plugin script
 */

if (window.rcmail) {
	rcmail.addEventListener('init', function(evt) {
		// register command (directly enable in message view mode)
		rcmail.register_command('plugin.quickrules.create', rcmail_quickrules, rcmail.env.uid);

		if (rcmail.message_list && rcmail.env.junk_mailbox) {
			rcmail.message_list.addEventListener('select', function(list) {
				rcmail.enable_command('plugin.quickrules.create', list.get_single_selection() != null);
			});
		}
	})
}

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

function quickrules_setup_rules() {
	var rulesTable = rcube_find_object('rules-table');
	var actsTable = rcube_find_object('actions-table');

	if (rcmail_quickrules_rules.length < 1)
		return;

	for (i = 1; i < rcmail_quickrules_rules.length; i++)
		rcmail.command('plugin.sieverules.add_rule','', rulesTable.tBodies[0].rows[0]);

	var headers = document.getElementsByName('_selheader[]');
	var ops = document.getElementsByName('_operator[]');
	var targets = document.getElementsByName('_target[]');
	var otherHeaders = document.getElementsByName('_header[]');
	var headerParts = "";

	for (var i = 1; i < headers.length; i++) {
		$(headers[i]).val(rcmail_quickrules_rules[i-1].header);
		$(ops[i]).val(rcmail_quickrules_rules[i-1].op);
		headerParts = "";

		// other headers
		if (rcmail_quickrules_rules[i-1].header.indexOf('other') == 0) {
			headerParts = rcmail_quickrules_rules[i-1].header.split('::');
			rcmail_quickrules_rules[i-1].header = 'header::other'
			$(headers[i]).val(rcmail_quickrules_rules[i-1].header);
		}

		// check values set ok before adding rule
		if ($(headers[i]).val() == rcmail_quickrules_rules[i-1].header && $(ops[i]).val() == rcmail_quickrules_rules[i-1].op) {
			rcmail.sieverules_header_select(headers[i]);

			if (headerParts)
				$(otherHeaders[i]).val(headerParts[1]);

			// set the op again (header onchange resets it)
			$(ops[i]).val(rcmail_quickrules_rules[i-1].op);
			rcmail.sieverules_rule_op_select(ops[i]);

			targets[i].value = rcmail_quickrules_rules[i-1].target;
		}
		else {
			headers[i].selectedIndex = 0;
			ops[i].selectedIndex = 0;
		}
	}

	if (rcmail_quickrules_actions.length < 1)
		return;

	for (i = 1; i < rcmail_quickrules_actions.length; i++)
		rcmail.command('plugin.sieverules.add_action','', actsTable.tBodies[0].rows[0]);

	var acts = document.getElementsByName('_act[]');
	var folders = document.getElementsByName('_folder[]');
	var flags = document.getElementsByName('_imapflags[]');

	for (var i = 1; i < acts.length; i++) {
		$(acts[i]).val(rcmail_quickrules_actions[i-1].act);

		// check for imap4flags
		if (rcmail_quickrules_actions[i-1].act == 'imapflags') {
			if ($(acts[i]).val() != rcmail_quickrules_actions[i-1].act)
				$(acts[i]).val('imap4flags');

			// check values set ok before adding action
			if ($(acts[i]).val() == rcmail_quickrules_actions[i-1].act) {
				rcmail.sieverules_action_select(acts[i]);
				$(flags[i]).val(rcmail_quickrules_actions[i-1].props);
			}
			else {
				acts[i].selectedIndex = 0;
			}
		}
		else {
			// check values set ok before adding action
			if ($(acts[i]).val() == rcmail_quickrules_actions[i-1].act) {
				rcmail.sieverules_action_select(acts[i]);
				$(folders[i]).val(rcmail_quickrules_actions[i-1].props);
			}
			else {
				acts[i].selectedIndex = 0;
			}
		}
	}
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

	if (rcmail.env.action == 'plugin.sieverules.add')
		quickrules_setup_rules();

	if (window.rcm_contextmenu_register_command)
		rcm_contextmenu_register_command('quickrules', 'rcmail_quickrules', rcmail.gettext('quickrules.createfilter'), 'moveto', 'after', false);
}

rcmail.add_onload('rcmail_quickrules_init()');

// update button activation after external events
rcmail.addEventListener('beforedelete', function(props) { rcmail_quickrules_status('beforedelete'); } );
rcmail.addEventListener('beforemove', function(props) { rcmail_quickrules_status('beforemove'); } );
rcmail.addEventListener('beforemoveto', function(props) { rcmail_quickrules_status('beforemoveto'); } );
rcmail.addEventListener('aftermove', function(props) { rcmail_quickrules_status('aftermove'); } );
rcmail.addEventListener('aftermoveto', function(props) { rcmail_quickrules_status('aftermoveto'); } );
rcmail.addEventListener('afterpurge', function(props) { rcmail_quickrules_status('afterpurge'); } );
rcmail.addEventListener('afterexpunge', function(props) { rcmail_quickrules_status('afterexpunge'); } );