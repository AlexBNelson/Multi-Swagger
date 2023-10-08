import React from "react"
import PropTypes from "prop-types"


export default class ConnectedServices extends React.Component {

  constructor(){
    super();
    this.state = {connectedServices: {} };
  }

  componentDidMount () {

    let connectedServices = ""
    
    
    let toNullCheck = JSON.parse(this.props.specSelectors.manifest())["Services"].find(service => service.Name === this.props.specSelectors.currentDoc())
    
    
    if(toNullCheck !=undefined){
      if("ConnectedServices" in toNullCheck){
        connectedServices = JSON.parse(this.props.specSelectors.manifest())["Services"].find(service => service.Name === this.props.specSelectors.currentDoc())["ConnectedServices"]
      }
    }
    
    
    
    
    
    
        let clientData =[]
    
            let connectedServicesUrl = this.props.specSelectors.baseUrl()+ "/" + this.props.specSelectors.currentDoc() + "/" + connectedServices
    

            console.log(connectedServicesUrl)
            fetch(connectedServicesUrl)
              .then( response => response.json())
              .then(json => {
                
                clientData.push(json)
  
                this.setState({connectedServices: json})
              }).catch((error) => {
                console.log(error)
              });
       
    
    
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


  render() {
    const {
      specSelectors,
      getComponent,
      oas3Selectors,
      layoutSelectors,
      layoutActions,
      getConfigs,
    } = this.props


    const ConnectedService = getComponent("connectedService")

    let connectServiceComponent = <div></div>

    let connectedServiceList = []
    
    if(this.state.connectedServices["dependencies"] != undefined){

      let keys = Object.keys(this.state.connectedServices["dependencies"])

      

      keys.forEach((key)=>{
        connectedServiceList.push(<ConnectedService
          method={this.state.connectedServices["dependencies"][key]["connectionId"]}
          type={this.state.connectedServices["dependencies"][key]["type"]}
          getComponent={getComponent}
          />)
      })
      
    }
    
    return(
      <div>
        <h1 fontWeight='bold'> Connected Services</h1>
        {connectedServiceList}
      </div>
      
    )
  }

}

ConnectedServices.propTypes = {
  layoutActions: PropTypes.object.isRequired,
  specSelectors: PropTypes.object.isRequired,
  specActions: PropTypes.object.isRequired,
  layoutSelectors: PropTypes.object.isRequired,
  getComponent: PropTypes.func.isRequired,
  fn: PropTypes.object.isRequired
}
