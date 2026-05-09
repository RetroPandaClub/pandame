/**
 * Auto-generated definitions file ("npm run i18n")
 */

interface I18nCore {
	text: {
		cancel: string;
		close: string;
		save: string;
		submit: string;
		copy: string;
		copied: string;
		done: string;
		loading: string;
		signed_in_as: string;
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
}

interface I18nNav {
	aria_label: string;
	home: string;
	send: string;
	profile: string;
}

interface I18nHistory {
	title: string;
	filter_all: string;
	filter_active: string;
	filter_settled: string;
	filter_refunded: string;
	filter_cancelled: string;
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
	settled_at: string;
	refunded_at: string;
	updated_at: string;
	consent_payer: string;
	consent_recipient: string;
	escrow_account: string;
	note_label: string;
	loading: string;
	not_found: string;
	open_share: string;
}

interface I18nProfile {
	title: string;
	principal_label: string;
	copy_principal: string;
	edit_cta: string;
	username_label: string;
	name_label: string;
	surname_label: string;
	address_label: string;
	email_label: string;
	reliability_label: string;
	weight_label: string;
	reliability_score: string;
	reliability_concluded: string;
	reliability_positive: string;
	reliability_pending: string;
	role_label: string;
	role_user: string;
	role_arbitrator: string;
	role_admin: string;
	role_stub_hint: string;
	role_switch_aria: string;
	role_arbitrator_title: string;
	role_arbitrator_description: string;
	role_admin_title: string;
	role_admin_description: string;
	role_stub_card_label: string;
	edit_title: string;
	edit_save: string;
	edit_saving: string;
	edit_save_success: string;
	edit_save_error: string;
	edit_cancel: string;
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
	role: { payer: string; recipient: string; unknown: string };
	row: {
		untitled: string;
		amount: string;
		payer: string;
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
		dispute_notice_html: string;
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
	deal_title_label: string;
	deal_title_placeholder: string;
	note_label: string;
	note_placeholder: string;
	recipient_label: string;
	recipient_placeholder: string;
	recipient_invalid: string;
	amount_label_html: string;
	amount_placeholder_html: string;
	amount_invalid: string;
	expiry_label: string;
	expiry_invalid: string;
	mode_pay: string;
	mode_receive: string;
	currency_label: string;
	counterparty_label_pay: string;
	counterparty_label_receive: string;
	tenor_label: string;
	votes_label: string;
	votes_disabled_hint: string;
	summary_title: string;
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
	submitting: string;
}

interface I18n {
	lang: Languages;
	core: I18nCore;
	layout: I18nLayout;
	welcome: I18nWelcome;
	nav: I18nNav;
	history: I18nHistory;
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
