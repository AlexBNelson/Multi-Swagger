import React from "react"
import PropTypes from "prop-types"
import { Map, List } from "immutable"

export default class AuthorizeBtnContainer extends React.Component {

  static propTypes = {
    specActions: PropTypes.object.isRequired,
    specSelectors: PropTypes.object.isRequired,
    authActions: PropTypes.object.isRequired,
    authSelectors: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired
  }

  render () {
    const { authActions, authSelectors, specSelectors, getComponent} = this.props
    
    const securityDefinitions =specSelectors.spec().get("securityDefinitions")
    
    let definitions = securityDefinitions || Map({})
    let authorizableDefinitions = List()

    //todo refactor
    definitions.entrySeq().forEach( ([ key, val ]) => {
      let map = Map()

      map = map.set(key, val)
      authorizableDefinitions = authorizableDefinitions.push(map)
    })

    const AuthorizeBtn = getComponent("authorizeBtn")

    return securityDefinitions ? (
      <AuthorizeBtn
        onClick={() => authActions.showDefinitions(authorizableDefinitions)}
        isAuthorized={!!authSelectors.authorized().size}
        showPopup={!!authSelectors.shownDefinitions()}
        getComponent={getComponent}
      />
    ) : null
  }
}
