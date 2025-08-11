'use strict'
const test = require('brittle')
const { spawn } = require('bare-subprocess')
const path = require('bare-path')
const pipe = require('..')

test('when spawned without fd 3, returns null', (t) => {
  t.is(pipe(), null)
})

test('when spawned with fd 3, returns a pipe', (t) => {
  const sp = spawn(global.Bare.argv[0], [path.join(__dirname, 'fixtures', 'echo.js')], {
    stdio: ['inherit', 'inherit', 'inherit', 'overlapped'],
    windowsHide: true
  })
  t.teardown(() => sp.kill())
  t.plan(1)
  const pipe = sp.stdio[3]
  pipe.on('data', (data) => t.is(data.toString(), 'hello'))
  pipe.write('hello')
})

test('pipe.autoexit=true (default)', (t) => {
  t.plan(1)
  const sp = spawn(global.Bare.argv[0], [path.join(__dirname, 'fixtures', 'autoexit.js')], {
    stdio: ['inherit', 'inherit', 'inherit', 'overlapped'],
    windowsHide: true
  })
  const pipe = sp.stdio[3]
  sp.on('exit', (code) => t.is(code, 0))
  pipe.end()
})

test('pipe.autoexit=false', (t) => {
  t.plan(1)
  const sp = spawn(global.Bare.argv[0], [path.join(__dirname, 'fixtures', 'graceful.js')], {
    stdio: ['inherit', 'inherit', 'inherit', 'overlapped'],
    windowsHide: true
  })
  const pipe = sp.stdio[3]
  sp.on('exit', (code) => t.is(code, 0))
  pipe.end()
})
