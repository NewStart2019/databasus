import { Checkbox, Switch, TagsInput } from '@mantine/core';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  DATABASE_TYPE_LABEL_KEYS,
  DatabaseType,
  type MariadbSettings,
  MySqlCompatibleConnectionStringParser,
  type MysqlSettings,
} from '@/entities/databases';
import type { ConnectionEditorProps } from '@/features/database-connection/lib/ConnectionEditorProps';
import { isLocalhostConnection } from '@/features/database-connection/lib/isLocalhostConnection';
import { stripHostScheme } from '@/features/database-connection/lib/stripHostScheme';
import { ConnectionCredentialFields } from '@/features/database-connection/ui/ConnectionCredentialFields';
import { ConnectionFieldRow } from '@/features/database-connection/ui/ConnectionFieldRow';
import { ConnectionFieldTooltip } from '@/features/database-connection/ui/ConnectionFieldTooltip';
import { ConnectionHostHint } from '@/features/database-connection/ui/ConnectionHostHint';
import { ConnectionStringImport } from '@/features/database-connection/ui/ConnectionStringImport';
import { EditSshTunnelComponent } from '@/features/database-connection/ui/EditSshTunnelComponent';
import { NAME_LIST_TOKEN_SEPARATORS, normalizeNameList } from '@/shared/lib';
import { AdvancedSettingsToggleComponent } from '@/shared/ui';

type Settings = MysqlSettings | MariadbSettings;

type MysqlDumpOptionKey = 'isSkipEvents' | 'isSkipRoutines' | 'isSkipTriggers';

interface MysqlDumpOption {
  key: MysqlDumpOptionKey;
  label: string;
  tooltip: string;
}

const hasAdvancedValues = (settings: Settings, isRestore: boolean): boolean => {
  if (settings.sshTunnel?.isEnabled) return true;
  if (settings.type === DatabaseType.MARIADB && settings.isSkipGaleraDisable) return true;
  if (isRestore) return false;

  return (
    !!settings.excludeTables?.length ||
    (settings.type === DatabaseType.MARIADB && !!settings.isExcludeEvents) ||
    (settings.type === DatabaseType.MYSQL &&
      (!!settings.isSkipEvents || !!settings.isSkipRoutines || !!settings.isSkipTriggers))
  );
};

export const EditMySqlCompatibleConnectionComponent = ({
  scenario,
  settings,
  savedSshTunnel,
  isAddressChanged,
  onConnectionChange,
  onNonConnectionChange,
}: ConnectionEditorProps<Settings>) => {
  const { t } = useTranslation();
  const controlId = useId();
  const isRestore = scenario === 'restore';
  const [isShowAdvanced, setShowAdvanced] = useState(() => hasAdvancedValues(settings, isRestore));

  const engineName = t(DATABASE_TYPE_LABEL_KEYS[settings.type]);

  return (
    <>
      <ConnectionStringImport
        parse={(connectionString) =>
          MySqlCompatibleConnectionStringParser.parse(connectionString, settings.type)
        }
        onParsed={(parsed) =>
          onConnectionChange({
            ...settings,
            host: parsed.host,
            port: parsed.port,
            username: parsed.username,
            password: parsed.password,
            database: parsed.database,
            isHttps: parsed.isHttps,
          })
        }
      />

      <ConnectionCredentialFields
        controlId={controlId}
        engineName={engineName}
        values={settings}
        isAddressChanged={isAddressChanged}
        hostHints={isLocalhostConnection(settings) && <ConnectionHostHint topic="localhost" />}
        onHostChange={(rawHost) =>
          onConnectionChange({ ...settings, host: stripHostScheme(rawHost) })
        }
        onValuesChange={(change) => onConnectionChange({ ...settings, ...change })}
      />

      <div className="mb-3">
        <ConnectionFieldRow label={t('databases.fields.useHttps')} controlId={`${controlId}-https`}>
          <Switch
            id={`${controlId}-https`}
            checked={settings.isHttps}
            onChange={(event) =>
              ((isHttps) => onConnectionChange({ ...settings, isHttps }))(
                event.currentTarget.checked,
              )
            }
            size="xs"
          />
        </ConnectionFieldRow>
      </div>

      <AdvancedSettingsToggleComponent
        label={t('databases.edit.advancedSettings')}
        isShowAdvanced={isShowAdvanced}
        onToggle={() => setShowAdvanced(!isShowAdvanced)}
      />

      {isShowAdvanced && (
        <>
          <EditSshTunnelComponent
            sshTunnel={settings.sshTunnel}
            savedSshTunnel={savedSshTunnel}
            onChange={(sshTunnel) => onConnectionChange({ ...settings, sshTunnel })}
          />

          {!isRestore && (
            <ConnectionFieldRow
              label={t('databases.fields.excludeTables')}
              controlId={`${controlId}-exclude-tables`}
            >
              <div className="flex w-full items-center">
                <TagsInput
                  id={`${controlId}-exclude-tables`}
                  value={settings.excludeTables || []}
                  onChange={(values) =>
                    onNonConnectionChange({ ...settings, excludeTables: normalizeNameList(values) })
                  }
                  size="xs"
                  className="w-full max-w-[200px]"
                  placeholder={t('databases.edit.excludeTablesPlaceholder')}
                  splitChars={NAME_LIST_TOKEN_SEPARATORS}
                />

                <ConnectionFieldTooltip title={t('databases.edit.excludeTablesTooltip')} />
              </div>
            </ConnectionFieldRow>
          )}

          {settings.type === DatabaseType.MYSQL && !isRestore && (
            <div className="mb-2">
              <div className="mb-1 font-medium">{t('databases.fields.dumpOptions')}</div>

              {([
                {
                  key: 'isSkipEvents',
                  label: t('databases.edit.mysql.skipEvents'),
                  tooltip: t('databases.edit.mysql.skipEventsTooltip'),
                },
                {
                  key: 'isSkipRoutines',
                  label: t('databases.edit.mysql.skipRoutines'),
                  tooltip: t('databases.edit.mysql.skipRoutinesTooltip'),
                },
                {
                  key: 'isSkipTriggers',
                  label: t('databases.edit.mysql.skipTriggers'),
                  tooltip: t('databases.edit.mysql.skipTriggersTooltip'),
                },
              ] satisfies MysqlDumpOption[]).map((option) => (
                <div key={option.key} className="mb-1 flex items-center">
                  <Checkbox
                    id={`${controlId}-${option.key}`}
                    checked={settings[option.key] || false}
                    onChange={(event) =>
                      onNonConnectionChange({
                        ...settings,
                        [option.key]: event.currentTarget.checked,
                      })
                    }
                    label={<>{option.label}</>}
                  />

                  <ConnectionFieldTooltip title={option.tooltip} />
                </div>
              ))}
            </div>
          )}

          {settings.type === DatabaseType.MARIADB && !isRestore && (
            <ConnectionFieldRow
              label={t('databases.fields.excludeEvents')}
              controlId={`${controlId}-exclude-events`}
            >
              <div className="flex items-center">
                <Checkbox
                  id={`${controlId}-exclude-events`}
                  checked={settings.isExcludeEvents || false}
                  onChange={(e) =>
                    onNonConnectionChange({ ...settings, isExcludeEvents: e.target.checked })
                  }
                  label={<>{t('databases.edit.mariadb.skipEvents')}</>}
                />

                <ConnectionFieldTooltip title={t('databases.edit.mariadb.skipEventsTooltip')} />
              </div>
            </ConnectionFieldRow>
          )}

          {settings.type === DatabaseType.MARIADB && (
            <ConnectionFieldRow
              label={t('databases.fields.galeraReplication')}
              controlId={`${controlId}-galera`}
            >
              <div className="flex items-center">
                <Checkbox
                  id={`${controlId}-galera`}
                  checked={settings.isSkipGaleraDisable || false}
                  onChange={(e) =>
                    onNonConnectionChange({ ...settings, isSkipGaleraDisable: e.target.checked })
                  }
                  label={<>{t('databases.edit.mariadb.skipGaleraDisable')}</>}
                />

                <ConnectionFieldTooltip
                  title={t('databases.edit.mariadb.skipGaleraDisableTooltip')}
                />
              </div>
            </ConnectionFieldRow>
          )}
        </>
      )}
    </>
  );
};
