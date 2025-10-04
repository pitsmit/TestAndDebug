-- we don't know how to generate root <with-no-name> (class Root) :(

comment on database postgres is 'default administrative connection database';

create table anekdot
(
    id          serial
        primary key,
    content     text not null,
    hasbadwords boolean,
    loaddate    timestamp
);

alter table anekdot
    owner to postgres;

create table nonstandartlexic
(
    id   serial
        primary key,
    word varchar not null
);

alter table nonstandartlexic
    owner to postgres;

create table favourites
(
    id        serial
        primary key,
    userid    integer,
    anekdotid integer
        references anekdot
);

alter table favourites
    owner to postgres;

create table actor
(
    id       serial
        primary key,
    login    varchar(10)
        unique
        constraint actor_login_check
            check ((login)::text ~ '^[A-Za-z0-9]+$'::text),
    password varchar(10)
        constraint actor_password_check
            check ((password)::text ~ '^[A-Za-z0-9]+$'::text),
    name     varchar(10)
        unique
        constraint actor_name_check
            check ((name)::text ~ '^[A-Za-z0-9]+$'::text),
    role     integer default 0
);

alter table actor
    owner to postgres;

