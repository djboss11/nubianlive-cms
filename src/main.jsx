import React from 'react'
import ReactDOM from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import Viewer from './Viewer.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-8ciepfl6pq1lh1g5.us.auth0.com"
      clientId="yCQZCXoDuVqHhfdnjwxTN29yGJvssNCw"
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
      <Viewer />
    </Auth0Provider>
  </React.StrictMode>
)
