describe('Multi Swagger Home', () => {
  it('Visits multi swagger homepage', () => {
    cy.visit('http://localhost:3200/')
  })
})

describe('Shows service link', () => {
  it('Shows service link', () => {
    cy.visit('http://localhost:3200/')

    cy.contains('RoomServiceApi').click()
  })
})


describe('Service page contains client and controllers sections', () => {
  it('Service page contains client and controllers sections', () => {
    cy.visit('http://localhost:3200/')

    cy.contains('RoomServiceApi').click()

    cy.contains('Clients')
    cy.contains('Controllers')
  })
})


describe('Service page contains displays operation component correctly', () => {
  it('Service page contains client and controllers sections', () => {
    cy.visit('http://localhost:3200/')

    cy.contains('RoomServiceApi').click()

    cy.contains('/stockInventoryEnhanced').click()

    cy.contains('Try it out')
    cy.contains('Responses')
  })
})


describe('Clicking home page works correctly', () => {
  it('Clicking home page works correctly', () => {
    cy.visit('http://localhost:3200/')

    cy.contains('RoomServiceApi').click()

    cy.get('[id^=homeButton]').click()

    cy.contains('StockKeepingApi')
    cy.contains('DeliveryApi')
    cy.contains('KeyReader')
  })
})

describe('Service page without endpoints shows correct message', () => {
  it('Service page without endpoints shows correct message', () => {
    cy.visit('http://localhost:3200/')

    cy.contains('KeyReader').click()
    cy.contains('No operations defined in spec!')
    cy.contains(' CleaningSchedulingService')
  })
})

describe('Clicking spec link shows spec', () => {
  it('Clicking spec link shows spec', () => {
    cy.visit('http://localhost:3200/')

    cy.contains('RoomServiceApi').click()

    cy.contains('http://localhost:8521/RoomServiceApi.json').click()
    // cy.fixture('roomServiceApi.json')
    // .then( car => {
    //   expect(car.openapi).to.eq("3.0.1")
    // })
  })
})


describe('Can click on authorize button', () => {
  it('Can click on authorize button', () => {
    cy.visit('http://localhost:3200/')

    cy.contains('RoomServiceApi').click()

    cy.contains('Authorize').click()
    cy.contains('Available authorizations')
  })
})

describe('Authorize endpoint', () => {
  it('Shows service link', () => {
    cy.visit('http://localhost:3200/')

    cy.visit('http://localhost:3200/')

    cy.contains('RoomServiceApi').click()

    cy.contains('Authorize').click()

    cy.get('input').eq(5).type('blah')

    cy.contains('Authorize').click()

    cy.get('.close-modal').click()

    cy.get('.authorization__btn').click()
    
    cy.contains('Available authorizations')
  })
})

describe('Get service description', () => {
  it('Shows service link', () => {
    cy.visit('http://localhost:3200/')

    cy.contains('RoomServiceApi').click()

    cy.contains('This is a sample server Petstore server')
  })
})






