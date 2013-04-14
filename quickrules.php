<?php

/**
 * QuickRules
 *
 * Plugin to allow the user to quickly create filters from the message list
 *
 * @version @package_version@
 * @requires SieveRules plugin
 * @author Philip Weir
 */
class quickrules extends rcube_plugin
{
	public $task = 'mail|settings';

	private $additional_headers = array('List-Id');

	function init()
	{
		// load required plugin
		$this->require_plugin('sieverules');

		$rcmail = rcube::get_instance();
		$this->register_action('plugin.quickrules.add', array($this, 'init_rule'));

		if ($rcmail->task == 'mail' && ($rcmail->action == '' || $rcmail->action == 'show')) {
			$this->add_texts('localization', true);
			$this->include_script('quickrules.js');
			$this->include_stylesheet($this->local_skin_path() .'/quickrules.css');
			if ($rcmail->output->browser->ie && $rcmail->output->browser->ver == 6)
				$this->include_stylesheet($this->local_skin_path() . '/ie6hacks.css');

			$this->add_button(array('command' => 'plugin.quickrules.create', 'type' => 'link', 'class' => 'button buttonPas quickrules disabled', 'classact' => 'button quickrules', 'classsel' => 'button quickrulesSel', 'title' => 'quickrules.createfilterbased', 'label' => 'quickrules.createfilter'), 'toolbar');
		}
		elseif ($rcmail->task == 'settings' && $rcmail->action == 'plugin.sieverules' && $_SESSION['plugin.quickrules']) {
			$this->include_script('quickrules.js');
		}

		if ($_SESSION['plugin.quickrules']) {
			$this->add_hook('storage_init', array($this, 'fetch_headers'));
			$this->add_hook('sieverules_init', array($this, 'create_rule'));
		}
	}

	function init_rule()
	{
		$_SESSION['plugin.quickrules'] = true;
		$_SESSION['plugin.quickrules.uids'] = rcube_utils::get_input_value('_uid', rcube_utils::INPUT_POST);
		$_SESSION['plugin.quickrules.mbox'] = rcube_utils::get_input_value('_mbox', rcube_utils::INPUT_POST);

		rcube::get_instance()->output->redirect(array('task' => 'settings', 'action' => 'plugin.sieverules'));
	}

	function fetch_headers($attr)
	{
		$attr['fetch_headers'] .= trim($attr['fetch_headers'] . join(' ', $this->additional_headers));
		return($attr);
	}

	function create_rule($args)
	{
		$rcmail = rcube::get_instance();
		if ($rcmail->action == 'plugin.sieverules.add') {
			$uids = $_SESSION['plugin.quickrules.uids'];
			$mbox = $_SESSION['plugin.quickrules.mbox'];
			$headers = $args['defaults']['headers'];
			$rcmail->storage_init();

			foreach (explode(",", $uids) as $uid) {
				$message = new rcube_message($uid);
				$args['script']['tests'][] = array('type' => $rcmail->config->get('sieverules_address_rules', true) ? 'address' : 'header', 'operator' => 'is', 'header' => 'From', 'target' => $message->sender['mailto']);

				$recipients = array();
				$recipients_array = rcube_mime::decode_address_list($message->headers->to);
				foreach ($recipients_array as $recipient)
					$recipients[] = $recipient['mailto'];

				$identity = $rcmail->user->get_identity();
				$recipient_str = join(', ', $recipients);
				if ($recipient_str != $identity['email'])
					$args['script']['tests'][] = array('type' => $rcmail->config->get('sieverules_address_rules', true) ? 'address' : 'header', 'operator' => 'is', 'header' => 'To', 'target' => $recipient_str);

				if (strlen($message->subject) > 0)
					$args['script']['tests'][] = array('type' => 'header', 'operator' => 'contains', 'header' => 'Subject', 'target' => $message->subject);

				foreach ($this->additional_headers as $header) {
					if (strlen($message->headers->others[strtolower($header)]) > 0)
						$args['script']['tests'][] = array('type' => 'header', 'operator' => 'is', 'header' => $header, 'target' => $message->headers->others[strtolower($header)]);
				}

				$args['script']['actions'][] = array('type' => 'fileinto', 'target' => $mbox);

				foreach ($message->headers->flags as $flag => $value) {
					if ($flag == 'FLAGGED')
						$args['script']['actions'][] = array('type' => 'imapflags', 'target' => '\\\\Flagged');
				}
			}

			$_SESSION['plugin.quickrules'] = false;
			$_SESSION['plugin.quickrules.uids'] = '';
			$_SESSION['plugin.quickrules.mbox'] = '';
		}

		return $args;
	}
}

?>