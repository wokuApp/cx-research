CREATE SCHEMA IF NOT EXISTS research;
REVOKE ALL ON SCHEMA research FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

CREATE TABLE research.study_state (
  id text PRIMARY KEY CHECK (id = 'ia-cx-2026'),
  instrument_version text NOT NULL DEFAULT '0.5',
  phase text NOT NULL DEFAULT 'pilot' CHECK (phase IN ('pilot','main')),
  manual_paused boolean NOT NULL DEFAULT true,
  completed integer NOT NULL DEFAULT 0 CHECK (completed >= 0),
  pilot_completed integer NOT NULL DEFAULT 0 CHECK (pilot_completed BETWEEN 0 AND 50),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE research.contacts (
  id uuid PRIMARY KEY,
  study_id text NOT NULL REFERENCES research.study_state(id),
  email_key char(64) NOT NULL,
  email_ciphertext text NOT NULL,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_mail_at timestamptz,
  UNIQUE (study_id,email_key)
);
CREATE TABLE research.responses (
  id uuid PRIMARY KEY,
  study_id text NOT NULL REFERENCES research.study_state(id),
  contact_id uuid NOT NULL UNIQUE REFERENCES research.contacts(id),
  payload_digest char(64) NOT NULL,
  instrument_version text NOT NULL,
  locale text NOT NULL CHECK (locale='es'),
  phase text NOT NULL CHECK (phase IN ('pilot','main')),
  consent boolean NOT NULL CHECK (consent),
  eligible boolean NOT NULL,
  client_submitted_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  answers jsonb NOT NULL CHECK (jsonb_typeof(answers)='object')
);
CREATE TABLE research.verification_tokens (
  digest char(64) PRIMARY KEY,
  contact_id uuid NOT NULL REFERENCES research.contacts(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  CHECK (expires_at > created_at - interval '1 day')
);
CREATE INDEX verification_contact_idx ON research.verification_tokens(contact_id);
CREATE TABLE research.mail_outbox (
  id uuid PRIMARY KEY,
  contact_id uuid NOT NULL REFERENCES research.contacts(id),
  token_digest char(64) NOT NULL REFERENCES research.verification_tokens(digest),
  token_ciphertext text,
  state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','processing','sent','failed','cancelled')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5),
  available_at timestamptz NOT NULL DEFAULT now(),
  lease_id uuid,
  lease_until timestamptz,
  message_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX outbox_due_idx ON research.mail_outbox(state,available_at,lease_until);
CREATE INDEX outbox_contact_idx ON research.mail_outbox(contact_id);
CREATE TABLE research.rate_limits (
  key text PRIMARY KEY,
  hits integer NOT NULL CHECK (hits >= 1),
  expires_at timestamptz NOT NULL
);
CREATE INDEX rate_expiration_idx ON research.rate_limits(expires_at);
CREATE TABLE research.admin_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  action text NOT NULL,
  reason text NOT NULL,
  request_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE VIEW research.analysis_responses AS
SELECT r.id, r.instrument_version, r.locale, r.phase, r.eligible, r.received_at,
       c.verified_at IS NOT NULL AS email_verified, r.answers
FROM research.responses r JOIN research.contacts c ON c.id=r.contact_id;
