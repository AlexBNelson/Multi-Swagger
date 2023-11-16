import React from "react"
import PropTypes from "prop-types"
import { Map, List } from "immutable"
import { spec } from "../plugins/spec/selectors"
import { getExtensions, getSampleSchema, fromJSOrdered, stringify } from "core/utils"

export default class AuthorizeBtnClientContainer extends React.Component {

  static propTypes = {
    specActions: PropTypes.object.isRequired,
    specSelectors: PropTypes.object.isRequired,
    authActions: PropTypes.object.isRequired,
    authSelectors: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired,
    doc: PropTypes.string.isRequired
  }

  render () {
    const { authActions, authSelectors, specSelectors, getComponent} = this.props

    let clientJson = specSelectors.clientJson().get(this.props.doc)

    const securityDefinitions =fromJSOrdered(clientJson).get("securityDefinitions")
    
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
