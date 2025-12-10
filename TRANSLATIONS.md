# Translations / 翻译

## Overview

SurfSense 支持多语言界面，目前提供英语和简体中文版本。

SurfSense supports multiple language interfaces, currently providing English and Simplified Chinese versions.

## Available Languages / 可用语言

- **English (en)** - Default language
- **简体中文 (zh)** - Simplified Chinese

## Translation Files / 翻译文件

Translation files are located in:
翻译文件位于：

```
surfsense_web/messages/
├── en.json  # English translations
└── zh.json  # Simplified Chinese translations
```

## Community Translations / 社区翻译

We acknowledge and appreciate the community translation efforts:

感谢社区翻译贡献：

- **Community Translation Project**: [Gitee Translation Repository](https://gitee.com/mail_osc/translate)
  - 社区翻译项目：[Gitee 翻译仓库](https://gitee.com/mail_osc/translate)

## Contributing Translations / 贡献翻译

If you would like to contribute or improve translations:

如果您想贡献或改进翻译：

1. **For Chinese translations / 中文翻译**:
   - Visit the community translation project on Gitee
   - 访问 Gitee 上的社区翻译项目
   - URL: https://gitee.com/mail_osc/translate

2. **For other languages / 其他语言**:
   - Fork this repository
   - Add your language code to `surfsense_web/i18n/routing.ts`
   - Create a new JSON file in `surfsense_web/messages/[locale].json`
   - Submit a pull request

## Translation Guidelines / 翻译指南

When contributing translations, please:

贡献翻译时，请：

- Maintain consistent terminology / 保持术语一致性
- Keep the same JSON structure / 保持相同的 JSON 结构
- Test translations in the UI / 在界面中测试翻译
- Follow locale-specific conventions / 遵循本地化惯例

## Technical Details / 技术细节

This project uses [next-intl](https://next-intl-docs.vercel.app/) for internationalization.

本项目使用 [next-intl](https://next-intl-docs.vercel.app/) 进行国际化。

### Configuration files / 配置文件:
- `surfsense_web/i18n/routing.ts` - Locale routing configuration
- `surfsense_web/i18n/request.ts` - Request configuration for i18n
- `surfsense_web/contracts/enums/languages.ts` - Language options for LLM responses

## Credits / 致谢

Special thanks to all contributors to the translation efforts, including:

特别感谢所有翻译工作的贡献者，包括：

- Community translators on Gitee / Gitee 上的社区翻译者
- Contributors to this repository / 本仓库的贡献者

---

For questions about translations, please open an issue or contact the maintainers.

有关翻译的问题，请提交 issue 或联系维护者。
