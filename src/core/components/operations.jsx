import React from "react"
import PropTypes from "prop-types"
import Im from "immutable"
import { Map } from "immutable"
import SwaggerLogo from "./swagger.svg"

const SWAGGER2_OPERATION_METHODS = [
  "get", "put", "post", "delete", "options", "head", "patch"
]

const OAS3_OPERATION_METHODS = SWAGGER2_OPERATION_METHODS.concat(["trace"])


export default class Operations extends React.Component {

  constructor(){
    super()
    this.state = {consumers: Map() }
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

  componentDidMount(){
    let services = JSON.parse(this.props.specSelectors.manifest())["Services"]


    services.forEach((service)=>{
      let clients = service["Clients"]


      if(clients !=null){

        clients.forEach((client)=>{
          let clientUrl = this.props.specSelectors.baseUrl()+ "/" + client + ".json"

          fetch(clientUrl)
            .then( response => response.json()
              .then(json => {

                


                Object.values(json["paths"]).forEach((path)=>{
                  Object.values(path).forEach((method)=>{

                    let opConsumers = this.state.consumers.get(method["operationId"])
                    
                    if(opConsumers == undefined){
                      this.setState({consumers: this.state.consumers.set(method["operationId"],[service])})
                    }
                    else{
                      opConsumers.push(service)

                      this.setState({consumers: this.state.consumers.set(method["operationId"], opConsumers)})
                    }
                  })
                })
            }))
        })
      }
    })
  }

  render() {
    let {
      specSelectors,
    } = this.props

    const taggedOps = specSelectors.taggedOperations()


    if(taggedOps.size === 0) {
      return <h3> No operations defined in spec!</h3>
    }


    let ops = taggedOps.map(this.renderOperationTag).toArray()

    return (
      <div>
        <h1>Controllers</h1>
        { ops }
        { taggedOps.size < 1 ? <h3> No operations defined in spec! </h3> : null }
      </div>
    )
  }

  renderOperationTag = (tagObj, tag) => {
    const {
      specSelectors,
      getComponent,
      oas3Selectors,
      layoutSelectors,
      layoutActions,
      getConfigs,
    } = this.props

    const OperationContainer = getComponent("OperationContainer", true)
    const OperationTag = getComponent("OperationTag")
    const operations = tagObj.get("operations")
    const AuthorizeBtnContainer = getComponent("AuthorizeBtnContainer", true)
    let Col = getComponent("Col")
    const SchemesContainer = getComponent("SchemesContainer", true)

    const hasServers = specSelectors.servers() && specSelectors.servers().size
    const hasSchemes = specSelectors.spec().get("schemes", Map()) && specSelectors.spec().get("schemes", Map()).size
    const hasSecurityDefinitions = !!specSelectors.spec().get("securityDefinitions")

      let endpointLinks = []
      let alreadyAddedLinks = []

    return (
      <div>
              <Col style={{alignItems:"flex-end", display:"flex"}} className="schemes wrapper" mobile={12}>
                {/* {hasServers ? (<ServersContainer />) : null} */}
                {hasSchemes ? (<SchemesContainer />) : null}
                {hasSecurityDefinitions ? (<AuthorizeBtnContainer />) : null}
              </Col>
      <OperationTag
        tagObj={tagObj}
        tag={tag}
        oas3Selectors={oas3Selectors}
        layoutSelectors={layoutSelectors}
        layoutActions={layoutActions}
        getConfigs={getConfigs}
        getComponent={getComponent}
        specUrl={specSelectors.url()}>
          
        <div className="operation-tag-content">
          {
            operations.map(op => {
              const path = op.get("path")
              const method = op.get("method")
              const specPath = Im.List(["paths", path, method])

              let opId = op.get("operation").get("operationId")

           

              

              let consumerOpId = this.state.consumers.get(opId)


              if(consumerOpId != undefined){

                this.state.consumers.get(opId).forEach((endpoint)=>{

                  let endpointUrl = specSelectors.baseUrl() + "/" + endpoint["Name"] + ".json"

                  let button = <p><a onClick={(e)=>{
                      e.stopPropagation()
  
                      this.props.specActions.download(endpointUrl)
                        this.props.specActions.setCurrentDoc(endpoint["Name"])
                      }
              
              
                    }><img src={SwaggerLogo} style={{
                      width: 15,
                      height: 15}} />&nbsp;&nbsp;{endpoint["Name"]}</a></p>
                      
                      if(!alreadyAddedLinks.includes(endpoint["Name"])){
                          
                         endpointLinks.push(button)

                      }
                      alreadyAddedLinks.push(endpoint["Name"])
                  }
  
                  )
              }
              
              
              
              

              // FIXME: (someday) this logic should probably be in a selector,
              // but doing so would require further opening up
              // selectors to the plugin system, to allow for dynamic
              // overriding of low-level selectors that other selectors
              // rely on. --KS, 12/17
              const validMethods = specSelectors.isOAS3() ?
                OAS3_OPERATION_METHODS : SWAGGER2_OPERATION_METHODS

              if (validMethods.indexOf(method) === -1) {
                return null
              }

              return (
                <div>
                
                <OperationContainer
                  key={`${path}-${method}`}
                  specPath={specPath}
                  op={op}
                  path={path}
                  method={method}
                  tag={tag}>
                  </OperationContainer>
                  </div>
              )
            }).toArray()
          }
        </div>
        {endpointLinks}
      </OperationTag>
      </div>
    )
  }

}

Operations.propTypes = {
  layoutActions: PropTypes.object.isRequired,
  specSelectors: PropTypes.object.isRequired,
  specActions: PropTypes.object.isRequired,
  layoutSelectors: PropTypes.object.isRequired,
  getComponent: PropTypes.func.isRequired,
  fn: PropTypes.object.isRequired
}
