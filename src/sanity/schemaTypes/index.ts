import { blockContent } from './blockContent'
import { pageBuilder } from './pageBuilder'
import { pageContent } from './pageContent'
import { sectionStyle } from './sectionStyle'
import { siteSettings } from './siteSettings'
import { sectionTypes } from './sections'

export const schemaTypes = [
  pageContent,
  pageBuilder,
  blockContent,
  siteSettings,
  sectionStyle,
  ...sectionTypes,
]
