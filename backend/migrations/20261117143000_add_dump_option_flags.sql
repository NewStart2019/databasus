-- +goose Up
-- +goose StatementBegin
ALTER TABLE databases_mysql
    ADD COLUMN is_skip_events BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE databases_mysql
    ADD COLUMN is_skip_routines BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE databases_mysql
    ADD COLUMN is_skip_triggers BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE databases_mongodb
    ADD COLUMN is_skip_gzip BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE databases_mongodb
    ADD COLUMN is_read_from_secondary BOOLEAN NOT NULL DEFAULT FALSE;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE databases_mysql
    DROP COLUMN is_skip_events;

ALTER TABLE databases_mysql
    DROP COLUMN is_skip_routines;

ALTER TABLE databases_mysql
    DROP COLUMN is_skip_triggers;

ALTER TABLE databases_mongodb
    DROP COLUMN is_skip_gzip;

ALTER TABLE databases_mongodb
    DROP COLUMN is_read_from_secondary;
-- +goose StatementEnd
