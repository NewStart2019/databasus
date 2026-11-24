package httpapi

import "databasus-backend/internal/modules/databases/internal/providers/mysql"

func toMysqlSettings(body MysqlSettings) mysql.Settings {
	return mysql.Settings{
		Version:        "",
		Host:           body.Host,
		Port:           body.Port,
		Username:       body.Username,
		Password:       getValueOrZero(body.Password),
		Database:       getValueOrZero(body.Database),
		IsHTTPS:        body.IsHttps,
		SSHTunnel:      toSSHTunnelSettings(body.SshTunnel),
		ExcludeTables:  body.ExcludeTables,
		Privileges:     nil,
		IsSkipEvents:   body.IsSkipEvents,
		IsSkipRoutines: body.IsSkipRoutines,
		IsSkipTriggers: body.IsSkipTriggers,
	}
}

func fromMysqlSettings(settings mysql.Settings) MysqlSettings {
	return MysqlSettings{
		Type:           MysqlSettingsTypeMYSQL,
		Version:        toOptionalValue(MysqlVersion(settings.Version)),
		Host:           settings.Host,
		Port:           settings.Port,
		Username:       settings.Username,
		Password:       nil,
		Database:       toOptionalValue(settings.Database),
		IsHttps:        settings.IsHTTPS,
		SshTunnel:      fromSSHTunnelSettings(settings.SSHTunnel),
		ExcludeTables:  toNonNilStrings(settings.ExcludeTables),
		IsSkipEvents:   settings.IsSkipEvents,
		IsSkipRoutines: settings.IsSkipRoutines,
		IsSkipTriggers: settings.IsSkipTriggers,
		Privileges:     new(toNonNilStrings(settings.Privileges)),
	}
}
