/**
 * Auto-generated definitions file ("npm run i18n")
 */

interface I18nCore {
	text: {
		copy: string;
		copied: string;
		done: string;
		loading: string;
		sign_in: string;
		sign_out: string;
		try_again: string;
		back_to_dashboard: string;
		open_dashboard: string;
	};
}

interface I18nLayout {
	title: string;
}

interface I18nWelcome {
	greeting_prefix: string;
	greeting_suffix: string;
	cta_caption: string;
	cta_button: string;
}

interface I18nNav {
	aria_label: string;
	home: string;
	transitions: string;
	send: string;
	profile: string;
}

interface I18nHome {
	title: string;
	opening_chip: string;
	bot_greeting: string;
	bot_pay_or_receive: string;
	bot_wizard_or_expert: string;
	choice_create: string;
	choice_history: string;
	choice_pay: string;
	choice_receive: string;
	choice_guided: string;
	choice_expert: string;
	help_label: string;
}

interface I18nHistory {
	title: string;
	filter_all: string;
	filter_active: string;
	filter_settled: string;
	filter_refunded: string;
	filter_cancelled: string;
}

interface I18nTransitions {
	title: string;
	tab_pending: string;
	tab_created: string;
	tab_disputed: string;
	empty_title: string;
	empty_pending: string;
	empty_created: string;
	empty_disputed: string;
}

interface I18nDispute {
	title: string;
	intro: string;
	evidence_label: string;
	evidence_hint: string;
	votes_label: string;
	reason_label: string;
	reason_placeholder: string;
	open_cta: string;
	cancel_cta: string;
	stub_banner_title: string;
	stub_banner_description: string;
}

interface I18nDetail {
	title: string;
	share_cta: string;
	counterparty_payer: string;
	counterparty_recipient: string;
	created_at: string;
	funded_at: string;
	consent_payer: string;
	consent_recipient: string;
	note_label: string;
	loading: string;
	not_found: string;
}

interface I18nProfile {
	title: string;
	section_edit: string;
	copy_principal: string;
	username_label: string;
	name_label: string;
	surname_label: string;
	address_label: string;
	email_label: string;
	reliability_label: string;
	reliability_yes: string;
	reliability_no: string;
	weight_label: string;
	role_user: string;
	role_arbitrator: string;
	role_admin: string;
	switch_accounts: string;
	history_action: string;
	logout_action: string;
	add_avatar_aria: string;
	edit_save: string;
	edit_saving: string;
	edit_save_success: string;
	edit_save_error: string;
	loading: string;
	username_placeholder: string;
	name_placeholder: string;
	surname_placeholder: string;
	address_placeholder: string;
	email_placeholder: string;
	email_invalid: string;
}

interface I18nLogout_confirm {
	title: string;
	description: string;
	confirm: string;
	cancel: string;
}

interface I18nSend {
	title: string;
	coming_soon_title: string;
	coming_soon_description: string;
}

interface I18nDeals {
	create_cta: string;
	empty_title: string;
	empty_description: string;
	row: {
		amount: string;
		recipient: string;
		recipient_open: string;
		expires: string;
		your_role: string;
		none: string;
	};
	actions: {
		consent: string;
		reject: string;
		cancel: string;
		accept: string;
		reclaim: string;
		dispute: string;
		dispute_tooltip: string;
	};
	status: {
		created: string;
		funded: string;
		settled: string;
		refunded: string;
		cancelled: string;
		rejected: string;
	};
}

interface I18nCreate {
	title: string;
	submit: string;
	submitting: string;
	recipient_placeholder: string;
	mode_pay: string;
	mode_receive: string;
	currency_label: string;
	counterparty_label_pay: string;
	counterparty_label_receive: string;
	tenor_label: string;
	votes_label: string;
	votes_disabled_hint: string;
	summary_amount: string;
	summary_fee: string;
	summary_total: string;
}

interface I18nShare {
	title: string;
	description: string;
	no_share_needed: string;
	qr_alt: string;
	link_label: string;
	link_aria: string;
}

interface I18nClaim {
	title: string;
	missing_code: string;
	signin_title: string;
	signin_description: string;
	load_error_title: string;
	settled_title: string;
	settled_description: string;
	preview_title_fallback: string;
	loading_preview: string;
	recipient_bound: string;
	recipient_open: string;
	deal_field: string;
	status_field: string;
	submit: string;
}

interface I18n {
	lang: Languages;
	core: I18nCore;
	layout: I18nLayout;
	welcome: I18nWelcome;
	nav: I18nNav;
	home: I18nHome;
	history: I18nHistory;
	transitions: I18nTransitions;
	dispute: I18nDispute;
	detail: I18nDetail;
	profile: I18nProfile;
	logout_confirm: I18nLogout_confirm;
	send: I18nSend;
	deals: I18nDeals;
	create: I18nCreate;
	share: I18nShare;
	claim: I18nClaim;
}
