const express = require('express')
const server = require('http').createServer()
const WebSocketServer = require('ws').Server
const sqlite = require('sqlite3')

const app = express()
const wss = new WebSocketServer({ server })
let db

// Express setup
app.get('/', (req, res) => {
	res.sendFile('index.html', { root: __dirname })
})

server.on('request', app)
server.listen(3000, () => console.log('Server started on port 3000'))

// WebSocket section
wss.on('connection', (ws) => {
	const numClients = wss.clients.size
	console.log('Clients connected:', numClients)

	wss.broadcast(`Current visitors: ${numClients}`)

	if (ws.readyState === ws.OPEN) {
		ws.send('Welcome to my server')
	}

	db.run(`INSERT INTO visitors (count, time)
			VALUES (${numClients}, datetime('now'))
	`)

	ws.on('close', () => {
		console.log('A client has disconnected')
		wss.broadcast(`Current visitors: ${numClients}`)
	})
})

wss.broadcast = (data) => {
	wss.clients.forEach((client) => {
		client.send(data)
	})
}

// Database setup
db = new sqlite.Database(':memory:')
db.serialize(() => {
	db.run(`
		CREATE TABLE visitors (
			count INTEGER,
			time TEXT
		)
	`)
})

function getCounts() {
	db.each('SELECT * FROM visitors', (err, row) => {
		console.log(row)
	})
}

function shutdownDB() {
	console.log('Shutting down db')
	getCounts()
	db.close()
}

// Process Handling
process.on('SIGINT', () => {
	wss.clients.forEach((client) => {
		client.close()
	})
	server.close(() => {
		shutdownDB()
	})
})
