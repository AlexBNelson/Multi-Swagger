import React from "react"
import PropTypes from "prop-types"
import { Map } from "immutable"

export default class SchemesContainer extends React.Component {

  static propTypes = {
    specActions: PropTypes.object.isRequired,
    specSelectors: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired
  }

  render () {
    const {specActions, specSelectors, getComponent} = this.props

    const currentScheme = specSelectors.operationScheme()
    const schemes = specSelectors.spec().get("schemes", Map())

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
