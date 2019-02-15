
const http = require("http")
const url = require("url")
const StringDecoder = require("string_decoder").StringDecoder

const server = http.createServer((req, resp) => {
  const parsedUrl = url.parse(req.url, true)
  const path = parsedUrl.pathname
  const trimmedPath = path.replace(/\/+|\/+$/g, '')
  const method = req.method.toLowerCase()
  const queryStringObject = parsedUrl.query
  const headers = req.headers
  const decoder = new StringDecoder('utf-8')

  let payload = ""
  req.on('data', (data) => {
    payload += decoder.write(data)
  })

  req.on('end', () => {
    payload += decoder.end()
    const chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound
    const data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': payload
    }

    chosenHandler(data, (status, payload) => {
      status = typeof (status) == 'number' ? status : '200'
      payload = typeof (payload) == 'object' ? payload : {}
      const payloadString = JSON.stringify(payload)

      console.log("Status: ", status)
      console.log("Payload: ", payload)
      console.log("Payload String: ", payloadString)

      resp.setHeader('Content-Type', 'application/json')
      resp.writeHead(status)
      resp.end(payloadString)
    })
  })

})

server.listen(3000, () => {
  console.log("Server is listening on port: 3000")
})

let handlers = {}
handlers.hello = (data, callback) => {
  console.log("Data received:", data)
  callback(406, { 'message': "Hello There!" })
}
handlers.notFound = (data, callback) => {
  console.log("not found!")
  callback(404)
}

const router = {
  "hello": handlers.hello,
}