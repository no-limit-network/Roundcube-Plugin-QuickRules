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

	for (var i = 1; i < headers.length; i++) {
		$(headers[i]).val(rcmail_quickrules_rules[i-1].header);
		$(ops[i]).val(rcmail_quickrules_rules[i-1].op);

		// check values set ok before adding rule
		if ($(headers[i]).val() == rcmail_quickrules_rules[i-1].header && $(ops[i]).val() == rcmail_quickrules_rules[i-1].op) {
			rcmail.sieverules_header_select(headers[i]);

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

	for (var i = 1; i < acts.length; i++) {
		$(acts[i]).val(rcmail_quickrules_actions[i-1].act);

		// check for imap4flags
		if (rcmail_quickrules_actions[i-1].act == 'imapflags' && $(acts[i]).val() != rcmail_quickrules_actions[i-1].act)
			$(acts[i]).val('imap4flags');

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

$(document).ready(function() {
	if (rcmail.env.action == 'plugin.sieverules')
		rcmail.add_onload('quickrules_add_filter();');

	if (rcmail.env.action == 'plugin.sieverules.add')
		rcmail.add_onload('quickrules_setup_rules();');

	if (window.rcm_contextmenu_register_command)
		rcm_contextmenu_register_command('quickrules', 'rcmail_quickrules', rcmail.gettext('quickrules.createfilter'), 'moveto', 'after', false);
});