import '@cypress/code-coverage/support'


module.exports = (on, config) => {
    on('task', require('@cypress/code-coverage/task'))
}