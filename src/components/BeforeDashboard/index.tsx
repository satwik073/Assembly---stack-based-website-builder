import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Welcome to your dashboard!</h4>
      </Banner>
      Here&apos;s what to do next:
      <ul className={`${baseClass}__instructions`}>
        <li>
          <SeedButton />
          {' with sample content, then '}
          <a href="/" target="_blank">
            visit your site
          </a>
          {' to see the results.'}
        </li>
        <li>
          Edit collections and fields in the sidebar to shape your content model.
        </li>
        <li>
          Commit and push your changes to trigger a redeploy when ready.
        </li>
      </ul>
    </div>
  )
}

export default BeforeDashboard
