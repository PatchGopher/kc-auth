BEGIN;


CREATE TABLE IF NOT EXISTS public.users
(
    id serial NOT NULL,
    username text NOT NULL,
    keycloak_id uuid NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_username_key UNIQUE (username)
);

CREATE TABLE IF NOT EXISTS public.todos
(
    id bigserial NOT NULL,
    completed boolean NOT NULL DEFAULT false,
    text text NOT NULL,
	checklist_id bigserial NOT NULL,
    CONSTRAINT todos_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.sessions
(
    id text NOT NULL,
    user_id integer NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    access_token text,
    CONSTRAINT sessions_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.checklists
(
    id bigserial NOT NULL,
    name text,
    CONSTRAINT checklists_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.users_checklists
(
    user_id bigserial NOT NULL,
    checklist_id bigserial NOT NULL,
    CONSTRAINT users_checklists_pkey PRIMARY KEY (user_id, checklist_id),
    CONSTRAINT users_checklists_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT users_checklists_checklist_id_fkey FOREIGN KEY (checklist_id)
        REFERENCES public.checklists (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);


ALTER TABLE IF EXISTS public.todos
    ADD CONSTRAINT todos_checklist_id_fkey FOREIGN KEY (checklist_id)
    REFERENCES public.checklists (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
	
ALTER TABLE IF EXISTS public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

END;