import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { isAdminSite } from './utils/adminSite'

// Mount previews without the providers that fetch live account or content data.
const Root = isAdminSite() && new URLSearchParams(window.location.search).get('arpc-hero-preview') === '1'
  ? lazy(() => import('./Components/HeroPreviewPage.jsx'))
  : isAdminSite() && new URLSearchParams(window.location.search).get('arpc-website-preview') === '1'
    ? lazy(() => import('./Components/WebsitePreviewPage.jsx'))
    : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={null}><Root /></Suspense>
  </StrictMode>,
)
