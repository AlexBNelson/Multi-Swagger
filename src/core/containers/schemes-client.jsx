import React from "react"
import PropTypes from "prop-types"
import { Map } from "immutable"
import { getExtensions, getSampleSchema, fromJSOrdered, stringify } from "core/utils"

export default class SchemesClientContainer extends React.Component {

  static propTypes = {
    specActions: PropTypes.object.isRequired,
    specSelectors: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired,
    doc: PropTypes.string.isRequired
  }

  render () {
    const {specActions, specSelectors, getComponent} = this.props

    const currentScheme = specSelectors.operationScheme()

    
    let clientJson = specSelectors.clientJson().get(this.props.doc)

    const schemes =fromJSOrdered(clientJson).get("schemes", Map())

    const Schemes = getComponent("schemes")

    const schemesArePresent = schemes && schemes.size

    return schemesArePresent ? (
        <Schemes
          currentScheme={currentScheme}
          schemes={schemes}
          specActions={specActions}
        />
      ) : null
  }
}
