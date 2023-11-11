import layout from "./layout"
import ClientWrapper from "./client-wrapper"
import ClientTagWrapper from "./client-tag-wrapper"

export default function() {
  return [layout, {
    statePlugins: {
      configs: {
        wrapActions: {
          loaded: (ori, system) => (...args) => {
            ori(...args)
            // location.hash was an UTF-16 String, here is required UTF-8
            const hash = decodeURIComponent(window.location.hash)
            system.layoutActions.parseDeepLinkHash(hash)
          }
        }
      }
    },
    wrapComponents: {
      client: ClientWrapper,
      ClientTag: ClientTagWrapper,
    },
  }]
}
