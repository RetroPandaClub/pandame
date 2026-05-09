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
	tagline_html: string;
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
	deals: I18nDeals;
	create: I18nCreate;
	share: I18nShare;
	claim: I18nClaim;
}
