import React from "react"
import PropTypes from "prop-types"
import Im from "immutable"
import { fromJSOrdered  } from "core/utils"
import { fromJS, Map } from "immutable"
import SwaggerLogo from "./swagger.svg"
import MongoLogo from "./mongoLogo.svg"
import SQLLiteLogo from "./sqllite.svg"


export default class ConnectedService extends React.Component {

  constructor(){
    super();
  }


  static propTypes = {
    specSelectors: PropTypes.object.isRequired,
    specActions: PropTypes.object.isRequired,
    oas3Actions: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired,
    oas3Selectors: PropTypes.func.isRequired,
    layoutSelectors: PropTypes.object.isRequired,
    layoutActions: PropTypes.object.isRequired,
    authActions: PropTypes.object.isRequired,
    authSelectors: PropTypes.object.isRequired,
    getConfigs: PropTypes.func.isRequired,
    fn: PropTypes.func.isRequired
  }



  renderLogo(type) {
    switch(type) {
  
        case "mongodb":   return MongoLogo;
        case "sqlite":   return SQLLiteLogo;
      }
  }
  render() {

    let {
        method,
        type,
        getComponent
      } = this.props

    const OperationSummaryMethod = this.props.getComponent("OperationSummaryMethod")
    const OperationSummaryPath = this.props.getComponent("OperationSummaryPath")

      const logo = this.renderLogo(type)

    return(
        <div className={false ? "opblock opblock-deprecated" : true ? `opblock opblock-get is-open` : `opblock opblock-get`} >
          <div className={`opblock-summary opblock-summary-get`} >
        <button
          className="opblock-summary-control"
        >
          <img style={{height:"30px"}} src={logo}/>
          <span className="opblock-summary-path"  >&nbsp;{method}</span>
         
        </button>

      </div>
          
        </div>
    )
  }

}

ConnectedService.propTypes = {
  layoutActions: PropTypes.object.isRequired,
  specSelectors: PropTypes.object.isRequired,
  specActions: PropTypes.object.isRequired,
  layoutSelectors: PropTypes.object.isRequired,
  getComponent: PropTypes.func.isRequired,
  fn: PropTypes.object.isRequired
}
