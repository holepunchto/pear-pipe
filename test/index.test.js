'use strict'
const test = require('brittle')
const { spawn } = require('child_process')
const path = require('path')
const pipe = require('..')
const program = global.Bare ?? global.process
test('when spawned without fd 3, returns null', (t) => {
  t.is(pipe(), null)
})

test('when spawned with fd 3, returns a pipe', (t) => {
  const sp = spawn(
    program.argv[0],
    [path.join(__dirname, 'fixtures', 'echo.js')],
    {
      stdio: ['inherit', 'inherit', 'inherit', 'overlapped'],
      windowsHide: true
    }
  )
  t.teardown(() => sp.kill())
  t.plan(1)
  const pipe = sp.stdio[3]
  pipe.on('data', (data) => t.is(data.toString(), 'hello'))
  pipe.write('hello')
})

test('pipe.autoexit=true (default)', (t) => {
  t.plan(1)
  const sp = spawn(
    program.argv[0],
    [path.join(__dirname, 'fixtures', 'autoexit.js')],
    {
      stdio: ['inherit', 'inherit', 'inherit', 'overlapped'],
      windowsHide: true
    }
  )
  const pipe = sp.stdio[3]
  sp.on('exit', (code) => t.is(code, 0))
  pipe.end()
})

test('pipe.autoexit=false', (t) => {
  t.plan(1)
  const sp = spawn(
    program.argv[0],
    [path.join(__dirname, 'fixtures', 'graceful.js')],
    {
      stdio: ['inherit', 'inherit', 'inherit', 'overlapped'],
      windowsHide: true
    }
  )
  const pipe = sp.stdio[3]
  sp.on('exit', (code) => t.is(code, 0))
  pipe.end()
})

test('returns electron ipc pipe in renderer enviornment', (t) => {
  t.plan(1)
  const sp = spawn(
    program.argv[0],
    [path.join(__dirname, 'fixtures', 'renderer-pipe.js')],
    {
      stdio: ['inherit', 'inherit', 'inherit', 'overlapped'],
      windowsHide: true
    }
  )
  const pipe = sp.stdio[3]
  t.teardown(() => pipe.destroy())
  pipe.on('data', (data) => t.is(data.toString(), 'hello'))
  pipe.write('hello')
})

test('electron pipe can do consecutive writes', (t) => {
  t.plan(2)
  const sp = spawn(
    program.argv[0],
    [path.join(__dirname, 'fixtures', 'renderer-pipe.js')],
    {
      stdio: ['inherit', 'inherit', 'inherit', 'overlapped'],
      windowsHide: true
    }
  )
  const pipe = sp.stdio[3]
  t.teardown(() => pipe.destroy())
  pipe.on('data', (data) => {
    t.is(data.length, 32)
  })
  pipe.write(Buffer.alloc(32))
  setTimeout(() => pipe.write(Buffer.alloc(32)), 1000)
})
