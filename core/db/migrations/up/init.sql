CREATE TYPE "question_type" AS ENUM (
  'ordinal_single',
  'nominal_single',
  'nominal_multible',
  'order',
  'boolean'
);

CREATE TYPE "role" AS ENUM (
  'owner',
  'editor',
  'analyst',
  'proctor',
  'participant',
  'spectator'
);

CREATE TABLE "checklists" (
  "id" BIGSERIAL PRIMARY KEY,
  "name" text,
  PRIMARY KEY ("id")
);

CREATE TABLE "sessions" (
  "id" text PRIMARY KEY,
  "user_id" integer NOT NULL,
  "expires_at" timestamp NOT NULL,
  "access_token" text,
  "access_token_expires_at" text,
  "refresh_token" text,
  PRIMARY KEY ("id")
);

CREATE TABLE "todos" (
  "id" BIGSERIAL PRIMARY KEY,
  "completed" boolean NOT NULL DEFAULT false,
  "text" text NOT NULL,
  "checklist_id" BIGSERIAL NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "users" (
  "id" BIGSERIAL PRIMARY KEY,
  "username" text NOT NULL,
  "keycloak_id" uuid NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "users_checklists" (
  "user_id" BIGSERIAL PRIMARY KEY,
  "checklist_id" BIGSERIAL NOT NULL,
  "relation" text,
  PRIMARY KEY ("user_id", "checklist_id")
);

CREATE TABLE "users_polls" (
  "user_id" BIGSERIAL,
  "poll_id" BIGSERIAL,
  "role" role NOT NULL,
  PRIMARY KEY ("user_id", "poll_id")
);

CREATE TABLE "polls" (
  "id" BIGSERIAL PRIMARY KEY,
  "title" text NOT NULL,
  "template_poll_id" bigserial NOT NULL
);

CREATE TABLE "questions" (
  "id" BIGSERIAL PRIMARY KEY,
  "poll_id" bigserial NOT NULL,
  "question" text NOT NULL,
  "type" question_type NOT NULL
);

CREATE TABLE "options" (
  "id" BIGSERIAL PRIMARY KEY,
  "question_id" bigserial NOT NULL,
  "position" int NOT NULL,
  "option" text NOT NULL
);

CREATE TABLE "answers" (
  "id" BIGSERIAL PRIMARY KEY,
  "question_id" bigserial NOT NULL,
  "user_id" bigserial NOT NULL,
  "value" int
);

CREATE TABLE "answer_option" (
  "id" BIGSERIAL PRIMARY KEY,
  "answer_id" bigserial NOT NULL,
  "option_id" bigserial NOT NULL,
  "position" int NOT NULL
);

CREATE UNIQUE INDEX "users_username_key" ON "users" ("username");

ALTER TABLE "sessions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "todos" ADD FOREIGN KEY ("checklist_id") REFERENCES "checklists" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "users_checklists" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "users_checklists" ADD FOREIGN KEY ("checklist_id") REFERENCES "checklists" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "users_polls" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "users_polls" ADD FOREIGN KEY ("poll_id") REFERENCES "polls" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "polls" ADD FOREIGN KEY ("template_poll_id") REFERENCES "polls" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "questions" ADD FOREIGN KEY ("poll_id") REFERENCES "polls" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "options" ADD FOREIGN KEY ("question_id") REFERENCES "questions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "answers" ADD FOREIGN KEY ("question_id") REFERENCES "questions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "answers" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "answer_option" ADD FOREIGN KEY ("answer_id") REFERENCES "answers" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "answer_option" ADD FOREIGN KEY ("option_id") REFERENCES "options" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "options" 
ADD CONSTRAINT "options_position_unique_for_question" 
UNIQUE ("question_id", "position");