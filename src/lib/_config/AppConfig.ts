import type { BaseSettingConfig } from '.';
import { DefaultBaseSettingConfig } from '.';

export interface AppConfig {
	base: BaseSettingConfig;
}

// 默认配置
export const DEFAULT_CONFIG: AppConfig = {
	base: DefaultBaseSettingConfig
};
