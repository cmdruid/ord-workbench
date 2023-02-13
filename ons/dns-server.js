#!/usr/bin/env node

const fs = require('fs')
const rc = require('rc')
const dgram = require('dgram')
const packet = require('native-dns-packet')
const wildcard = require('wildcard2')

records = {
  1: 'A',
  2: 'NS',
  5: 'CNAME',
  6: 'SOA',
  12: 'PTR',
  15: 'MX',
  16: 'TXT',
  28: 'AAAA'
}

listAnswer = function (response) {
  const results = []
  const res = packet.parse(response)
  res.answer.map(function (r) {
    results.push(r.address || r.data)
  })
  return results.join(', ') || 'nxdomain'
}

createAnswer = function (query, answer) {
  query.header.qr = 1
  query.header.rd = 1
  query.header.ra = 1
  query.answer.push({ name: query.question[0].name, type: 1, class: 1, ttl: 30, address: answer })

  const buf = Buffer.alloc(4096)
  const wrt = packet.write(buf, query)
  const res = buf.slice(0, wrt)

  return res
}

const defaults = {
  port: 53,
  host: '127.0.0.1',
  logging: 'dnsproxy:query,dnsproxy:info',
  nameservers: [
    '1.1.1.1',
    '1.0.0.1'
  ],
  servers: {},
  domains: {
    "crazyostrich19.ord": "127.0.0.1" // TODO READ FROM an api or database
  },
  hosts: {
    devlocal: '127.0.0.1'
  },
  fallback_timeout: 350,
  reload_config: true
}

let config = rc('dnsproxy', defaults)

process.env.DEBUG_FD = process.env.DEBUG_FD || 1
process.env.DEBUG = process.env.DEBUG || config.logging
const d = process.env.DEBUG.split(',')
d.push('dnsproxy:error')
process.env.DEBUG = d.join(',')

const loginfo = require('debug')('dnsproxy:info')
const logdebug = require('debug')('dnsproxy:debug')
const logquery = require('debug')('dnsproxy:query')
const logerror = require('debug')('dnsproxy:error')

if (config.reload_config === true && typeof config.config !== 'undefined') {
  var configFile = config.config
  fs.watchFile(configFile, function (curr, prev) {
    loginfo('config file changed, reloading config options')
    try {
      config = rc('dnsproxy', defaults)
    } catch (e) {
      logerror('error reloading configuration')
      logerror(e)
    }
  })
}

logdebug('options: %j', config)

const server = dgram.createSocket('udp4')

server.on('listening', function () {
  loginfo('we are up and listening at %s on %s', config.host, config.port)
})

server.on('error', function (err) {
  logerror('udp socket error')
  logerror(err)
})

server.on('message', function (message, rinfo) {
  let returner = false
  let nameserver = config.nameservers[0]

  const query = packet.parse(message)
  const domain = query.question[0].name
  const type = query.question[0].type

  logdebug('query: %j', query)

  Object.keys(config.hosts).forEach(function (h) {
    if (domain === h) {
      let answer = config.hosts[h]
      if (typeof config.hosts[config.hosts[h]] !== 'undefined') {
        answer = config.hosts[config.hosts[h]]
      }

      logquery('type: host, domain: %s, answer: %s, source: %s:%s, size: %d', domain, config.hosts[h], rinfo.address, rinfo.port, rinfo.size)

      const res = createAnswer(query, answer)
      server.send(res, 0, res.length, rinfo.port, rinfo.address)

      returner = true
    }
  })

  if (returner) {
    return
  }

  Object.keys(config.domains).forEach(function (s) {
    const sLen = s.length
    const dLen = domain.length

    if ((domain.indexOf(s) >= 0 && domain.indexOf(s) === (dLen - sLen)) || wildcard(domain, s)) {
      let answer = config.domains[s]
      if (typeof config.domains[config.domains[s]] !== 'undefined') {
        answer = config.domains[config.domains[s]]
      }

      logquery('type: server, domain: %s, answer: %s, source: %s:%s, size: %d', domain, config.domains[s], rinfo.address, rinfo.port, rinfo.size)

      const res = createAnswer(query, answer)
      server.send(res, 0, res.length, rinfo.port, rinfo.address)

      returner = true
    }
  })

  if (returner) {
    return
  }

  Object.keys(config.servers).forEach(function (s) {
    if (domain.indexOf(s) !== -1) {
      nameserver = config.servers[s]
    }
  })
  const nameParts = nameserver.split(':')
  nameserver = nameParts[0]
  const port = nameParts[1] || 53
  let fallback
  (function queryns (message, nameserver) {
    const sock = dgram.createSocket('udp4')
    sock.send(message, 0, message.length, port, nameserver, function () {
      fallback = setTimeout(function () {
        queryns(message, config.nameservers[0])
      }, config.fallback_timeout)
    })
    sock.on('error', function (err) {
      logerror('Socket Error: %s', err)
      process.exit(5)
    })
    sock.on('message', function (response) {
      clearTimeout(fallback)
      logquery('type: primary, nameserver: %s, query: %s, type: %s, answer: %s, source: %s:%s, size: %d', nameserver, domain, records[type] || 'unknown', listAnswer(response), rinfo.address, rinfo.port, rinfo.size)
      server.send(response, 0, response.length, rinfo.port, rinfo.address)
      sock.close()
    })
  }(message, nameserver))
})

server.bind(config.port, config.host)
