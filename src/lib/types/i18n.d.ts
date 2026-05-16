/**
 * Auto-generated definitions file ("npm run i18n")
 */

interface I18nCore {
	text: {
		copy: string;
		copied: string;
		copy_principal_aria: string;
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
	transactions: string;
	profile: string;
}

interface I18nHome {
	title: string;
	chip_hello: string;
	chip_new_deal: string;
	chip_see_deal: string;
	opening_chip: string;
	bot_greeting_prefix: string;
	bot_greeting_brand: string;
	bot_greeting_suffix: string;
	bot_pay_or_receive: string;
	bot_wizard_or_expert: string;
	bot_see_deal_filter: string;
	choice_create: string;
	choice_history: string;
	choice_pay: string;
	choice_receive: string;
	choice_guided: string;
	choice_expert: string;
	choice_see_pending: string;
	choice_see_created: string;
	choice_see_disputed: string;
	choice_see_history: string;
	help_label: string;
}

interface I18nHistory {
	title: string;
	filter_all: string;
	filter_active: string;
	filter_settled: string;
	filter_refunded: string;
	filter_disputed: string;
	filter_cancelled: string;
}

interface I18nTransactions {
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
	loading: string;
	deal_not_found: string;
	evidence_label: string;
	evidence_hint: string;
	reason_label: string;
	reason_placeholder: string;
	open_cta: string;
	cancel_cta: string;
	back_to_deal: string;
	open_warning_title: string;
	open_warning_body: string;
	deal_id_short: string;
	phase_evidence: string;
	phase_voting: string;
	phase_resolved: string;
	field_id: string;
	field_panel_size: string;
	field_arbitration_fee: string;
	field_evidence_deadline: string;
	field_voting_deadline: string;
	field_resolved_at: string;
	field_opened_by: string;
	resolved_title: string;
	outcome_settled: string;
	outcome_refunded: string;
	outcome_no_quorum: string;
	outcome_withdrawn_settled: string;
	outcome_withdrawn_refunded: string;
	tally_cc: string;
	tally_ic: string;
	tally_abstain: string;
	withdraw_title: string;
	withdraw_description: string;
	withdraw_my_proposal: string;
	withdraw_their_proposal: string;
	withdraw_none: string;
	withdraw_propose_cta: string;
	withdraw_retract_cta: string;
	vote_title: string;
	vote_description: string;
	vote_current_label: string;
	vote_cast_cta: string;
	vote_change_cta: string;
	vote_cc_title: string;
	vote_cc_description: string;
	vote_ic_title: string;
	vote_ic_description: string;
	vote_abstain_title: string;
	vote_abstain_description: string;
	finalize_title: string;
	finalize_description: string;
	finalize_cta: string;
	evidence_section_title: string;
	evidence_empty: string;
	evidence_add_title: string;
	evidence_add_description: string;
	evidence_note_label: string;
	evidence_note_placeholder: string;
	evidence_url_label: string;
	evidence_url_hint: string;
	evidence_hash_label: string;
	evidence_hash_hint: string;
	evidence_hash_invalid: string;
	evidence_hash_required: string;
	evidence_required: string;
	evidence_submit_cta: string;
	panel_title: string;
	panel_pending: string;
	panel_no_vote: string;
	panel_paid: string;
}

interface I18nArbitrator {
	title: string;
	subtitle: string;
	loading: string;
	not_registered_title: string;
	not_registered_description: string;
	profile_section: string;
	assigned_section: string;
	assigned_empty_title: string;
	assigned_empty_description: string;
	deregister_cta: string;
	deregister_confirm: string;
	score_not_yet: string;
	status_active: string;
	status_suspended: string;
	status_deregistered: string;
	field_principal: string;
	field_status: string;
	field_registered_at: string;
	field_registered_by: string;
	field_assigned: string;
	field_voted: string;
	field_with_majority: string;
	field_score: string;
}

interface I18nAdmin {
	title: string;
	subtitle: string;
	controller_warning: string;
	register_section: string;
	register_description: string;
	register_label: string;
	register_cta: string;
	list_section: string;
	list_empty_title: string;
	list_empty_description: string;
	invalid_principal: string;
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
	panel_size: string;
	panel_size_value: string;
	panel_size_default: string;
}

interface I18nProfile {
	title: string;
	section_edit: string;
	username_label: string;
	name_label: string;
	surname_label: string;
	reliability_label: string;
	reliability_yes: string;
	weight_label: string;
	history_action: string;
	arbitrator_action: string;
	admin_action: string;
	add_avatar_aria: string;
	avatar_sheet_title: string;
	avatar_sheet_description: string;
	avatar_take_photo: string;
	avatar_choose_library: string;
	avatar_use_default: string;
	avatar_camera_hint: string;
	avatar_camera_preview_aria: string;
	avatar_capture: string;
	avatar_camera_back: string;
	avatar_camera_unavailable: string;
	avatar_camera_denied: string;
	avatar_camera_unsupported: string;
	avatar_too_large: string;
	avatar_invalid: string;
	edit_save: string;
	edit_cancel: string;
	edit_save_error: string;
	username_placeholder: string;
	name_placeholder: string;
	surname_placeholder: string;
}

interface I18nLogout_confirm {
	title: string;
	confirm: string;
	cancel: string;
}

interface I18nDeals {
	empty_title: string;
	empty_description: string;
	row: {
		amount: string;
		recipient: string;
		recipient_open: string;
		expires: string;
		your_role: string;
		none: string;
		panel_size: string;
		panel_size_value: string;
		panel_size_default: string;
	};
	actions: {
		consent: string;
		reject: string;
		cancel: string;
		accept: string;
		confirm_completion: string;
		reject_completion: string;
		reclaim: string;
		dispute: string;
		view_dispute: string;
	};
	status: {
		refunded: string;
		disputed: string;
		arbitrated_settled: string;
		arbitrated_refunded: string;
	};
}

interface I18nCreate {
	title: string;
	submit: string;
	submitting: string;
	mode_pay: string;
	mode_receive: string;
	payer_wallet_label: string;
	recipient_wallet_label: string;
	currency_label: string;
	amount_label: string;
	expiry_label: string;
	votes_label: string;
	votes_panel_hint: string;
	panel_fast_title: string;
	panel_fast_subtitle: string;
	panel_fair_title: string;
	panel_fair_subtitle: string;
	panel_slow_title: string;
	panel_slow_subtitle: string;
	panel_aria_label: string;
	panel_votes_unit: string;
	summary_label: string;
	summary_amount: string;
	summary_fee: string;
	summary_creation_fee: string;
	summary_total: string;
	title_deal_label: string;
	title_deal_placeholder: string;
	agreement_label: string;
	agreement_placeholder: string;
	add_documents_label: string;
	upload_cta: string;
	upload_caption: string;
	help_label: string;
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

interface I18nErrors {
	panel_size_out_of_range: string;
	amount_below_minimum: string;
	dispute_reserve_required: string;
	creation_fee_required: string;
	unsupported_asset: string;
}

interface I18n {
	lang: Languages;
	core: I18nCore;
	layout: I18nLayout;
	welcome: I18nWelcome;
	nav: I18nNav;
	home: I18nHome;
	history: I18nHistory;
	transactions: I18nTransactions;
	dispute: I18nDispute;
	arbitrator: I18nArbitrator;
	admin: I18nAdmin;
	detail: I18nDetail;
	profile: I18nProfile;
	logout_confirm: I18nLogout_confirm;
	deals: I18nDeals;
	create: I18nCreate;
	share: I18nShare;
	claim: I18nClaim;
	errors: I18nErrors;
}
